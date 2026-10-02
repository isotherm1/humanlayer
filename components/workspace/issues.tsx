"use client";
import { useState } from "react";
import { Filter, CircleAlert } from "lucide-react";
import { IssueCard } from "@/components/workspace/issue-card";
import type { ArtifactDemo, Issue, Severity } from "@/types/artifact";
export function Issues({
  demo,
  onInspect,
  initialFilter = "all",
}: {
  demo: ArtifactDemo;
  initialFilter?: Severity | "all";
  onInspect: (issue: Issue) => void;
}) {
  const [filter, setFilter] = useState<Severity | "all">(initialFilter);
  const issues = demo.issues.filter(
    (i) => filter === "all" || i.severity === filter,
  );
  return (
    <div className="issues-view">
      <div className="issues-toolbar">
        <span>
          <Filter size={14} />
          Severity
        </span>
        <div role="group" aria-label="Filter issues by severity">
          {(["all", "high", "medium", "low"] as const).map((s) => (
            <button
              key={s}
              className={filter === s ? "selected" : ""}
              onClick={() => setFilter(s)}
              aria-pressed={filter === s}
            >
              {s}
              <span>
                {s === "all"
                  ? demo.issues.length
                  : demo.issues.filter((i) => i.severity === s).length}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="issues-list">
        {issues.map((i) => (
          <IssueCard key={i.id} issue={i} onInspect={() => onInspect(i)} />
        ))}
      </div>
      {issues.length === 0 && (
        <div className="no-issues">
          <CircleAlert size={22} />
          <p>No sample issues at this severity.</p>
        </div>
      )}
      <p className="view-footnote">
        All observations and confidence values are authored demonstration data.
      </p>
    </div>
  );
}
