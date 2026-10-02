import type { WorkspaceView, InspectorQuestion } from "@/types/artifact";
export const product = {
  name: "HumanLayer",
  version: "0.1.0",
  repo: "https://github.com/isotherm1/humanlayer",
  thesis: "AI can create. Humans still need to understand.",
};
export const supportedFormats = [
  "ZIP",
  "PY",
  "JS",
  "TS",
  "TSX",
  "PDF",
  "MD",
  "TXT",
] as const;
export const allowedExtensions = new Set(
  supportedFormats.map((f) => f.toLowerCase()),
);
export const navigation: {
  group?: string;
  items: { id: WorkspaceView; label: string }[];
}[] = [
  { items: [{ id: "overview", label: "Overview" }] },
  {
    group: "UNDERSTAND",
    items: [
      { id: "creation-logic", label: "Creation Logic" },
      { id: "structure", label: "Structure" },
    ],
  },
  {
    group: "IMPROVE",
    items: [
      { id: "issues", label: "Issues" },
      { id: "reconstruct", label: "Reconstruct" },
      { id: "compare", label: "Compare" },
    ],
  },
  { group: "VERIFY", items: [{ id: "verification", label: "Verification" }] },
];
export const viewDescriptions: Record<WorkspaceView, string> = {
  overview: "A human perspective on the artifact.",
  "creation-logic": "A plausible path from original goal to implementation.",
  structure: "How the pieces connect, and where responsibilities live.",
  issues: "Evidence-backed observations, ready for human review.",
  reconstruct: "A proposed route to a more understandable artifact.",
  compare: "Follow what changes. Keep what matters.",
  verification: "Separate intended equivalence from executed evidence.",
};
export const inspectorQuestions: { id: InspectorQuestion; label: string }[] = [
  { id: "why", label: "Why do you think this?" },
  { id: "evidence", label: "Show the evidence." },
  { id: "change", label: "What would you change?" },
  { id: "alternatives", label: "What are the alternatives?" },
];
