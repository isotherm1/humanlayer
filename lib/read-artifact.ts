import type { SourceFile } from "../types/analysis.ts";
import { MAX_CHARACTERS, validateSources } from "./analysis-contract.ts";
export function languageOf(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  return (
    (
      {
        ts: "typescript",
        tsx: "tsx",
        js: "javascript",
        jsx: "jsx",
        py: "python",
        md: "markdown",
        txt: "text",
        pdf: "text",
      } as Record<string, string>
    )[ext || ""] || "text"
  );
}
const allowed = /\.(ts|tsx|js|jsx|py|md|txt)$/i;
export async function readArtifacts(
  selected: File[],
): Promise<{ files: SourceFile[]; warnings: string[] }> {
  if (selected.length > 20) throw new Error("一次最多选择 20 个文件。");
  const files: SourceFile[] = [],
    warnings: string[] = [];
  let total = 0;
  const add = (name: string, content: string) => {
    if (content.includes("\0")) throw new Error(`${name} 不是可读的文本文件。`);
    total += content.length;
    if (total > MAX_CHARACTERS)
      throw new Error("材料超过 48,000 字符，请分批提交，不会自动截断。");
    files.push({ name, content, language: languageOf(name) });
  };
  for (const file of selected) {
    if (file.size > 5_000_000) throw new Error(`${file.name} 超过 5 MB。`);
    if (file.name.toLowerCase().endsWith(".pdf")) {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
      const task = pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
      });
      try {
        const pdf = await task.promise;
        if (pdf.numPages > 80) throw new Error("PDF 超过 80 页，请先拆分。");
        let content = "";
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p),
            text = await page.getTextContent();
          content +=
            `[第 ${p} 页]\n` +
            text.items
              .map((item) =>
                "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "",
              )
              .join("") +
            "\n\n";
          if (content.length > MAX_CHARACTERS)
            throw new Error("PDF 文字超过 48,000 字符，请先拆分。");
          page.cleanup();
        }
        if (content.replace(/\[第 \d+ 页\]/g, "").trim().length < 20)
          throw new Error(
            "这个 PDF 没有足够的可提取文字。扫描件暂不支持 OCR，请粘贴文字。",
          );
        add(file.name, content);
        warnings.push(
          "PDF 以提取文字进行分析，不保留图表、数学公式布局或版面信息。",
        );
      } finally {
        await task.destroy();
      }
    } else if (file.name.toLowerCase().endsWith(".zip")) {
      if (file.size > 1_000_000)
        throw new Error("ZIP 超过 1 MB，请缩小项目范围。");
      const { unzipSync, strFromU8 } = await import("fflate");
      let expanded = 0,
        count = 0;
      const output = unzipSync(new Uint8Array(await file.arrayBuffer()), {
        filter: (entry) => {
          if (
            !allowed.test(entry.name) ||
            /(^|\/)(node_modules|\.git|dist|build|\.next|vendor|__MACOSX)(\/|$)/.test(
              entry.name,
            ) ||
            entry.name.split("/").includes("..") ||
            entry.name.startsWith("/")
          ) {
            warnings.push(`未读取：${entry.name}`);
            return false;
          }
          expanded += entry.originalSize;
          count++;
          if (entry.originalSize > 192000 || expanded > 192000 || count > 20)
            throw new Error(
              "ZIP 的文本文件超过读取范围（20 个文件、192 KB），请缩小项目。",
            );
          return true;
        },
      });
      for (const [name, bytes] of Object.entries(output)) {
        if (bytes.length > 192000) throw new Error("解压结果超过上限。");
        add(name, strFromU8(bytes));
      }
      if (!Object.keys(output).length)
        throw new Error("ZIP 中没有支持的源文件或文本。");
    } else {
      if (!allowed.test(file.name))
        throw new Error(
          "支持 ZIP、PY、JS、TS、TSX、PDF、MD、TXT。其他文件请复制文字后粘贴。",
        );
      if (file.size > 192000) throw new Error(`${file.name} 过大，请拆分。`);
      add(file.name, await file.text());
    }
  }
  return {
    files: validateSources(files),
    warnings: [...new Set(warnings)].slice(0, 30),
  };
}
