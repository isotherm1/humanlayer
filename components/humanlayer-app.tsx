"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  Plus,
  Paperclip,
  FileCode2,
  FileText,
  PanelLeftClose,
  LayoutDashboard,
  GitBranch,
  Folder,
  ScanLine,
  Columns2,
  CheckCheck,
  Settings2,
  X,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { motion } from "motion/react";
import { ThemeToggle } from "@/components/theme-provider";
import {
  AnalysisResults,
  viewLabels,
  type ReadingView,
} from "@/components/analysis-results";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { readArtifacts } from "@/lib/read-artifact";
import { validateSources, MAX_CHARACTERS } from "@/lib/analysis-contract";
import type {
  SourceFile,
  AnalysisReport,
  MaterialKind,
  Finding,
} from "@/types/analysis";
const navigation: [ReadingView, typeof LayoutDashboard][] = [
  ["overview", LayoutDashboard],
  ["logic", GitBranch],
  ["structure", Folder],
  ["issues", ScanLine],
  ["reconstruct", FileCode2],
  ["compare", Columns2],
  ["verify", CheckCheck],
];
const example =
  "export function readUser(data: any) {\n  try { return JSON.parse(data) } catch (error) {}\n}\n";
export function HumanLayerApp() {
  const [kind, setKind] = useState<MaterialKind>("code"),
    [draft, setDraft] = useState(""),
    [language, setLanguage] = useState("typescript"),
    [uploads, setUploads] = useState<SourceFile[]>([]),
    [files, setFiles] = useState<SourceFile[]>([]),
    [report, setReport] = useState<AnalysisReport | null>(null),
    [view, setView] = useState<ReadingView>("overview"),
    [mode, setMode] = useState<"local" | "ai">("local"),
    [consent, setConsent] = useState(false),
    [configured, setConfigured] = useState(false),
    [busy, setBusy] = useState(false),
    [reading, setReading] = useState(false),
    [error, setError] = useState(""),
    [warnings, setWarnings] = useState<string[]>([]),
    [settings, setSettings] = useState(false),
    [evidence, setEvidence] = useState<Finding | null>(null),
    [question, setQuestion] = useState(""),
    [answer, setAnswer] = useState(""),
    [asking, setAsking] = useState(false),
    [inspector, setInspector] = useState(false),
    [mobileNav, setMobileNav] = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null),
    controller = useRef<AbortController | null>(null),
    askController = useRef<AbortController | null>(null);
  useEffect(() => {
    const c = new AbortController();
    fetch("/api/status", { signal: c.signal })
      .then((r) => r.json())
      .then((d) => setConfigured(d.configured === true))
      .catch(() => {});
    return () => {
      c.abort();
      controller.current?.abort();
      askController.current?.abort();
    };
  }, []);
  function invalidate() {
    setConsent(false);
    controller.current?.abort();
    askController.current?.abort();
    setReport(null);
    setAnswer("");
    setFiles([]);
    setError("");
  }
  async function selectFiles(selected: File[]) {
    if (!selected.length) return;
    setReading(true);
    setError("");
    try {
      const result = await readArtifacts(selected);
      validateSources([...uploads, ...result.files]);
      invalidate();
      setUploads((old) => [...old, ...result.files]);
      setWarnings(result.warnings);
    } catch (e) {
      setError(e instanceof Error ? e.message : "文件读取失败，请检查格式。");
    } finally {
      setReading(false);
    }
  }
  async function analyze() {
    setError("");
    let sources: SourceFile[];
    try {
      const extension = (
        {
          typescript: "ts",
          javascript: "js",
          tsx: "tsx",
          python: "py",
          markdown: "md",
          text: "txt",
        } as Record<string, string>
      )[language];
      sources = validateSources([
        ...uploads,
        ...(draft.trim()
          ? [
              {
                name: `粘贴材料.${kind === "paper" ? "txt" : extension}`,
                content: draft,
                language: kind === "paper" ? "text" : language,
              },
            ]
          : []),
      ]);
    } catch (e) {
      setError((e as Error).message);
      return;
    }
    if (mode === "ai" && !configured) {
      setError("AI 服务尚未配置，请查看模型与隐私设置。本地检查可直接使用。");
      return;
    }
    if (mode === "ai" && !consent) {
      setError("请先确认将本次材料发送给模型服务。");
      return;
    }
    const c = new AbortController();
    controller.current = c;
    setBusy(true);
    try {
      let result: AnalysisReport;
      if (mode === "local") {
        const { analyzeLocally } = await import("@/lib/local-analysis");
        result = await analyzeLocally(sources, kind);
      } else {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: sources, kind, consent }),
          signal: c.signal,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "分析请求失败。");
        result = data.report;
      }
      if (!c.signal.aborted) {
        setFiles(sources);
        setReport(result);
        setView("overview");
        setAnswer("");
      }
    } catch (e) {
      if (!c.signal.aborted)
        setError(e instanceof Error ? e.message : "分析未完成，请重试。");
    } finally {
      setBusy(false);
    }
  }
  async function ask(text: string) {
    if (asking) return;
    if (!configured) {
      setAnswer(
        "尚未连接模型。原文和规则证据可直接查看；自由问答需要配置模型服务。",
      );
      return;
    }
    if (!consent) {
      setAnswer("请在材料输入页确认将材料发送给模型服务后再提问。");
      return;
    }
    const c = new AbortController();
    askController.current = c;
    setAsking(true);
    setAnswer("");
    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, kind, consent, question: text }),
        signal: c.signal,
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "回答未完成。");
      setAnswer(d.answer);
    } catch (e) {
      if (!c.signal.aborted) setAnswer((e as Error).message);
    } finally {
      setAsking(false);
    }
  }
  const characters =
      draft.length + uploads.reduce((n, f) => n + f.content.length, 0),
    source = files.find((f) => f.name === evidence?.evidence.file);
  return (
    <div className={`human-app ${report ? "has-report" : ""}`}>
      <aside className={`human-sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <Link href="/" className="human-brand" aria-label="HumanLayer 首页">
          <span className="brand-symbol">
            h<span>/</span>
          </span>
          HumanLayer
        </Link>
        <button
          className="new-reading"
          disabled={busy || reading}
          onClick={() => {
            invalidate();
            setDraft("");
            setUploads([]);
            setWarnings([]);
            setMobileNav(false);
          }}
        >
          <Plus size={17} />
          新建分析<span>↗</span>
        </button>
        <div className="nav-caption">工作空间</div>
        <nav aria-label="分析导航">
          {navigation.map(([id, Icon]) => (
            <button
              key={id}
              disabled={!report}
              className={report && view === id ? "selected" : ""}
              onClick={() => {
                setView(id);
                setMobileNav(false);
              }}
            >
              <Icon size={16} />
              {viewLabels[id]}
              {id === "issues" && report && (
                <small>{report.findings.length}</small>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="model-dot">
            <span className={configured ? "connected" : ""} />
            {configured ? "模型已连接" : "本地检查可用"}
          </div>
          <div className="sidebar-controls">
            <button onClick={() => setSettings(true)}>
              <Settings2 size={16} />
              模型与隐私
            </button>
            <ThemeToggle />
          </div>
          <small>理解作品，保留人的判断。</small>
        </div>
      </aside>
      <main className="human-main">
        <header className="workspace-top">
          <button
            className="mobile-menu"
            aria-label="展开导航"
            onClick={() => setMobileNav((v) => !v)}
          >
            <PanelLeftClose size={18} />
          </button>
          <span>
            {report
              ? `${files.length} 份材料 · ${report.mode === "ai" ? "模型分析" : "本地规则"}`
              : "代码与论文阅读工作台"}
          </span>
          <div>
            {report && (
              <>
                <button
                  onClick={() => {
                    setReport(null);
                    setAnswer("");
                  }}
                >
                  编辑材料
                </button>
                <button
                  className={inspector ? "selected" : ""}
                  onClick={() => setInspector((v) => !v)}
                >
                  <MessageSquare size={15} />
                  追问
                </button>
              </>
            )}
            <button
              onClick={() => setSettings(true)}
              className="top-settings"
              aria-label="模型设置"
            >
              <Settings2 size={16} />
            </button>
          </div>
        </header>
        {!report ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="input-stage"
          >
            <div className="intro">
              <span className="eyebrow">HumanLayer · 为理解而读</span>
              <h1>把复杂的材料，读明白。</h1>
              <p>从代码到论文，查看结构、问题和原文依据。</p>
            </div>
            <div className="material-tabs" role="group" aria-label="材料类型">
              <button
                className={kind === "code" ? "active" : ""}
                aria-pressed={kind === "code"}
                disabled={busy || reading}
                onClick={() => {
                  invalidate();
                  setKind("code");
                }}
              >
                <FileCode2 size={16} />
                代码
              </button>
              <button
                className={kind === "paper" ? "active" : ""}
                aria-pressed={kind === "paper"}
                disabled={busy || reading}
                onClick={() => {
                  invalidate();
                  setKind("paper");
                }}
              >
                <FileText size={16} />
                论文与文本
              </button>
            </div>
            <div className="material-input">
              <textarea
                aria-label="粘贴待分析材料"
                placeholder={
                  kind === "code"
                    ? "粘贴代码，或添加项目文件…"
                    : "粘贴论文、研究笔记，或添加 PDF…"
                }
                value={draft}
                disabled={busy || reading}
                onChange={(e) => {
                  invalidate();
                  setDraft(e.target.value);
                }}
                spellCheck={false}
              />
              {uploads.length > 0 && (
                <div className="file-chips">
                  {uploads.map((f, i) => (
                    <span key={f.name}>
                      <FileText size={13} />
                      {f.name}
                      <button
                        disabled={busy || reading}
                        aria-label={`移除 ${f.name}`}
                        onClick={() => {
                          invalidate();
                          setUploads((old) => old.filter((_, j) => j !== i));
                        }}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="composer-toolbar">
                <div>
                  <input
                    ref={uploadRef}
                    type="file"
                    multiple
                    accept=".zip,.py,.js,.jsx,.ts,.tsx,.pdf,.md,.txt"
                    hidden
                    onChange={(e) => {
                      void selectFiles(Array.from(e.target.files || []));
                      e.target.value = "";
                    }}
                  />
                  <button
                    disabled={busy || reading}
                    onClick={() => uploadRef.current?.click()}
                  >
                    <Paperclip size={17} />
                    {reading ? "读取中…" : "添加文件"}
                  </button>
                  {kind === "code" && (
                    <select
                      aria-label="粘贴代码的语言"
                      disabled={busy || reading}
                      value={language}
                      onChange={(e) => {
                        invalidate();
                        setLanguage(e.target.value);
                      }}
                    >
                      {Object.entries({
                        typescript: "TypeScript",
                        javascript: "JavaScript",
                        tsx: "TSX",
                        python: "Python",
                        markdown: "Markdown",
                        text: "纯文本",
                      }).map(([id, label]) => (
                        <option key={id} value={id}>
                          {label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  className="start-analysis"
                  aria-label="开始分析"
                  disabled={busy || reading || characters === 0}
                  onClick={() => void analyze()}
                >
                  {busy ? (
                    <Loader2 className="spinning" size={18} />
                  ) : (
                    <ArrowUp size={20} />
                  )}
                </button>
              </div>
            </div>
            <div className="analysis-options">
              <label>
                分析方式
                <select
                  aria-label="分析方式"
                  value={mode}
                  disabled={busy || reading}
                  onChange={(e) => setMode(e.target.value as "local" | "ai")}
                >
                  <option value="local">本地规则检查</option>
                  <option value="ai">
                    AI 深度分析{configured ? "" : " · 未连接"}
                  </option>
                </select>
              </label>
              <span className={characters > MAX_CHARACTERS ? "error-text" : ""}>
                {characters.toLocaleString()} / 48,000 字符
              </span>
            </div>
            {mode === "ai" ? (
              <div className="consent-note">
                <label>
                  <input
                    type="checkbox"
                    checked={consent}
                    disabled={busy}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  我确认将本次材料发送给 OpenAI 进行分析。
                </label>
                {!configured && (
                  <p>
                    模型尚未配置。
                    <button onClick={() => setSettings(true)}>
                      查看连接说明
                    </button>
                  </p>
                )}
              </div>
            ) : (
              <p className="input-note">
                材料在浏览器内检查，不上传。支持 JS / TS
                语法检查与排版，其他语言仅检查文本。
              </p>
            )}
            {busy && (
              <div role="status" className="analysis-progress">
                {mode === "local"
                  ? "正在解析材料…"
                  : "正在等待模型分析，可能需要约一分钟…"}
                <button onClick={() => controller.current?.abort()}>
                  取消
                </button>
              </div>
            )}
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
            {warnings.map((w) => (
              <p className="input-note" key={w}>
                {w}
              </p>
            ))}
            <div className="example-row">
              <span>ZIP · PY · JS · TS · TSX · PDF · MD · TXT</span>
              <button
                disabled={busy || reading}
                onClick={() => {
                  invalidate();
                  setKind("code");
                  setLanguage("typescript");
                  setUploads([]);
                  setDraft(example);
                  setMode("local");
                }}
              >
                试用示例 ↗
              </button>
            </div>
            <p className="method-note">
              报告解释的是可观察的结构与可能的意图，不判断作品是否由 AI
              生成，也不声称恢复模型的私有思维过程。
            </p>
          </motion.div>
        ) : (
          <div className="results-layout">
            <AnalysisResults
              key={JSON.stringify(report.metrics) + report.summary}
              report={report}
              files={files}
              view={view}
              onNavigate={setView}
              onEvidence={setEvidence}
            />
            {inspector && (
              <aside className="reading-inspector">
                <h2>
                  围绕原文追问
                  <button
                    aria-label="关闭追问"
                    onClick={() => setInspector(false)}
                  >
                    <X size={16} />
                  </button>
                </h2>
                <p>回答可能有误，请核对原文。</p>
                {[
                  "这个结论的原文依据是什么？",
                  "你会优先修改哪里？",
                  "还有哪些替代方案？",
                ].map((q) => (
                  <button
                    disabled={asking}
                    className="question-suggestion"
                    key={q}
                    onClick={() => {
                      setQuestion(q);
                      void ask(q);
                    }}
                  >
                    {q}
                  </button>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void ask(question);
                  }}
                >
                  <textarea
                    aria-label="向模型提问"
                    maxLength={1500}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="提出你的问题…"
                  />
                  <button disabled={asking || !question.trim()}>
                    {asking ? "思考中…" : "发送问题"}
                  </button>
                </form>
                <div className="inspector-answer" role="status">
                  {answer ||
                    (!configured ? "模型未连接，当前不提供 AI 问答。" : "")}
                </div>
              </aside>
            )}
          </div>
        )}
      </main>
      <Dialog open={settings} onOpenChange={setSettings}>
        <DialogContent>
          <DialogTitle className="dialog-title">模型与隐私</DialogTitle>
          <DialogDescription className="dialog-description">
            本地检查不需要密钥；语义分析需要连接模型。
          </DialogDescription>
          <div className="settings-info">
            <h3>{configured ? "OpenAI 模型已连接" : "尚未连接 OpenAI 模型"}</h3>
            <p>
              部署维护者需要在服务端配置 OPENAI_API_KEY，可选配置
              OPENAI_MODEL。密钥不会在浏览器中填写或保存。
            </p>
            <p>
              本地检查使用 Babel 解析 JavaScript / TypeScript，并使用 Prettier
              整理排版。它不会推断业务意图或检查论文事实。
            </p>
            <p>
              AI 分析在你确认后才发送当前材料。网站不持久保存材料；请求使用
              store: false，模型服务的数据处理仍受供应商政策约束。
            </p>
            <p>此站不会执行上传的代码，也不会自动应用重构。</p>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!evidence}
        onOpenChange={(open) => {
          if (!open) setEvidence(null);
        }}
      >
        <DialogContent className="source-dialog">
          <DialogTitle className="dialog-title">原文依据</DialogTitle>
          <DialogDescription className="dialog-description">
            {source?.name} · 第 {evidence?.evidence.line} 行
          </DialogDescription>
          <pre tabIndex={0} className="source-view">
            {source?.content.split("\n").map((line, i) => (
              <div
                key={i}
                className={
                  i + 1 === evidence?.evidence.line ? "highlighted" : ""
                }
              >
                <span>{i + 1}</span>
                <code>{line || " "}</code>
              </div>
            ))}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
