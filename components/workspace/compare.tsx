"use client";
import { useMemo, useState } from "react";
import {
  Columns2,
  Rows3,
  FileCode2,
  FileText,
  Info,
  Download,
} from "lucide-react";
import { ExportButton } from "@/components/export-button";
import { CodeBlock, DiffBlock } from "@/components/workspace/code-block";
import { compareLines } from "@/lib/comparison";
import type { ArtifactDemo } from "@/types/artifact";
export function Compare({ demo }: { demo: ArtifactDemo }) {
  const [view, setView] = useState<"split" | "unified">("split");
  const lines = useMemo(
    () => compareLines(demo.original, demo.reconstructed),
    [demo],
  );
  const added = lines.filter((l) => l.kind === "added").length,
    removed = lines.filter((l) => l.kind === "removed").length;
  return (
    <div className="compare-view">
      <div className="comparison-toolbar">
        <span>
          {demo.kind === "code" ? (
            <FileCode2 size={15} />
          ) : (
            <FileText size={15} />
          )}
          <code>{demo.originalFile}</code>
        </span>
        <div className="comparison-controls">
          <div
            className="segmented-control"
            role="group"
            aria-label="Comparison layout"
          >
            <button
              className={view === "split" ? "active" : ""}
              onClick={() => setView("split")}
              aria-pressed={view === "split"}
            >
              <Columns2 size={14} />
              Split
            </button>
            <button
              className={view === "unified" ? "active" : ""}
              onClick={() => setView("unified")}
              aria-pressed={view === "unified"}
            >
              <Rows3 size={14} />
              Unified
            </button>
          </div>
          <ExportButton size="icon" variant="ghost" aria-label="Export sample proposal" title="Export sample proposal" filename={demo.kind === "code" ? "gate.proposed.ts" : "abstract.proposed.md"} content={demo.reconstructed}>
            <Download size={16} />
          </ExportButton>
        </div>
      </div>
      {view === "split" ? (
        <div className="comparison-split">
          <section>
            <header>
              <span>Original</span>
              <small>Sample artifact</small>
            </header>
            <CodeBlock
              code={demo.original}
              language={demo.language}
              label="Original sample artifact"
            />
          </section>
          <section>
            <header>
              <span>Reconstructed</span>
              <small className="proposal-label">Proposal · unverified</small>
            </header>
            <CodeBlock
              code={demo.reconstructed}
              language={demo.language}
              label="Reconstructed sample proposal"
            />
          </section>
        </div>
      ) : (
        <div className="unified-panel">
          <header>
            <span>Original → proposed reconstruction</span>
            <small>Sample diff</small>
          </header>
          <DiffBlock lines={lines} language={demo.language} />
        </div>
      )}
      <div className="comparison-footer">
        <span>
          <b className="added-count">+{added}</b>
          <b className="removed-count">−{removed}</b>lines in the bundled
          example
        </span>
        <span>No changes applied</span>
      </div>
      <div className="comparison-warning">
        <Info size={17} />
        <p>
          {demo.kind === "code"
            ? "This sample proposal changes header parsing and the error contract. Semantic equivalence has not been established, and the artifact tests have not been run."
            : "This proposal changes the scope of the claims. The author must confirm factual preservation against the full manuscript. No statistical or citation verification has run."}
        </p>
      </div>
    </div>
  );
}
