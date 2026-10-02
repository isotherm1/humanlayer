export type ArtifactKind = "code" | "paper";
export type WorkspaceView =
  | "overview"
  | "creation-logic"
  | "structure"
  | "issues"
  | "reconstruct"
  | "compare"
  | "verification";
export type Severity = "high" | "medium" | "low";
export type InspectorQuestion = "why" | "evidence" | "change" | "alternatives";
export interface Metric {
  label: string;
  value: number;
  description: string;
}
export interface Evidence {
  file: string;
  location: string;
  excerpt: string;
  observation: string;
}
export interface Issue {
  id: string;
  title: string;
  severity: Severity;
  confidence: number;
  explanation: string;
  evidence: Evidence;
  whyItMatters: string;
  reconstruction: string;
}
export interface LogicStep {
  id: string;
  title: string;
  category: string;
  description: string;
  evidence: string;
  confidence: number;
  x: number;
  y: number;
}
export interface StructureEntry {
  name: string;
  type: "folder" | "file";
  depth: number;
  role: string;
  lines?: number;
}
export interface ReconstructionStep {
  title: string;
  detail: string;
  scope: string;
}
export interface VerificationCheck {
  title: string;
  detail: string;
  status: "review-required" | "not-run";
}
export interface ArtifactDemo {
  kind: ArtifactKind;
  name: string;
  subtitle: string;
  language: string;
  originalFile: string;
  readability: number;
  metrics: Metric[];
  headline: string;
  summary: string;
  pattern: string;
  patternExplanation: string;
  confidence: number;
  reconstructedIntent: string;
  issues: Issue[];
  logic: LogicStep[];
  structure: StructureEntry[];
  reconstruction: ReconstructionStep[];
  original: string;
  reconstructed: string;
  verification: { semantic: VerificationCheck[]; tests: VerificationCheck[] };
  inspector: Record<
    InspectorQuestion,
    { title: string; body: string; evidence: string[] }
  >;
}
export interface ImportedArtifact {
  name: string;
  kind: ArtifactKind;
  size: number;
}
