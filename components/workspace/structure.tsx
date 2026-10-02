"use client";
import { useState } from "react";
import { Folder, FileCode2, FileText, Layers3, Crosshair } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ArtifactDemo } from "@/types/artifact";
export function Structure({ demo }: { demo: ArtifactDemo }) {
  const [selected, setSelected] = useState(
    demo.structure.find((s) => s.type === "file") || demo.structure[0],
  );
  return (
    <div className="structure-view">
      <div className="structure-summary">
        <div>
          <Folder size={18} />
          <span>
            <strong>
              {demo.structure.filter((s) => s.type === "folder").length}
            </strong>
            folders
          </span>
        </div>
        <div>
          <FileCode2 size={18} />
          <span>
            <strong>
              {demo.structure.filter((s) => s.type === "file").length}
            </strong>
            files
          </span>
        </div>
        <Badge>Sample structure</Badge>
      </div>
      <div className="structure-grid">
        <section className="file-tree">
          <header>ARTIFACT MAP</header>
          {demo.structure.map((entry, i) => (
            <button
              key={i}
              className={selected.name === entry.name ? "selected" : ""}
              style={{ paddingLeft: 16 + entry.depth * 15 }}
              onClick={() => setSelected(entry)}
            >
              {entry.type === "folder" ? (
                <Folder size={15} />
              ) : entry.name.endsWith(".md") ? (
                <FileText size={15} />
              ) : (
                <FileCode2 size={15} />
              )}
              <span>{entry.name}</span>
              {entry.lines && <small>{entry.lines}</small>}
            </button>
          ))}
        </section>
        <section className="structure-detail">
          <span className="detail-symbol">
            <Crosshair size={22} />
          </span>
          <span className="eyebrow">
            SELECTED {selected.type.toUpperCase()}
          </span>
          <h2>{selected.name}</h2>
          <div className="structure-detail-item">
            <span>Responsibility</span>
            <strong>{selected.role}</strong>
          </div>
          <div className="structure-detail-item">
            <span>Context</span>
            <p>{demo.reconstructedIntent}</p>
          </div>
          <div className="structure-detail-item">
            <span>Evidence boundary</span>
            <p>
              These file roles are bundled sample metadata. The imported
              artifact has not been parsed.
            </p>
          </div>
          {selected.lines && <Badge>{selected.lines} illustrative lines</Badge>}
        </section>
      </div>
      <article className="responsibility-note">
        <Layers3 size={20} />
        <div>
          <h3>Keep responsibilities visible.</h3>
          <p>
            {demo.kind === "code"
              ? "The example separates verification, request integration, and route consumption. The issue is how much indirection sits inside each boundary."
              : "The example separates question, method, observation, and interpretation. Claim scope should follow the evidence in each section."}
          </p>
        </div>
      </article>
    </div>
  );
}
