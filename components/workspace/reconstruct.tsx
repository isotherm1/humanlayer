"use client";
import { useState } from "react";
import { Wand2, Columns2, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { downloadText } from "@/lib/utils";
import type { ArtifactDemo, WorkspaceView } from "@/types/artifact";
export function Reconstruct({
  demo,
  onNavigate,
}: {
  demo: ArtifactDemo;
  onNavigate: (view: WorkspaceView) => void;
}) {
  const [selected, setSelected] = useState<string[]>(
    demo.reconstruction.map((s) => s.title),
  );
  function toggle(title: string) {
    setSelected((s) =>
      s.includes(title) ? s.filter((t) => t !== title) : [...s, title],
    );
  }
  return (
    <div className="reconstruct-view">
      <article className="reconstruct-intro">
        <div className="reconstruct-symbol">
          <Wand2 size={24} />
        </div>
        <div>
          <Badge>Proposed reconstruction</Badge>
          <h2>Less indirection. More understanding.</h2>
          <p>
            Stage a review plan for the sample. Nothing is rewritten or applied
            to your artifact.
          </p>
        </div>
      </article>
      <div className="reconstruction-steps">
        {demo.reconstruction.map((s, i) => (
          <label
            key={s.title}
            className={selected.includes(s.title) ? "selected" : ""}
          >
            <input
              type="checkbox"
              checked={selected.includes(s.title)}
              onChange={() => toggle(s.title)}
            />
            <span className="reconstruct-step-index">0{i + 1}</span>
            <div>
              <h3>{s.title}</h3>
              <p>{s.detail}</p>
              <span>{s.scope}</span>
            </div>
          </label>
        ))}
      </div>
      <div className="reconstruction-actions">
        <span>{selected.length} review items selected</span>
        <Button
          variant="outline"
          disabled={!selected.length}
          onClick={() =>
            downloadText(
              "humanlayer-review-plan.md",
              `# HumanLayer sample review plan\n\nDemo data only. No AI analysis or changes applied.\n\n${demo.reconstruction
                .filter((s) => selected.includes(s.title))
                .map((s) => `## ${s.title}\n\n${s.detail}\n\nScope: ${s.scope}`)
                .join("\n\n")}`,
            )
          }
        >
          <Download size={15} />
          Export review plan
        </Button>
        <Button onClick={() => onNavigate("compare")}>
          <Columns2 size={15} />
          View bundled proposal
        </Button>
      </div>
      <div className="subtle-note">
        <Info size={15} />
        <p>
          Selection stages a review plan only. The comparison remains the fixed,
          illustrative proposal.
        </p>
      </div>
    </div>
  );
}
