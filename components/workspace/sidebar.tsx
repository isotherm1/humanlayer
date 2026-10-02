import Link from "next/link";
import {
  LayoutDashboard,
  Workflow,
  FolderTree,
  CircleAlert,
  Wand2,
  Columns2,
  ShieldCheck,
  FolderCode,
  FileText,
  ChevronDown,
  Import,
} from "lucide-react";
import { navigation, product } from "@/lib/product";
import { Badge } from "@/components/ui/badge";
import type { ArtifactDemo, WorkspaceView } from "@/types/artifact";
const icons = {
  overview: LayoutDashboard,
  "creation-logic": Workflow,
  structure: FolderTree,
  issues: CircleAlert,
  reconstruct: Wand2,
  compare: Columns2,
  verification: ShieldCheck,
};
export function Sidebar({
  view,
  onNavigate,
  demo,
}: {
  view: WorkspaceView;
  onNavigate: (view: WorkspaceView) => void;
  demo: ArtifactDemo;
}) {
  return (
    <div className="sidebar-inner">
      <Link href="/" className="artifact-switch">
        <span>
          {demo.kind === "code" ? (
            <FolderCode size={19} />
          ) : (
            <FileText size={19} />
          )}
        </span>
        <div>
          <strong>{demo.name}</strong>
          <small>
            {demo.kind === "code" ? "Code artifact" : "Paper artifact"}
          </small>
        </div>
        <ChevronDown size={14} />
      </Link>
      <nav className="sidebar-nav" aria-label="Analysis navigation">
        {navigation.map((group, i) => (
          <div className="navigation-group" key={i}>
            {group.group && (
              <span className="nav-group-label">{group.group}</span>
            )}
            {group.items.map((item) => {
              const Icon = icons[item.id];
              return (
                <button
                  key={item.id}
                  className={`sidebar-item ${view === item.id ? "selected" : ""}`}
                  aria-current={view === item.id ? "page" : undefined}
                  onClick={() => onNavigate(item.id)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                  {item.id === "issues" && (
                    <span className="nav-count">{demo.issues.length}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sample-artifact-label">
          <Badge>Sample artifact</Badge>
          <p>No live analysis is connected.</p>
        </div>
        <Link href="/" className="import-another">
          <Import size={15} />
          Choose another artifact
        </Link>
        <div className="sidebar-meta">
          <span>HUMANLAYER</span>
          <span>v{product.version}</span>
        </div>
      </div>
    </div>
  );
}
