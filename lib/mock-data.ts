import type { ArtifactDemo, Issue } from "@/types/artifact";
const original = `import jwt from "jsonwebtoken";

type Context = {
  headers: Record<string, string>;
  user?: unknown;
};

type AuthConfig = { secret: string };

export function createAuthGate(config: AuthConfig) {
  const strategies: Record<string, any> = {
    bearer: {
      extract: (ctx: Context) =>
        ctx.headers.authorization?.split(" ")[1],
      verify: (token: string) =>
        jwt.verify(token, config.secret),
    },
  };

  return function run(ctx: Context) {
    const key = ctx.headers["x-auth-strategy"] || "bearer";
    const strategy = strategies[key];
    const token = strategy.extract(ctx);
    try {
      const data = strategy.verify(token);
      return Promise.resolve({
        ...ctx, user: data, meta: { strategy: key },
      });
    } catch {
      throw new Error("Authentication failed");
    }
  };
}`;
const reconstructed = `import jwt, { type JwtPayload } from "jsonwebtoken";

type Context = {
  headers: Record<string, string>;
  user?: string | JwtPayload;
};

type AuthConfig = { secret: string };

// One strategy. One explicit authentication boundary.
export function createAuthGate(config: AuthConfig) {
  return async function authenticate(ctx: Context) {
    const authorization = ctx.headers.authorization;
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : undefined;

    if (!token) {
      throw new Error("Bearer token is required");
    }

    try {
      const user = jwt.verify(token, config.secret);
      return { ...ctx, user, meta: { strategy: "bearer" } };
    } catch {
      throw new Error("Authentication failed");
    }
  };
}`;
const codeIssues: Issue[] = [
  {
    id: "HL-CODE-004",
    title: "Over-Abstraction",
    severity: "high",
    confidence: 87,
    explanation:
      "A strategy registry and factory surround a single bearer-token path. Readers must resolve an indirection that currently adds no second behavior.",
    evidence: {
      file: "src/auth/gate.ts",
      location: "L10–18",
      excerpt:
        "const strategies: Record<string, any> = {\n  bearer: { extract: ..., verify: ... }\n};",
      observation:
        "Only one strategy is defined, yet every request selects it dynamically.",
    },
    whyItMatters:
      "The abstraction hides the authentication boundary and makes a small change require tracing several layers.",
    reconstruction:
      "Keep the exported createAuthGate interface, but use one explicit bearer-token path. Reintroduce a registry only when another concrete strategy exists.",
  },
  {
    id: "HL-CODE-007",
    title: "Unbounded Strategy Selection",
    severity: "high",
    confidence: 94,
    explanation:
      "The request chooses a strategy through a header without checking whether that strategy exists.",
    evidence: {
      file: "src/auth/gate.ts",
      location: "L21–23",
      excerpt:
        'const key = ctx.headers["x-auth-strategy"] || "bearer";\nconst strategy = strategies[key];\nconst token = strategy.extract(ctx);',
      observation:
        "A missing registry entry would be dereferenced before the try block.",
    },
    whyItMatters:
      "The error boundary cannot explain or normalize a failed lookup. Reviewers may mistake this for intentional extensibility.",
    reconstruction:
      "Remove dynamic selection for the single-strategy design, or validate the key against an explicit allowlist.",
  },
  {
    id: "HL-CODE-002",
    title: "Implicit Error Contract",
    severity: "medium",
    confidence: 91,
    explanation:
      "The factory can throw synchronously and can also return a resolved promise. Callers must reason about two failure shapes.",
    evidence: {
      file: "src/auth/gate.ts",
      location: "L25–30",
      excerpt:
        'return Promise.resolve({ ...ctx, user: data });\n// Elsewhere: throw new Error("Authentication failed");',
      observation:
        "The proposed reconstruction uses an async boundary, which changes synchronous throw behavior.",
    },
    whyItMatters:
      "Changing this boundary may affect callers. Better readability is not evidence of semantic equivalence.",
    reconstruction:
      "Document the error contract and review the async change against existing callers before applying it.",
  },
  {
    id: "HL-CODE-009",
    title: "Lost Type Information",
    severity: "medium",
    confidence: 96,
    explanation:
      "The registry uses any, removing useful guarantees about token extraction and verification.",
    evidence: {
      file: "src/auth/gate.ts",
      location: "L11",
      excerpt: "const strategies: Record<string, any> = {",
      observation: "any bypasses checks for extract and verify.",
    },
    whyItMatters:
      "Readers cannot use types to learn the strategy interface, and missing members can go unnoticed.",
    reconstruction:
      "Replace any with an explicit strategy type, or remove the registry in the single-strategy proposal.",
  },
  {
    id: "HL-CODE-011",
    title: "Ambiguous Local Names",
    severity: "medium",
    confidence: 82,
    explanation:
      "run, key, and data express mechanics but not the authentication responsibilities.",
    evidence: {
      file: "src/auth/gate.ts",
      location: "L20–25",
      excerpt:
        "return function run(ctx: Context) {\n  const key = ...;\n  const data = strategy.verify(token);",
      observation:
        "The names require tracing their definitions to infer their roles.",
    },
    whyItMatters:
      "Vague names slow code review and hide the meaning of values crossing the boundary.",
    reconstruction:
      "Use authenticate, strategyName, and user where those meanings are supported by the surrounding code.",
  },
  {
    id: "HL-CODE-013",
    title: "Missing Boundary Commentary",
    severity: "low",
    confidence: 73,
    explanation:
      "The factory does not explain whether the registry is an extension point or an incidental implementation detail.",
    evidence: {
      file: "src/auth/gate.ts",
      location: "L10",
      excerpt: "export function createAuthGate(config: AuthConfig) {",
      observation:
        "The public factory has no note about its supported strategy or error behavior.",
    },
    whyItMatters:
      "Future maintainers may preserve unnecessary indirection because its intent is unclear.",
    reconstruction:
      "Add one short comment that states the current boundary and supported behavior; avoid narrating every line.",
  },
];
const code: ArtifactDemo = {
  kind: "code",
  name: "auth-service",
  subtitle: "TypeScript · 7 files · Sample artifact",
  language: "typescript",
  originalFile: "src/auth/gate.ts",
  readability: 62,
  metrics: [
    {
      label: "Structure",
      value: 71,
      description:
        "Responsibilities have boundaries, but the strategy layer adds indirection.",
    },
    {
      label: "Clarity",
      value: 58,
      description: "Names and implicit contracts increase the reading effort.",
    },
    {
      label: "Maintainability",
      value: 64,
      description: "Small changes cross more layers than necessary.",
    },
    {
      label: "Consistency",
      value: 79,
      description:
        "The sample mostly follows one convention for modules and types.",
    },
  ],
  headline: "Readable in parts. Harder to follow as a whole.",
  summary:
    "The main authentication path is present, but repeated extension points obscure a relatively small responsibility.",
  pattern: "Iterative AI Expansion",
  patternExplanation:
    "A small goal appears to have grown through successive additions of extensibility layers. This is one plausible interpretation of the sample, not a claim about how it was generated.",
  confidence: 84,
  reconstructedIntent:
    "Authenticate API requests with bearer tokens while keeping verification reusable across routes.",
  issues: codeIssues,
  logic: [
    {
      id: "goal",
      title: "Original Goal",
      category: "RECONSTRUCTED INTENT",
      description: "Protect authenticated API requests.",
      evidence: "README.md · stated requirement",
      confidence: 88,
      x: 0,
      y: 30,
    },
    {
      id: "authentication",
      title: "Authentication",
      category: "RESPONSIBILITY",
      description: "Establish a request-level identity boundary.",
      evidence: "auth/gate.ts · L10",
      confidence: 93,
      x: 320,
      y: 30,
    },
    {
      id: "jwt",
      title: "JWT Strategy",
      category: "DESIGN DECISION",
      description: "Extract a bearer token and verify its signature.",
      evidence: "auth/gate.ts · L11–18",
      confidence: 96,
      x: 640,
      y: 30,
    },
    {
      id: "middleware",
      title: "Middleware",
      category: "INTEGRATION",
      description: "Make identity available before route handling.",
      evidence: "middleware.ts · sample module role",
      confidence: 80,
      x: 640,
      y: 280,
    },
    {
      id: "routes",
      title: "API Routes",
      category: "OUTCOME",
      description: "Use the identity boundary across protected routes.",
      evidence: "routes/profile.ts · sample module role",
      confidence: 81,
      x: 320,
      y: 280,
    },
  ],
  structure: [
    {
      name: "auth-service",
      type: "folder",
      depth: 0,
      role: "Sample repository",
    },
    { name: "src", type: "folder", depth: 1, role: "Application source" },
    { name: "auth", type: "folder", depth: 2, role: "Identity boundary" },
    {
      name: "gate.ts",
      type: "file",
      depth: 3,
      role: "Token extraction & verification",
      lines: 33,
    },
    {
      name: "middleware.ts",
      type: "file",
      depth: 2,
      role: "Attach identity to request context",
      lines: 28,
    },
    {
      name: "routes",
      type: "folder",
      depth: 2,
      role: "Protected route handlers",
    },
    {
      name: "profile.ts",
      type: "file",
      depth: 3,
      role: "Consume the authenticated identity",
      lines: 24,
    },
    {
      name: "config.ts",
      type: "file",
      depth: 2,
      role: "Authentication configuration",
      lines: 16,
    },
    {
      name: "gate.test.ts",
      type: "file",
      depth: 2,
      role: "Illustrative test file; not executed",
      lines: 42,
    },
    {
      name: "README.md",
      type: "file",
      depth: 1,
      role: "Stated project goal",
      lines: 18,
    },
    {
      name: "package.json",
      type: "file",
      depth: 1,
      role: "Dependencies & scripts",
      lines: 26,
    },
  ],
  reconstruction: [
    {
      title: "Make the path explicit",
      detail:
        "Replace the single-entry registry with a direct bearer-token path. Keep the public factory name.",
      scope: "gate.ts · strategy lookup",
    },
    {
      title: "Keep meaning in the names",
      detail:
        "Name the returned function authenticate and the verified result user.",
      scope: "gate.ts · local identifiers",
    },
    {
      title: "Surface the boundary",
      detail:
        "Show token extraction, validation, and verification as separate reading steps.",
      scope: "gate.ts · control flow",
    },
    {
      title: "Review behavior before merging",
      detail:
        "The async boundary, missing-token errors, and header parsing differ in this illustrative proposal. They require review and tests.",
      scope: "Contract review required",
    },
  ],
  original,
  reconstructed,
  verification: {
    semantic: [
      {
        title: "Public factory interface",
        detail:
          "The proposed code preserves the exported createAuthGate name. Its error behavior still requires review.",
        status: "review-required",
      },
      {
        title: "Error and promise behavior",
        detail:
          "Moving to async changes synchronous throws into rejected promises. Equivalence has not been established.",
        status: "review-required",
      },
      {
        title: "Token extraction behavior",
        detail:
          "An explicit Bearer prefix check is proposed. Existing header cases must be reviewed.",
        status: "review-required",
      },
    ],
    tests: [
      {
        title: "Type checking of the sample",
        detail:
          "The illustrative authentication code has not been compiled against a real repository.",
        status: "not-run",
      },
      {
        title: "Unit and integration tests",
        detail:
          "No artifact test runner is connected. No tests of this artifact have been executed.",
        status: "not-run",
      },
      {
        title: "Regression and API contract tests",
        detail:
          "A future verification stage should compare valid, missing, malformed, and expired-token paths.",
        status: "not-run",
      },
    ],
  },
  inspector: {
    why: {
      title: "A pattern, not a provenance verdict.",
      body: "The single-strategy registry, factory wrapper, and dynamic selector make successive expansion a plausible reading of this sample. They do not establish AI authorship or reveal a model’s private reasoning.",
      evidence: [
        "One registered strategy · gate.ts L11–18",
        "Dynamic selection around a single path · L21–23",
      ],
    },
    evidence: {
      title: "Start with the observable structure.",
      body: "The sample defines one bearer strategy, then chooses a strategy through a request header. The indirection and unchecked selection are directly visible in the supplied example.",
      evidence: [
        "Record<string, any> · gate.ts L11",
        "strategy.extract(ctx) before the try block · L23",
      ],
    },
    change: {
      title: "Reduce the reading distance.",
      body: "Make the bearer path explicit and replace ambiguous local names. Keep the factory interface. Review the changed error contract before treating the proposal as a drop-in replacement.",
      evidence: [
        "Proposal: explicit extract → validate → verify",
        "Semantic review: async and header behavior differ",
      ],
    },
    alternatives: {
      title: "Two valid directions to review.",
      body: "A direct bearer implementation fits the current one-strategy scope. A typed strategy registry is another reasonable design if multiple concrete strategies are planned. The choice depends on requirements, not a universal preference.",
      evidence: [
        "Option A · one explicit authentication boundary",
        "Option B · typed registry with validated keys",
      ],
    },
  },
};
const paper: ArtifactDemo = {
  kind: "paper",
  name: "adaptive-learning-study",
  subtitle: "Academic paper · 5 sections · Sample artifact",
  language: "markdown",
  originalFile: "manuscript/abstract.md",
  readability: 68,
  metrics: [
    {
      label: "Structure",
      value: 76,
      description: "A recognizable section sequence exists.",
    },
    {
      label: "Clarity",
      value: 61,
      description: "The abstract combines too many claims in one sentence.",
    },
    {
      label: "Maintainability",
      value: 70,
      description: "Claims and supporting evidence are not clearly separated.",
    },
    {
      label: "Consistency",
      value: 74,
      description: "Some definitions vary between the methods and discussion.",
    },
  ],
  headline: "A clear research question. A crowded argument.",
  summary:
    "The sample has a recognizable research structure, but claims, method choices, and limitations need more explicit links.",
  pattern: "Iterative AI Expansion",
  patternExplanation:
    "The sample reads like a central question expanded into a conventional research structure. That interpretation is illustrative and does not identify authorship.",
  confidence: 77,
  reconstructedIntent:
    "Evaluate whether adaptive feedback improves retention in a small learning study.",
  issues: [
    {
      id: "HL-PAPER-003",
      title: "Evidence-to-Claim Gap",
      severity: "high",
      confidence: 90,
      explanation:
        "The abstract claims broad improvement while the sample describes a limited pilot.",
      evidence: {
        file: "manuscript/abstract.md",
        location: "Paragraph 1",
        excerpt:
          "Adaptive feedback significantly improves retention across diverse learning settings.",
        observation:
          "The pilot scope does not support the generality of this statement.",
      },
      whyItMatters:
        "Readers may interpret a pilot observation as a broadly established conclusion.",
      reconstruction:
        "Narrow the claim to the described sample and keep generalization as an open question.",
    },
    {
      id: "HL-PAPER-006",
      title: "Dense Argument Structure",
      severity: "medium",
      confidence: 85,
      explanation:
        "The abstract packs purpose, method, finding, and implication into one long paragraph.",
      evidence: {
        file: "manuscript/abstract.md",
        location: "Paragraph 1",
        excerpt:
          "We investigate adaptive feedback through a pilot study and report improved retention with implications for personalized learning.",
        observation: "Several distinct argument roles compete in one sentence.",
      },
      whyItMatters:
        "The reader cannot easily separate what was asked, what was done, and what was observed.",
      reconstruction:
        "Separate purpose, method, observation, and limitation into explicit sentences.",
    },
    {
      id: "HL-PAPER-010",
      title: "Inconsistent Terminology",
      severity: "low",
      confidence: 72,
      explanation:
        "The sample alternates between adaptive feedback and personalized guidance without defining the relationship.",
      evidence: {
        file: "manuscript/discussion.md",
        location: "Section 4",
        excerpt: "Personalized guidance may improve retention.",
        observation:
          "The terminology differs from the abstract’s adaptive feedback.",
      },
      whyItMatters: "Readers may assume these are separate interventions.",
      reconstruction:
        "Use one defined term consistently, or explain the distinction.",
    },
  ],
  logic: [
    {
      id: "goal",
      title: "Research Goal",
      category: "RECONSTRUCTED INTENT",
      description: "Evaluate adaptive feedback and learning retention.",
      evidence: "Introduction · research question",
      confidence: 90,
      x: 0,
      y: 30,
    },
    {
      id: "hypothesis",
      title: "Hypothesis",
      category: "LIKELY DESIGN",
      description: "Feedback may support later recall.",
      evidence: "Section 1 · hypothesis",
      confidence: 83,
      x: 320,
      y: 30,
    },
    {
      id: "method",
      title: "Method",
      category: "STUDY DESIGN",
      description: "Compare retention within a pilot sample.",
      evidence: "Section 2 · sample method",
      confidence: 92,
      x: 640,
      y: 30,
    },
    {
      id: "results",
      title: "Results",
      category: "OBSERVATION",
      description: "Report the observed pilot difference.",
      evidence: "Section 3 · sample findings",
      confidence: 86,
      x: 640,
      y: 280,
    },
    {
      id: "discussion",
      title: "Discussion",
      category: "INTERPRETATION",
      description: "Connect observations to scope and limitations.",
      evidence: "Section 4 · interpretation",
      confidence: 75,
      x: 320,
      y: 280,
    },
  ],
  structure: [
    { name: "manuscript", type: "folder", depth: 0, role: "Sample manuscript" },
    {
      name: "abstract.md",
      type: "file",
      depth: 1,
      role: "Purpose and summary",
      lines: 8,
    },
    {
      name: "introduction.md",
      type: "file",
      depth: 1,
      role: "Question and hypothesis",
      lines: 30,
    },
    {
      name: "methods.md",
      type: "file",
      depth: 1,
      role: "Pilot design and measures",
      lines: 42,
    },
    {
      name: "results.md",
      type: "file",
      depth: 1,
      role: "Observed pilot outcomes",
      lines: 28,
    },
    {
      name: "discussion.md",
      type: "file",
      depth: 1,
      role: "Interpretation and limitations",
      lines: 36,
    },
  ],
  reconstruction: [
    {
      title: "Separate the argument roles",
      detail:
        "State the research question, pilot method, and observation in separate sentences.",
      scope: "Abstract",
    },
    {
      title: "Reconnect claims to evidence",
      detail:
        "Scope the retention statement to the described pilot rather than all learning settings.",
      scope: "Abstract · conclusion",
    },
    {
      title: "Make limitations visible",
      detail: "Name the small sample and the need for further validation.",
      scope: "Abstract · final sentence",
    },
  ],
  original:
    "# Abstract\n\nAdaptive feedback significantly improves retention across diverse learning settings. We investigate adaptive feedback through a pilot study and report improved retention with implications for personalized learning. These results demonstrate the general effectiveness of adaptive educational systems.",
  reconstructed:
    "# Abstract\n\nPurpose: This pilot explores whether adaptive feedback supports learning retention.\n\nMethod: We compare retention within the described pilot sample.\n\nObservation: The sample reports improved retention with adaptive feedback.\n\nScope: This pilot does not establish effectiveness across diverse settings. Larger studies are needed to evaluate generalization.",
  verification: {
    semantic: [
      {
        title: "Claim scope",
        detail:
          "The proposal narrows the generality of the claim. The author must confirm that this matches the study evidence.",
        status: "review-required",
      },
      {
        title: "Information preservation",
        detail:
          "Review the structured abstract against the full manuscript before adopting it.",
        status: "review-required",
      },
    ],
    tests: [
      {
        title: "Citation and evidence validation",
        detail:
          "No citations or datasets have been checked. This is a product-shell example.",
        status: "not-run",
      },
      {
        title: "Statistical verification",
        detail: "No statistical analysis has been executed or reproduced.",
        status: "not-run",
      },
    ],
  },
  inspector: {
    why: {
      title: "Structure supports an interpretation, not authorship.",
      body: "The sample expands one research question into a familiar paper sequence. The dense abstract and broad conclusion are visible editorial choices, not proof of an AI creation process.",
      evidence: [
        "Abstract · multiple argument roles",
        "Discussion · scope exceeds pilot evidence",
      ],
    },
    evidence: {
      title: "Follow the claim to its scope.",
      body: "The phrase ‘across diverse learning settings’ is broader than a pilot design. This discrepancy motivates a human review of the claim.",
      evidence: ["Abstract · Paragraph 1", "Methods · pilot sample only"],
    },
    change: {
      title: "Make the argument inspectable.",
      body: "Separate purpose, method, observation, and limitation. Narrow claims to the scope of the pilot and let the author confirm factual preservation.",
      evidence: [
        "Proposed abstract · four labeled roles",
        "Author review remains required",
      ],
    },
    alternatives: {
      title: "Two ways to organize the abstract.",
      body: "A structured abstract makes each argument role explicit. A concise narrative abstract can also work if it separates claims and limitations into distinct sentences.",
      evidence: [
        "Option A · structured abstract",
        "Option B · concise narrative with explicit scope",
      ],
    },
  },
};
export const demos: Record<"code" | "paper", ArtifactDemo> = { code, paper };
