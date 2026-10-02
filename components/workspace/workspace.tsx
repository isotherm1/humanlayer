"use client";
import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ChevronRight,
  Download,
  PanelRight,
  Menu,
  FileCode2,
  FileText,
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
import { Sidebar } from "@/components/workspace/sidebar";
import { Inspector } from "@/components/workspace/inspector";
import { Overview } from "@/components/workspace/overview";
import { CreationLogic } from "@/components/workspace/creation-logic";
import { Issues } from "@/components/workspace/issues";
import { Structure } from "@/components/workspace/structure";
import { Reconstruct } from "@/components/workspace/reconstruct";
import { Compare } from "@/components/workspace/compare";
import { Verification } from "@/components/workspace/verification";
import { demos } from "@/lib/mock-data";
import { viewDescriptions, navigation } from "@/lib/product";
import { ExportButton } from "@/components/export-button";
import { sampleReport } from "@/lib/report";
import type { ArtifactKind, Issue, WorkspaceView, Severity } from "@/types/artifact";
export function Workspace() {
  const mainRef = useRef<HTMLElement>(null);
  const params = useSearchParams();
  const router = useRouter();
  const kind: ArtifactKind = params.get("kind") === "paper" ? "paper" : "code";
  const [view, setView] = useState<WorkspaceView>("overview"),
    [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issueFilter, setIssueFilter] = useState<Severity | "all">("all");
  const [navOpen, setNavOpen] = useState(false),
    [inspectorOpen, setInspectorOpen] = useState(false);
  const demo = demos[kind];
  const title =
    navigation.flatMap((g) => g.items).find((i) => i.id === view)?.label ||
    "Overview";
  function navigate(next: WorkspaceView, severity: Severity | "all" = "all") {
    setIssueFilter(severity);
    setView(next);
    mainRef.current?.scrollTo({ top: 0 });
    setNavOpen(false);
  }
  function inspect(issue: Issue) {
    setSelectedIssue(issue);
    if (window.innerWidth < 1280) setInspectorOpen(true);
  }
  function selectDemo(next: ArtifactKind) {
    router.replace(`/workspace/?kind=${next}`, { scroll: false });
    setView("overview");
    mainRef.current?.scrollTo({ top: 0 });
    setSelectedIssue(null);
  }
  function viewContent() {
    switch (view) {
      case "overview":
        return (
          <Overview demo={demo} onNavigate={navigate} onInspect={inspect} />
        );
      case "creation-logic":
        return <CreationLogic key={kind} demo={demo} />;
      case "structure":
        return <Structure key={kind} demo={demo} />;
      case "issues":
        return <Issues key={`${kind}-${issueFilter}`} demo={demo} initialFilter={issueFilter} onInspect={inspect} />;
      case "reconstruct":
        return <Reconstruct key={kind} demo={demo} onNavigate={navigate} />;
      case "compare":
        return <Compare key={kind} demo={demo} />;
      case "verification":
        return <Verification demo={demo} />;
    }
  }
  return (
    <div className="workspace-page">
      <header className="workspace-header">
        <div className="workspace-brand-group">
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu-button"
            onClick={() => setNavOpen(true)}
            aria-label="Open workspace navigation"
          >
            <Menu size={18} />
          </Button>
          <Brand />
        </div>
        <div className="workspace-breadcrumb">
          <span>
            {demo.kind === "code" ? (
              <FileCode2 size={14} />
            ) : (
              <FileText size={14} />
            )}
            <button onClick={() => navigate("overview")}>{demo.name}</button>
          </span>
          <ChevronRight size={12} />
          <strong>{title}</strong>
        </div>
        <div className="workspace-header-actions">
          <Badge className="demo-data-badge">Demo data</Badge>
          <Button
            variant="ghost"
            size="icon"
            className="inspector-toggle"
            onClick={() => setInspectorOpen(true)}
            aria-label="Open AI Inspector"
          >
            <PanelRight size={17} />
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <Sidebar demo={demo} view={view} onNavigate={navigate} />
        </aside>
        <main ref={mainRef} className="workspace-main" id="workspace-main">
          <div className="workspace-content">
            <div className="workspace-title-row">
              <div>
                <div className="workspace-eyebrow">
                  ARTIFACT ANALYSIS <span>/ SAMPLE</span>
                </div>
                <h1>{title}</h1>
                <p>{viewDescriptions[view]}</p>
              </div>
              <ExportButton variant="outline" size="sm" className="export-report" filename={`humanlayer-${kind}-sample-report.md`} content={sampleReport(demo)}>
                <Download size={14} /><span>Export report</span>
              </ExportButton>
            </div>
            <div className="sample-context-bar">
              <span>
                <span className="sample-square" />
                Illustrative sample · no AI analysis performed
              </span>
              <select
                value={kind}
                onChange={(e) => selectDemo(e.target.value as ArtifactKind)}
                aria-label="Select sample artifact"
              >
                <option value="code">Code example</option>
                <option value="paper">Paper example</option>
              </select>
            </div>
            <motion.div
              key={`${kind}-${view}`}
              initial={{ opacity: 1, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16 }}
            >
              {viewContent()}
            </motion.div>
            <div className="workspace-content-footer">
              <span>Evidence first. Human judgment always.</span>
              <span>Product shell · v0.1.0</span>
            </div>
          </div>
        </main>
        <aside className="inspector-desktop" aria-label="AI Inspector">
          <Inspector
            key={kind}
            demo={demo}
            selectedIssue={selectedIssue}
            onClearIssue={() => setSelectedIssue(null)}
          />
        </aside>
      </div>
      <Dialog open={navOpen} onOpenChange={setNavOpen}>
        <DialogContent className="mobile-navigation-dialog">
          <DialogTitle className="sr-only">Workspace navigation</DialogTitle>
          <DialogDescription className="sr-only">
            Choose an analysis view.
          </DialogDescription>
          <Brand />
          <Sidebar demo={demo} view={view} onNavigate={navigate} />
        </DialogContent>
      </Dialog>
      <Dialog open={inspectorOpen} onOpenChange={setInspectorOpen}>
        <DialogContent className="inspector-dialog">
          <DialogTitle className="sr-only">
            AI Inspector sample conversation
          </DialogTitle>
          <DialogDescription className="sr-only">
            Prewritten sample answers, not live AI analysis.
          </DialogDescription>
          <Inspector
            key={kind}
            demo={demo}
            selectedIssue={selectedIssue}
            onClearIssue={() => setSelectedIssue(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
