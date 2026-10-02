"use client";
import { useState } from "react";
import { ExportButton } from "@/components/export-button";
import { AnalysisGraph } from "@/components/analysis-graph";
import { compareLines } from "@/lib/comparison";
import type { AnalysisReport, SourceFile, Finding } from "@/types/analysis";
export type ReadingView =
  | "overview"
  | "logic"
  | "structure"
  | "issues"
  | "reconstruct"
  | "compare"
  | "verify";
export const viewLabels: Record<ReadingView, string> = {
  overview: "分析概览",
  logic: "创作逻辑",
  structure: "文件结构",
  issues: "问题与证据",
  reconstruct: "重构建议",
  compare: "前后对照",
  verify: "验证状态",
};
const severities = { high: "高", medium: "中", low: "低" };
function Issue({
  finding,
  onEvidence,
}: {
  finding: Finding;
  onEvidence: (f: Finding) => void;
}) {
  return (
    <article className="finding">
      <div className="finding-heading">
        <span className={`severity ${finding.severity}`}>
          {severities[finding.severity]}优先级
        </span>
        <small>{finding.id}</small>
        <h3>{finding.title}</h3>
      </div>
      <p>{finding.explanation}</p>
      <button className="evidence-link" onClick={() => onEvidence(finding)}>
        {finding.evidence.file} : {finding.evidence.line} · 查看原文
      </button>
      <pre className="evidence-text">{finding.evidence.quote}</pre>
      <p>
        <strong>建议：</strong>
        {finding.suggestion}
      </p>
    </article>
  );
}
export function reportText(
  report: AnalysisReport,
  files: SourceFile[],
): string {
  return `# HumanLayer 分析报告\n\n分析方式：${report.mode === "ai" ? `模型分析（${report.model}）` : "本地规则检查"}\n文件：${files.map((f) => f.name).join("、")}\n\n${report.summary}\n\n## 设计意图（推断）\n${report.intent}\n\n## 问题与证据\n${report.findings.map((f) => `### ${f.id} ${f.title}\n优先级：${severities[f.severity]}\n${f.explanation}\n证据：${f.evidence.file} 第${f.evidence.line}行\n\n\`\`\`\n${f.evidence.quote}\n\`\`\`\n\n建议：${f.suggestion}`).join("\n\n")}\n\n## 限制\n${report.limitations.map((l) => `- ${l}`).join("\n")}\n\n未运行项目测试，未确认语义等价。\n`;
}
export function AnalysisResults({
  report,
  files,
  view,
  onNavigate,
  onEvidence,
}: {
  report: AnalysisReport;
  files: SourceFile[];
  view: ReadingView;
  onNavigate: (v: ReadingView) => void;
  onEvidence: (f: Finding) => void;
}) {
  const [severity, setSeverity] = useState("all"),
    [comparison, setComparison] = useState<"split" | "unified">("split"),
    [fileName, setFileName] = useState(
      report.proposals[0]?.file || files[0].name,
    );
  const source = files.find((f) => f.name === fileName) || files[0],
    proposal = report.proposals.find((p) => p.file === source.name);
  const diff = proposal ? compareLines(source.content, proposal.content) : [];
  return (
    <div className="analysis-report">
      <header className="report-heading">
        <div>
          <small>
            {report.mode === "ai"
              ? `AI 分析 · ${report.model}`
              : "本地规则检查"}
          </small>
          <h1>{viewLabels[view]}</h1>
        </div>
        <ExportButton
          filename="HumanLayer-分析报告.md"
          content={reportText(report, files)}
          variant="outline"
          size="sm"
        >
          导出报告
        </ExportButton>
      </header>
      {view === "overview" && (
        <>
          <p className="report-summary">{report.summary}</p>
          <div className="measured-stats">
            {report.metrics.map((m) => (
              <div key={m.label}>
                <small>{m.label}</small>
                <strong>{m.value}</strong>
              </div>
            ))}
          </div>
          <section className="report-section">
            <h2>设计意图</h2>
            <p>{report.intent}</p>
          </section>
          {report.mode === "ai" && (
            <section className="report-section">
              <h2>可能的组织模式</h2>
              <p>{report.pattern}</p>
              <p className="section-note">
                置信度 {report.confidence}% · 模型主观评估，不是经校准的概率。
              </p>
            </section>
          )}
          <section className="report-section">
            <div className="inline-heading">
              <h2>优先阅读的问题</h2>
              <button onClick={() => onNavigate("issues")}>
                查看全部 {report.findings.length} 项
              </button>
            </div>
            {report.findings.slice(0, 2).map((f) => (
              <Issue key={f.id} finding={f} onEvidence={onEvidence} />
            ))}
            {!report.findings.length && (
              <p className="section-note">
                本次未发现可报告的问题。检查范围和局限仍需阅读。
              </p>
            )}
          </section>
          <section className="report-section">
            <h2>分析范围与限制</h2>
            <ul>
              {report.limitations.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </section>
        </>
      )}
      {view === "logic" && (
        <AnalysisGraph
          key={report.mode}
          items={report.logic}
          inferred={report.mode === "ai"}
        />
      )}
      {view === "structure" && (
        <>
          <p className="section-note">
            下面列出本次实际读取的材料，没有生成虚构的项目文件。
          </p>
          <div className="source-table">
            {files.map((f) => (
              <button
                key={f.name}
                onClick={() =>
                  onEvidence({
                    id: "source",
                    title: f.name,
                    severity: "low",
                    explanation: "",
                    suggestion: "",
                    confidence: 100,
                    evidence: {
                      file: f.name,
                      line: 1,
                      quote: f.content.split("\n")[0],
                    },
                  })
                }
              >
                <span>{f.name}</span>
                <small>
                  {f.language} · {f.content.split("\n").length} 行 ·{" "}
                  {f.content.length} 字符
                </small>
              </button>
            ))}
          </div>
        </>
      )}
      {view === "issues" && (
        <>
          <div className="filter-row" aria-label="问题优先级筛选">
            {["all", "high", "medium", "low"].map((s) => (
              <button
                key={s}
                className={severity === s ? "active" : ""}
                aria-pressed={severity === s}
                onClick={() => setSeverity(s)}
              >
                {s === "all"
                  ? "全部"
                  : severities[s as keyof typeof severities]}{" "}
                <span>
                  {
                    report.findings.filter(
                      (f) => s === "all" || f.severity === s,
                    ).length
                  }
                </span>
              </button>
            ))}
          </div>
          {report.findings
            .filter((f) => severity === "all" || f.severity === severity)
            .map((f) => (
              <Issue key={f.id} finding={f} onEvidence={onEvidence} />
            ))}
          {!report.findings.filter(
            (f) => severity === "all" || f.severity === severity,
          ).length && <p className="quiet-message">这个优先级下没有问题。</p>}
        </>
      )}
      {view === "reconstruct" && (
        <>
          <p className="section-note">
            {report.mode === "local"
              ? "本地版本只整理排版，不进行业务重写。"
              : "模型提出的重构需要你审查语义和接口。结果不会自动覆盖原文件。"}
          </p>
          {report.proposals.map((p) => (
            <section className="report-section" key={p.file}>
              <h2>{p.file}</h2>
              <p>{p.explanation}</p>
              <div className="action-row">
                <button
                  className="text-action"
                  onClick={() => {
                    setFileName(p.file);
                    onNavigate("compare");
                  }}
                >
                  查看对照
                </button>
                <ExportButton
                  size="sm"
                  variant="outline"
                  filename={`${p.file.split("/").pop()}.proposed.${p.file.split(".").pop() === "pdf" ? "txt" : p.file.split(".").pop()}`}
                  content={p.content}
                >
                  导出建议版本
                </ExportButton>
              </div>
            </section>
          ))}
          {!report.proposals.length && (
            <p className="quiet-message">
              本次没有生成重构版本。可能无需排版调整，或当前解析器不支持该语言。请查看分析限制。
            </p>
          )}
        </>
      )}
      {view === "compare" && (
        <>
          <div className="compare-tools">
            <label>
              文件
              <select
                aria-label="选择对照文件"
                value={source.name}
                onChange={(e) => setFileName(e.target.value)}
              >
                {files.map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="filter-row">
              <button
                onClick={() => setComparison("split")}
                aria-pressed={comparison === "split"}
                className={comparison === "split" ? "active" : ""}
              >
                并排
              </button>
              <button
                onClick={() => setComparison("unified")}
                aria-pressed={comparison === "unified"}
                className={comparison === "unified" ? "active" : ""}
              >
                差异
              </button>
            </div>
          </div>
          {proposal ? (
            <>
              <p className="section-note">{proposal.explanation}</p>
              {comparison === "split" ? (
                <div className="reading-diff">
                  <section>
                    <header>原始材料</header>
                    <pre tabIndex={0}>
                      {source.content.split("\n").map((line, i) => (
                        <div className="diff-line" key={i}>
                          <span>{i + 1}</span>
                          <code>{line || " "}</code>
                        </div>
                      ))}
                    </pre>
                  </section>
                  <section>
                    <header>建议版本 · 未验证</header>
                    <pre tabIndex={0}>
                      {proposal.content.split("\n").map((line, i) => (
                        <div className="diff-line" key={i}>
                          <span>{i + 1}</span>
                          <code>{line || " "}</code>
                        </div>
                      ))}
                    </pre>
                  </section>
                </div>
              ) : (
                <div className="reading-diff">
                  <section className="full-diff">
                    <header>逐行变化</header>
                    <pre tabIndex={0}>
                      {diff.map((line, i) => (
                        <div key={i} className={`diff-line ${line.kind}`}>
                          <span>{line.before || line.after}</span>
                          <code>
                            {line.kind === "added"
                              ? "+ "
                              : line.kind === "removed"
                                ? "− "
                                : "  "}
                            {line.text || " "}
                          </code>
                        </div>
                      ))}
                    </pre>
                  </section>
                </div>
              )}
              <p className="section-note">
                +{diff.filter((l) => l.kind === "added").length} / −
                {diff.filter((l) => l.kind === "removed").length} 行 ·
                未应用任何更改
              </p>
            </>
          ) : (
            <p className="quiet-message">
              这个文件没有建议版本。原文可在文件结构中查看。
            </p>
          )}
        </>
      )}
      {view === "verify" && (
        <>
          <section className="report-section">
            <h2>语义验证</h2>
            <span className="review-status">待人工审查</span>
            <p>
              可读性提高不等于功能等价。请检查接口、错误处理、异步行为和论文事实是否保持一致。
            </p>
          </section>
          <section className="report-section">
            <h2>测试验证</h2>
            <span className="review-status">未执行 · 0 项项目测试</span>
            <p>
              网站不会运行上传的代码。语法解析、原文证据匹配和差异计算不等同于编译、类型检查、单元测试或统计验证。
            </p>
          </section>
          <section className="report-section">
            <h2>本次可确认的依据</h2>
            <ul>
              <li>已读取 {files.length} 个实际文件，未自动截断文字。</li>
              <li>报告中的问题引用可在对应原文中逐字匹配。</li>
              <li>对照视图的增删行由本地差异算法计算。</li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
