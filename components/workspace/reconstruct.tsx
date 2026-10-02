"use client";
import { useState } from "react";
import { Wand2, Columns2, Download, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExportButton } from "@/components/export-button";
import { reviewPlan } from "@/lib/report";
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
        <ExportButton variant="outline" disabled={!selected.length} filename="humanlayer-review-plan.md" content={reviewPlan(demo, selected)}>
          <Download size={15} />Export review plan
        </ExportButton>
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
