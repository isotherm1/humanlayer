"use client";
import { useState } from "react";
import {
  ChevronDown,
  FileCode2,
  CornerDownRight,
  Crosshair,
} from "lucide-react";
import type { Issue } from "@/types/artifact";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
export function IssueCard({
  issue,
  compact = false,
  onInspect,
}: {
  issue: Issue;
  compact?: boolean;
  onInspect: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <article className={`issue-card ${open ? "expanded" : ""}`}>
      <div className="issue-card-top">
        <span className={`severity-mark ${issue.severity}`} />
        <span className="issue-id">{issue.id}</span>
        <Badge className={`severity-badge ${issue.severity}`}>
          {issue.severity}
        </Badge>
        <span className="issue-confidence">{issue.confidence}% confidence</span>
      </div>
      <h3>{issue.title}</h3>
      <p className="issue-explanation">{issue.explanation}</p>
      <div className="issue-card-footer">
        <span>
          <FileCode2 size={13} />
          {issue.evidence.file}
          <b>{issue.evidence.location}</b>
        </span>
        <button onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? "Hide details" : compact ? "Review issue" : "View evidence"}
          <ChevronDown size={14} className={open ? "rotated" : ""} />
        </button>
      </div>
      {open && (
        <div className="issue-details">
          <div>
            <h4>Evidence</h4>
            <pre>{issue.evidence.excerpt}</pre>
            <p>{issue.evidence.observation}</p>
          </div>
          <div>
            <h4>Why it matters</h4>
            <p>{issue.whyItMatters}</p>
          </div>
          <div className="suggested-reconstruction">
            <h4>
              <CornerDownRight size={14} />
              Suggested reconstruction
            </h4>
            <p>{issue.reconstruction}</p>
          </div>
          <Button size="sm" variant="outline" onClick={onInspect}>
            <Crosshair size={14} />
            Inspect this evidence
          </Button>
        </div>
      )}
    </article>
  );
}
