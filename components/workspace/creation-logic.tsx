"use client";
import { useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  type Node,
  type NodeProps,
  type Edge,
} from "@xyflow/react";
import { Crosshair, FileCode2, GitBranch, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ArtifactDemo, LogicStep } from "@/types/artifact";
import "@xyflow/react/dist/style.css";
type LogicNode = Node<{ step: LogicStep }, "logic">;
function CreationNode({ data, selected }: NodeProps<LogicNode>) {
  const s = data.step;
  return (
    <div className={`creation-node ${selected ? "node-selected" : ""}`}>
      <Handle type="target" position={Position.Left} />
      <div className="creation-node-top">
        <span>{s.category}</span>
        <GitBranch size={13} />
      </div>
      <h3>{s.title}</h3>
      <p>{s.description}</p>
      <div className="creation-node-bottom">
        <span>
          <FileCode2 size={12} />
          Evidence attached
        </span>
        <strong>{s.confidence}%</strong>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
const nodeTypes = { logic: CreationNode };
export function CreationLogic({ demo }: { demo: ArtifactDemo }) {
  const [nodes, , onNodesChange] = useNodesState<LogicNode>(
    demo.logic.map((step, i) => ({
      id: step.id,
      type: "logic",
      position: { x: step.x, y: step.y },
      data: { step },
      selected: i === 0,
    })),
  );
  const [selected, setSelected] = useState(demo.logic[0]);
  const edges: Edge[] = demo.logic
    .slice(1)
    .map((step, i) => ({
      id: `link-${i}`,
      source: demo.logic[i].id,
      target: step.id,
      type: "smoothstep",
      markerEnd: { type: MarkerType.ArrowClosed, color: "#68604f" },
      style: { stroke: "#68604f", strokeWidth: 1.3 },
    }));
  return (
    <div className="logic-view">
      <div className="logic-top-note">
        <Badge>Inferred Creation Logic</Badge>
        <p>
          A plausible interpretation of the sample. Select a node to inspect its
          evidence.
        </p>
      </div>
      <div className="logic-canvas">
        <ReactFlow<LogicNode>
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeClick={(_, node) => setSelected(node.data.step)}
          onSelectionChange={({ nodes: selectedNodes }) => {
            if (selectedNodes[0]) setSelected(selectedNodes[0].data.step);
          }}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.3}
          maxZoom={1.4}
          nodesConnectable={false}
          colorMode="dark"
          ariaLabelConfig={{
            "node.a11yDescription.default":
              "Select a node to inspect sample evidence. Use arrow keys to move a focused node.",
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={22}
            size={1}
            color="var(--graph-dot)"
          />
          <Controls showInteractive={false} />
          <div className="graph-legend">
            <span />
            INFERRED RELATIONSHIPS
          </div>
        </ReactFlow>
      </div>
      <article className="node-evidence-panel">
        <div className="node-evidence-title">
          <span>
            <Crosshair size={16} />
            {selected.title}
          </span>
          <Badge>{selected.confidence}% confidence</Badge>
        </div>
        <div className="node-evidence-grid">
          <div>
            <span className="eyebrow">RECONSTRUCTED INTENT</span>
            <p>{selected.description}</p>
          </div>
          <div>
            <span className="eyebrow">EVIDENCE</span>
            <p className="evidence-location">
              <FileCode2 size={14} />
              {selected.evidence}
            </p>
          </div>
        </div>
        <div className="interpretation-boundary">
          <Info size={14} />
          This node describes a likely design step, not recovered private
          reasoning.
        </div>
      </article>
    </div>
  );
}
