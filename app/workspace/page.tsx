import { Suspense } from "react";
import type { Metadata } from "next";
import { Workspace } from "@/components/workspace/workspace";
export const metadata: Metadata = { title: "Workspace" };
export default function WorkspacePage() {
  return (
    <Suspense
      fallback={<div className="workspace-loading">Opening the workspace…</div>}
    >
      <Workspace />
    </Suspense>
  );
}
