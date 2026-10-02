"use client";
import { useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type NodeProps,
  type Node,
} from "@xyflow/react";
import type { LogicItem } from "@/types/analysis";
import "@xyflow/react/dist/style.css";
type ReadingNode = Node<{ item: LogicItem }, "reading">;
function ReadingStep({ data }: NodeProps<ReadingNode>) {
  return (
    <div className="reading-node">
      <Handle type="target" position={Position.Top} />
      <strong>{data.item.title}</strong>
      <p>{data.item.description}</p>
      <small>{data.item.file}</small>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
const nodeTypes = { reading: ReadingStep };
export function AnalysisGraph({
  items,
  inferred,
}: {
  items: LogicItem[];
  inferred: boolean;
}) {
  const [selected, setSelected] = useState(items[0]);
  if (!items.length)
    return (
      <p className="quiet-message">
        没有足够证据绘制关系图。可在报告中查看分析限制。
      </p>
    );
  return (
    <>
      <p className="section-note">
        {inferred
          ? "基于材料推断的阅读顺序，不代表恢复了作者的私人思考过程。"
          : "这里展示实际找到的函数定义，未推断函数之间的调用关系。"}
      </p>
      <div className="reading-graph">
        <ReactFlow<ReadingNode>
          nodes={items.map((item, i) => ({
            id: String(i),
            type: "reading",
            position: { x: (i % 2) * 350, y: Math.floor(i / 2) * 230 },
            data: { item },
          }))}
          edges={
            inferred
              ? items
                  .slice(1)
                  .map((_, i) => ({
                    id: `e${i}`,
                    source: String(i),
                    target: String(i + 1),
                    type: "smoothstep",
                  }))
              : []
          }
          nodeTypes={nodeTypes}
          fitView
          maxZoom={1}
          ariaLabelConfig={{
            "controls.zoomIn.ariaLabel": "放大",
            "controls.zoomOut.ariaLabel": "缩小",
            "controls.fitView.ariaLabel": "适应视图",
          }}
          nodesDraggable={false}
          nodesConnectable={false}
          minZoom={0.2}
          onNodeClick={(_, node) => setSelected(node.data.item)}
        >
          <Background />
          <Controls
            position="bottom-right"
            showInteractive={false}
            aria-label="图形缩放控件"
          />
        </ReactFlow>
      </div>
      {selected && (
        <section className="report-section">
          <h3>{selected.title}</h3>
          <p>{selected.description}</p>
          <small>{selected.file} · 原文证据</small>
          <pre className="evidence-text">{selected.quote}</pre>
        </section>
      )}
    </>
  );
}
