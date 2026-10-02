"use client";
import { useState } from "react";
import { Download, Copy } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { downloadText } from "@/lib/utils";
export function ExportButton({ filename, content, children, ...props }: ButtonProps & { filename: string; content: string }) {
  const [message, setMessage] = useState("");
  return <Dialog onOpenChange={() => setMessage("")}>
    <DialogTrigger asChild><Button {...props}>{children}</Button></DialogTrigger>
    <DialogContent>
      <DialogTitle className="dialog-title">Export preview</DialogTitle>
      <DialogDescription className="dialog-description">{filename} · Bundled sample only. Review, copy, or download the text. No analysis or artifact tests have been performed.</DialogDescription>
      <textarea aria-label="Exported sample text" className="paste-artifact-input" readOnly value={content} rows={10} />
      <div className="export-preview-actions">
        <Button variant="outline" onClick={async () => {
          try { await navigator.clipboard.writeText(content); setMessage("Sample text copied."); }
          catch { setMessage("Clipboard access is unavailable. Select the text above and copy it manually."); }
        }}><Copy size={14} />Copy text</Button>
        <Button onClick={() => { downloadText(filename, content); setMessage("Download requested. If your browser blocks it, copy the text above."); }}><Download size={14} />Download file</Button>
      </div>
      {message && <p role="status" className="dialog-note">{message}</p>}
    </DialogContent>
  </Dialog>;
}
