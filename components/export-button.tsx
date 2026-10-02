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
      <DialogTitle className="dialog-title">导出预览</DialogTitle>
      <DialogDescription className="dialog-description">{filename} · 请审阅后复制或下载。分析建议尚未经过项目测试。</DialogDescription>
      <textarea aria-label="待导出的文本" className="paste-artifact-input" readOnly value={content} rows={10} />
      <div className="export-preview-actions">
        <Button variant="outline" onClick={async () => {
          try { await navigator.clipboard.writeText(content); setMessage("已复制文本。"); }
          catch { setMessage("无法访问剪贴板，请选中上方文本后手动复制。"); }
        }}><Copy size={14} />复制文本</Button>
        <Button onClick={() => { downloadText(filename, content); setMessage("已请求下载。如果浏览器阻止下载，可复制上方文本。"); }}><Download size={14} />下载文件</Button>
      </div>
      {message && <p role="status" className="dialog-note">{message}</p>}
    </DialogContent>
  </Dialog>;
}
