import type {
  SourceFile,
  AnalysisReport,
  Finding,
  LogicItem,
} from "../types/analysis.ts";
export const MAX_CHARACTERS = 48000;
export function validateSources(value: unknown): SourceFile[] {
  if (!Array.isArray(value) || !value.length || value.length > 20)
    throw new Error("请选择 1–20 个文本文件。");
  const files: SourceFile[] = [];
  const names = new Set<string>();
  let length = 0;
  for (const entry of value) {
    if (!entry || typeof entry !== "object") throw new Error("材料格式无效。");
    const f = entry as Record<string, unknown>;
    if (
      typeof f.name !== "string" ||
      !f.name ||
      f.name.length > 240 ||
      names.has(f.name) ||
      typeof f.content !== "string" ||
      !f.content.trim() ||
      typeof f.language !== "string"
    )
      throw new Error("文件为空、重名或格式无效。");
    if (f.content.includes("\0")) throw new Error("不支持二进制材料。");
    length += f.content.length;
    if (length > MAX_CHARACTERS)
      throw new Error("材料合计超过 48,000 字符，请分批分析。");
    names.add(f.name);
    files.push({
      name: f.name,
      content: f.content,
      language: f.language.slice(0, 30),
    });
  }
  return files;
}
function text(v: unknown, max = 12000): string {
  if (typeof v !== "string" || !v.trim() || v.length > max)
    throw new Error("模型返回的文字字段不完整或过长，请重试。");
  return v;
}
function bounded(v: unknown): number {
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 100)
    throw new Error("模型置信度格式无效。");
  return v;
}
export function locateEvidence(file: SourceFile, quote: string): number {
  const offset = file.content.indexOf(quote);
  if (!quote.trim() || offset < 0)
    throw new Error(
      "模型引用的证据无法在原文中找到，本次结果未被采纳，请重试。",
    );
  return file.content.slice(0, offset).split("\n").length;
}
export function parseModelReport(
  value: unknown,
  files: SourceFile[],
  model: string,
): AnalysisReport {
  if (!value || typeof value !== "object")
    throw new Error("模型未返回有效报告。");
  const r = value as Record<string, unknown>;
  const source = (name: unknown) => {
    const file = files.find((f) => f.name === name);
    if (!file) throw new Error("模型引用了材料之外的文件。");
    return file;
  };
  if (
    !Array.isArray(r.findings) ||
    r.findings.length > 15 ||
    !Array.isArray(r.logic) ||
    r.logic.length > 8 ||
    !Array.isArray(r.proposals) ||
    r.proposals.length > files.length ||
    !Array.isArray(r.limitations) ||
    r.limitations.length > 10
  )
    throw new Error("模型报告结构不完整。");
  const findings: Finding[] = r.findings.map((item, i) => {
    const f = item as Record<string, unknown>,
      e = f.evidence as Record<string, unknown>;
    if (!e || !["high", "medium", "low"].includes(String(f.severity)))
      throw new Error("问题或证据格式无效。");
    const file = source(e.file),
      quote = text(e.quote, 2500);
    return {
      id: `HL-${String(i + 1).padStart(3, "0")}`,
      title: text(f.title, 100),
      severity: f.severity as Finding["severity"],
      explanation: text(f.explanation, 3000),
      evidence: { file: file.name, quote, line: locateEvidence(file, quote) },
      suggestion: text(f.suggestion, 3000),
      confidence: bounded(f.confidence),
    };
  });
  const logic: LogicItem[] = r.logic.map((item) => {
    const l = item as Record<string, unknown>;
    const file = source(l.file),
      quote = text(l.quote, 2500);
    locateEvidence(file, quote);
    return {
      title: text(l.title, 100),
      description: text(l.description, 3000),
      file: file.name,
      quote,
    };
  });
  const proposed = new Set<string>();
  const proposals = r.proposals.map((item) => {
    const p = item as Record<string, unknown>,
      file = source(p.file);
    if (proposed.has(file.name)) throw new Error("模型返回重复的重构文件。");
    proposed.add(file.name);
    return {
      file: file.name,
      content: text(p.content, MAX_CHARACTERS * 2),
      explanation: text(p.explanation, 3000),
    };
  });
  if (proposals.reduce((n, p) => n + p.content.length, 0) > MAX_CHARACTERS * 2)
    throw new Error("重构结果过长，请缩小材料范围。");
  return {
    mode: "ai",
    model,
    summary: text(r.summary),
    intent: text(r.intent),
    pattern: text(r.pattern, 1000),
    confidence: bounded(r.confidence),
    findings,
    logic,
    proposals,
    limitations: [...new Set([...r.limitations.map((l) => text(l, 2000)), "未执行项目测试，也未验证重构前后的语义等价。", "设计意图和组织模式属于推断，仍需核对上下文。"] )],
    metrics: [
      { label: "文件", value: files.length },
      { label: "字符", value: files.reduce((n, f) => n + f.content.length, 0) },
      { label: "问题", value: findings.length },
    ],
  };
}
const string = { type: "string" };
const object = (properties: Record<string, unknown>) => ({
  type: "object",
  additionalProperties: false,
  properties,
  required: Object.keys(properties),
});
const array = (items: unknown) => ({ type: "array", items });
export const reportSchema = object({
  summary: string,
  intent: string,
  pattern: string,
  confidence: { type: "number" },
  findings: array(
    object({
      title: string,
      severity: { type: "string", enum: ["high", "medium", "low"] },
      explanation: string,
      evidence: object({ file: string, quote: string }),
      suggestion: string,
      confidence: { type: "number" },
    }),
  ),
  logic: array(
    object({ title: string, description: string, file: string, quote: string }),
  ),
  proposals: array(
    object({ file: string, content: string, explanation: string }),
  ),
  limitations: array(string),
});
