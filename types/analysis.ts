export interface SourceFile {
  name: string;
  content: string;
  language: string;
}
export type MaterialKind = "code" | "paper";
export interface Finding {
  id: string;
  title: string;
  severity: "high" | "medium" | "low";
  explanation: string;
  evidence: { file: string; quote: string; line: number };
  suggestion: string;
  confidence: number;
}
export interface LogicItem {
  title: string;
  description: string;
  file: string;
  quote: string;
}
export interface AnalysisReport {
  mode: "local" | "ai";
  summary: string;
  intent: string;
  pattern: string;
  confidence: number | null;
  findings: Finding[];
  logic: LogicItem[];
  proposals: { file: string; content: string; explanation: string }[];
  limitations: string[];
  metrics: { label: string; value: number | string }[];
  model?: string;
}
