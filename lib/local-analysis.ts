import * as prettier from "prettier/standalone";
import * as estree from "prettier/plugins/estree";
import * as typescript from "prettier/plugins/typescript";
import * as babel from "prettier/plugins/babel";
import { parse } from "@babel/parser";
import type {
  SourceFile,
  Finding,
  AnalysisReport,
  MaterialKind,
} from "../types/analysis.ts";
import { validateSources } from "./analysis-contract.ts";
export async function analyzeLocally(
  input: SourceFile[],
  kind: MaterialKind,
): Promise<AnalysisReport> {
  const files = validateSources(input),
    findings: Finding[] = [],
    logic: AnalysisReport["logic"] = [],
    proposals: AnalysisReport["proposals"] = [],
    limitations: string[] = [];
  let functions = 0,
    parseFailures = 0,
    maxLine = 0;
  const add = (
    file: SourceFile,
    line: number,
    title: string,
    explanation: string,
    suggestion: string,
    severity: Finding["severity"] = "medium",
  ) => {
    const quote = file.content.split("\n")[line - 1];
    if (!quote?.trim() || findings.length >= 15) return;
    findings.push({
      id: `HL-${String(findings.length + 1).padStart(3, "0")}`,
      title,
      severity,
      explanation,
      evidence: { file: file.name, quote, line },
      suggestion,
      confidence: 100,
    });
  };
  for (const file of files) {
    const lines = file.content.split("\n");
    maxLine = Math.max(maxLine, ...lines.map((l) => l.length));
    const long = lines.findIndex(
      (l) => l.length > (kind === "code" ? 160 : 300),
    );
    if (long >= 0)
      add(
        file,
        long + 1,
        "单行信息过密",
        `这一行包含 ${lines[long].length} 个字符。长行会增加横向阅读成本。`,
        "拆分表达式或段落，但先确认语言和排版规则。",
        "low",
      );
    if (kind === "paper") {
      const paragraphs = file.content.split(/\n\s*\n/).filter((p) => p.trim());
      const dense = paragraphs.find((p) => p.length > 900);
      if (dense) {
        const offset = file.content.indexOf(dense);
        add(
          file,
          file.content.slice(0, offset).split("\n").length,
          "段落过长",
          `该段包含 ${dense.length} 个字符。此规则只测量篇幅，不评判论证正确性。`,
          "按研究目的、方法、观察和限制分段。",
          "low",
        );
      }
      continue;
    }
    if (!["javascript", "typescript", "tsx", "jsx"].includes(file.language)) {
      limitations.push(
        `${file.name}：仅进行了文本检查，未解析 ${file.language} 语法。`,
      );
      continue;
    }
    try {
      const ast = parse(file.content, {
        sourceType: "unambiguous",
        plugins: [
          ...(file.language === "typescript" || file.language === "tsx"
            ? ["typescript" as const]
            : []),
          ...(file.language === "jsx" || file.language === "tsx"
            ? ["jsx" as const]
            : []),
        ],
      });
      function walk(value: unknown) {
        if (Array.isArray(value)) {
          value.forEach(walk);
          return;
        }
        if (!value || typeof value !== "object") return;
        const node = value as Record<string, unknown>,
          loc = node.loc as
            { start: { line: number }; end: { line: number } } | undefined,
          line = loc?.start.line || 1;
        if (node.type === "TSAnyKeyword")
          add(
            file,
            line,
            "显式 any 类型",
            "语法树中发现了 any 类型。它绕过这一位置的静态类型约束。",
            "尽量用 unknown、泛型或明确的接口描述数据。允许确有必要的边界使用 any。",
          );
        if (
          [
            "FunctionDeclaration",
            "FunctionExpression",
            "ArrowFunctionExpression",
            "ObjectMethod",
            "ClassMethod",
          ].includes(String(node.type))
        ) {
          functions++;
          const params = node.params as unknown[];
          if (params?.length > 5)
            add(
              file,
              line,
              "参数较多",
              `这个函数有 ${params.length} 个参数。`,
              "考虑按职责拆分，或将有明确关联的参数组合为对象。",
              "low",
            );
          if (loc && loc.end.line - loc.start.line + 1 > 60)
            add(
              file,
              line,
              "函数阅读跨度较大",
              `这个函数跨越 ${loc.end.line - loc.start.line + 1} 行。`,
              "按明确的业务步骤提取小函数；长度本身不代表逻辑错误。",
              "low",
            );
          const id = node.id as { name?: string } | undefined;
          if (id?.name && logic.length < 8)
            logic.push({
              title: id.name,
              description: `${file.name} 第 ${line} 行的函数定义；业务意图需结合调用关系判断。`,
              file: file.name,
              quote: lines[line - 1],
            });
        }
        if (node.type === "CatchClause") {
          const block = node.body as { body?: unknown[] };
          if (block?.body?.length === 0)
            add(
              file,
              line,
              "空 catch 块",
              "此 catch 没有任何语句，错误会被静默忽略。",
              "明确错误处理策略：记录、返回可解释的状态，或向调用者传播异常。",
              "high",
            );
        }
        if (
          node.type === "CallExpression" &&
          (node.callee as { type?: string; name?: string })?.type ===
            "Identifier" &&
          (node.callee as { name?: string }).name === "eval"
        )
          add(
            file,
            line,
            "动态执行字符串",
            "发现直接调用 eval。是否构成漏洞取决于输入来源，本次没有做数据流验证。",
            "优先使用明确的数据解析或受控操作；审查输入边界。",
            "high",
          );
        for (const [key, child] of Object.entries(node))
          if (
            ![
              "loc",
              "start",
              "end",
              "extra",
              "comments",
              "tokens",
              "leadingComments",
              "trailingComments",
              "innerComments",
            ].includes(key)
          )
            walk(child);
      }
      walk(ast);
      const syntax = file.language === "typescript" || file.language === "tsx" ? typescript : babel;
      const formatted = await prettier.format(file.content, {
        parser:
          file.language === "typescript" || file.language === "tsx"
            ? "typescript"
            : "babel",
        plugins: [syntax, estree],
        printWidth: 90,
        tabWidth: 2,
      });
      if (formatted !== file.content)
        proposals.push({
          file: file.name,
          content: formatted,
          explanation:
            "使用 Prettier 整理缩进、换行和语法排版；未重写业务逻辑，也未运行项目测试。",
        });
    } catch (error) {
      parseFailures++;
      const e = error as { loc?: { line?: number }; message?: string };
      add(
        file,
        e.loc?.line || 1,
        "语法解析未通过",
        e.message?.slice(0, 500) || "无法解析此文件。",
        "先检查语言选择与语法，再进行结构重构。",
        "high",
      );
    }
  }
  return {
    mode: "local",
    summary: findings.length
      ? `根据实际材料，发现 ${findings.length} 项规则观察。请结合上下文决定哪些需要修改。`
      : "本次规则检查未发现命中项。这不代表材料没有错误。",
    intent:
      "本地规则不推断设计意图。启用 AI 深度分析后，可基于原文证据生成意图解释。",
    pattern: "尚未进行创作模式推断。",
    confidence: null,
    findings,
    logic,
    proposals,
    limitations: [
      ...limitations,
      "本地检查是语法及文本规则，不是大模型分析。",
      "未进行跨文件类型检查、运行测试、语义等价验证或论文事实核查。",
      ...(parseFailures
        ? [`${parseFailures} 个文件未完成语法解析，相关结构结果不完整。`]
        : []),
    ],
    metrics: [
      { label: "文件", value: files.length },
      {
        label: "文本行",
        value: files.reduce((n, f) => n + f.content.split("\n").length, 0),
      },
      { label: "函数", value: functions },
      { label: "最长行", value: maxLine },
    ],
  };
}
