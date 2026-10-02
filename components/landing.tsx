"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Code2,
  FileText,
  Upload,
  FileUp,
  Github,
  Check,
  Shield,
  X,
  Layers3,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { product, supportedFormats, allowedExtensions } from "@/lib/product";
import type { ArtifactKind, ImportedArtifact } from "@/types/artifact";
export function Landing() {
  const [kind, setKind] = useState<ArtifactKind>("code"),
    [dragging, setDragging] = useState(false),
    [error, setError] = useState("");
  const [imported, setImported] = useState<ImportedArtifact | null>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  function accept(file: File | undefined) {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.has(extension)) {
      setError("Choose a ZIP, PY, JS, TS, TSX, PDF, MD, or TXT artifact.");
      return;
    }
    const selectedKind = extension === "pdf" ? "paper" : kind;
    if (selectedKind === "paper" && !["pdf", "md", "txt"].includes(extension)) {
      setError("For a paper, choose PDF, Markdown, or plain text.");
      return;
    }
    setKind(selectedKind);
    setError("");
    setImported({ name: file.name, kind: selectedKind, size: file.size });
  }
  const previewHref = imported
    ? `/workspace/?kind=${imported.kind}`
    : "/workspace/";
  return (
    <div className="landing-page">
      <header className="landing-header">
        <Brand />
        <Badge className="preview-tag">Product preview</Badge>
        <nav aria-label="Main navigation">
          <Button variant="ghost" asChild>
            <a href={product.repo} target="_blank" rel="noreferrer">
              <Github size={16} />
              GitHub
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/workspace/">Workspace</Link>
          </Button>
          <ThemeToggle />
        </nav>
      </header>
      <main className="landing-main">
        <motion.section
          className="landing-hero"
          initial={{ opacity: 1, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="hero-eyebrow">
            <span className="eyebrow-line" />A HUMAN LAYER FOR AI-MADE WORK
          </div>
          <h1>
            Understand AI-made work.
            <br />
            <span>
              Make it understandable
              <br className="mobile-break" /> by humans.
            </span>
          </h1>
          <p>
            AI can create.<span> Humans still need to understand.</span>
          </p>
        </motion.section>
        <motion.section
          className="artifact-uploader"
          initial={{ opacity: 1, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          aria-label="Import an artifact"
        >
          <div className="uploader-header">
            <div
              className="artifact-kind-switch"
              role="group"
              aria-label="Artifact type"
            >
              <button
                className={kind === "code" ? "active" : ""}
                onClick={() => {
                  setKind("code");
                  setError("");
                }}
                aria-pressed={kind === "code"}
              >
                <Code2 size={16} />
                Code
              </button>
              <button
                className={kind === "paper" ? "active" : ""}
                onClick={() => {
                  setKind("paper");
                  setError("");
                }}
                aria-pressed={kind === "paper"}
              >
                <FileText size={16} />
                Paper
              </button>
            </div>
            <span className="uploader-label">01 / IMPORT</span>
          </div>
          <div
            className={`upload-surface ${dragging ? "is-dragging" : ""}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(event) => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget as Node | null,
                )
              )
                setDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              accept(event.dataTransfer.files[0]);
            }}
          >
            <div className="upload-symbol">
              <FileUp size={25} strokeWidth={1.5} />
            </div>
            <h2>
              {dragging
                ? "Drop your artifact here"
                : "Bring the work. Find the thread."}
            </h2>
            <p>
              {kind === "code"
                ? "Source files, small projects, or a piece of generated code."
                : "A manuscript, research draft, or academic text."}
            </p>
            <Button
              variant="secondary"
              onClick={() => fileInput.current?.click()}
            >
              <Upload size={15} />
              Choose artifact
            </Button>
            <Button variant="ghost" onClick={() => setPasteOpen(true)}>Paste text</Button>
            <span className="drag-hint">or drag and drop a file</span>
            <input
              ref={fileInput}
              type="file"
              className="sr-only"
              tabIndex={-1}
              aria-label="Choose artifact file"
              accept={
                kind === "paper"
                  ? ".pdf,.md,.txt"
                  : ".zip,.py,.js,.ts,.tsx,.pdf,.md,.txt"
              }
              onChange={(event) => {
                accept(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </div>
          <div className="uploader-footer">
            <div
              className="format-list"
              aria-label="Supported artifact formats"
            >
              {supportedFormats.map((format) => (
                <span
                  key={format}
                  className={
                    kind === "paper" && !["PDF", "MD", "TXT"].includes(format)
                      ? "format-muted"
                      : ""
                  }
                >
                  {format}
                </span>
              ))}
            </div>
            <Button variant="ghost" asChild>
              <Link href={`/workspace/?kind=${kind}`}>
                <Layers3 size={15} />
                Try Example
              </Link>
            </Button>
          </div>
          {error && (
            <div className="upload-error" role="alert">
              {error}
              <button
                onClick={() => setError("")}
                aria-label="Dismiss file error"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </motion.section>
        <div className="landing-footnote">
          <Shield size={14} />
          <p>
            Prototype only. Files are not parsed or uploaded.
            <br />
            <span>The workspace uses clearly labeled sample data.</span>
          </p>
        </div>
      </main>
      <footer className="landing-footer">
        <span>
          HUMANLAYER <span className="footer-version">/ {product.version}</span>
        </span>
        <p>Understanding, not detection. Inferences, not private reasoning.</p>
        <a href={product.repo} target="_blank" rel="noreferrer">
          Open source
        </a>
      </footer>
      <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
        <DialogContent>
          <DialogTitle className="dialog-title">Paste an artifact</DialogTitle>
          <DialogDescription className="dialog-description">Preview the import workflow. Content stays in this page; no parsing or AI analysis is performed.</DialogDescription>
          <form onSubmit={(event) => {
            event.preventDefault();
            if (!pasted.trim()) return;
            setImported({ name: kind === "code" ? "Pasted code" : "Pasted paper", kind, size: new Blob([pasted]).size });
            setPasteOpen(false);
            setPasted("");
          }}>
            <label htmlFor="pasted-artifact" className="eyebrow">{kind === "code" ? "CODE" : "PAPER TEXT"}</label>
            <textarea id="pasted-artifact" className="paste-artifact-input" value={pasted} onChange={(event) => setPasted(event.target.value)} placeholder="Paste your artifact here…" maxLength={100000} rows={8} />
            <Button type="submit" className="w-full" disabled={!pasted.trim()}>Preview selection</Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!imported}
        onOpenChange={(open) => {
          if (!open) setImported(null);
        }}
      >
        <DialogContent>
          <div className="dialog-heading-icon">
            <Check size={21} />
          </div>
          <DialogTitle className="dialog-title">Artifact selected.</DialogTitle>
          <DialogDescription className="dialog-description">
            The product shell can preview the workflow. No content has been
            parsed, analyzed, or sent to a server.
          </DialogDescription>
          {imported && (
            <div className="selected-file">
              <FileText size={20} />
              <div>
                <strong>{imported.name}</strong>
                <span>
                  {(imported.size / 1024).toFixed(1)} KB ·{" "}
                  {imported.kind === "paper" ? "Paper" : "Code"}
                </span>
              </div>
            </div>
          )}
          <p className="dialog-note">
            The selection label stays on this page. The workspace will show a bundled
            example; none of its findings describe your selected artifact.
          </p>
          <Button className="w-full" asChild>
            <Link href={previewHref}>Open sample workspace</Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
