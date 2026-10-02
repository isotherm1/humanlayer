import { Layers3, Lightbulb, ChevronRight, CircleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IssueCard } from "@/components/workspace/issue-card";
import type { ArtifactDemo, Issue, WorkspaceView, Severity } from "@/types/artifact";
export function Overview({
  demo,
  onNavigate,
  onInspect,
}: {
  demo: ArtifactDemo;
  onNavigate: (view: WorkspaceView, severity?: Severity | "all") => void;
  onInspect: (issue: Issue) => void;
}) {
  const circumference = 2 * Math.PI * 43;
  return (
    <div className="overview-view">
      <section className="overview-lead-grid">
        <article className="readability-card">
          <div className="card-topline">
            <span>Human Readability</span>
            <Badge>Sample score</Badge>
          </div>
          <div className="readability-content">
            <div className="readability-ring">
              <svg viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="43" className="ring-track" />
                <circle
                  cx="50"
                  cy="50"
                  r="43"
                  className="ring-value"
                  strokeDasharray={circumference}
                  strokeDashoffset={
                    circumference * (1 - demo.readability / 100)
                  }
                />
              </svg>
              <div>
                <strong>{demo.readability}</strong>
                <span>/ 100</span>
              </div>
            </div>
            <div>
              <h2>{demo.headline}</h2>
              <p>{demo.summary}</p>
            </div>
          </div>
          <div className="readability-caption">
            <span className="amber-tick" />
            Illustrative assessment · not computed from your file
          </div>
        </article>
        <article className="intent-card">
          <div className="card-topline">
            <span>
              <Lightbulb size={14} />
              Reconstructed Intent
            </span>
            <span className="eyebrow">INFERENCE</span>
          </div>
          <h2>{demo.reconstructedIntent}</h2>
          <p>
            A reading of the sample’s purpose, grounded in visible structure.
          </p>
          <button onClick={() => onNavigate("creation-logic")}>
            Explore creation logic
            <ChevronRight size={14} />
          </button>
        </article>
      </section>
      <section className="metrics-grid" aria-label="Sample quality scores">
        {demo.metrics.map((m) => (
          <article className="metric-card" key={m.label} title={m.description}>
            <div>
              {m.label}
              <span>/ 100</span>
            </div>
            <strong>{m.value}</strong>
            <div className="metric-segments" aria-hidden="true">
              {Array.from({ length: 12 }, (_, i) => (
                <i
                  key={i}
                  className={
                    i < Math.round((m.value / 100) * 12) ? "filled" : ""
                  }
                />
              ))}
            </div>
          </article>
        ))}
      </section>
      <section className="pattern-card">
        <div className="pattern-icon">
          <Layers3 size={22} strokeWidth={1.5} />
        </div>
        <div className="pattern-main">
          <span className="eyebrow">LIKELY CREATION PATTERN</span>
          <h2>{demo.pattern}</h2>
          <p>{demo.patternExplanation}</p>
        </div>
        <div className="confidence-block">
          <strong>
            {demo.confidence}
            <span>%</span>
          </strong>
          <span>Confidence</span>
          <div>
            <i style={{ width: `${demo.confidence}%` }} />
          </div>
        </div>
      </section>
      <section className="overview-issues">
        <div className="section-heading">
          <div>
            <h2>Where understanding breaks down</h2>
            <p>Review the evidence before choosing a change.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("issues")}
          >
            All issues
            <ChevronRight size={14} />
          </Button>
        </div>
        <div className="issue-summary">
          {(["high", "medium", "low"] as const).map((s) => (
            <button key={s} onClick={() => onNavigate("issues", s)}>
              <span className={`severity-mark ${s}`} />
              <strong>
                {demo.issues.filter((i) => i.severity === s).length}
              </strong>
              <span>{s} severity</span>
            </button>
          ))}
          <span className="issue-summary-total">
            <CircleAlert size={13} />
            {demo.issues.length} sample observations
          </span>
        </div>
        <div className="overview-issue-list">
          {demo.issues.slice(0, 2).map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              compact
              onInspect={() => onInspect(issue)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
