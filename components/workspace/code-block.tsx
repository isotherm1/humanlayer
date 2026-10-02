import type { DiffLine } from "@/lib/comparison";
function Syntax({ line }: { line: string }) {
  return line
    .split(
      /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/.*|\b(?:import|from|type|export|function|return|const|if|try|catch|throw|new|async|undefined|string|any|unknown)\b|\b\d+\b)/g,
    )
    .map((t, i) => (
      <span
        key={i}
        className={
          t.startsWith("//")
            ? "syntax-comment"
            : /^['"]/.test(t)
              ? "syntax-string"
              : /^(import|from|type|export|function|return|const|if|try|catch|throw|new|async|undefined|string|any|unknown)$/.test(
                    t,
                  )
                ? "syntax-keyword"
                : /^\d+$/.test(t)
                  ? "syntax-number"
                  : ""
        }
      >
        {t}
      </span>
    ));
}
export function CodeBlock({
  code,
  language,
  label,
}: {
  code: string;
  language: string;
  label: string;
}) {
  return (
    <div className="code-block" tabIndex={0} aria-label={label}>
      <pre>
        {code.split("\n").map((line, i) => (
          <div className="code-row" key={i}>
            <span className="code-number">{i + 1}</span>
            <code>
              {language === "markdown" ? line : <Syntax line={line} />}
            </code>
          </div>
        ))}
      </pre>
    </div>
  );
}
export function DiffBlock({
  lines,
  language,
}: {
  lines: DiffLine[];
  language: string;
}) {
  return (
    <div
      className="code-block unified-code"
      tabIndex={0}
      aria-label="Unified sample diff. Plus marks additions; minus marks removals."
    >
      <pre>
        {lines.map((line, i) => (
          <div key={i} className={`code-row diff-${line.kind}`}>
            <span className="code-number">{line.before ?? ""}</span>
            <span className="code-number">{line.after ?? ""}</span>
            <span className="diff-marker">
              {line.kind === "added"
                ? "+"
                : line.kind === "removed"
                  ? "−"
                  : " "}
            </span>
            <code>
              {language === "markdown" ? (
                line.text
              ) : (
                <Syntax line={line.text} />
              )}
            </code>
          </div>
        ))}
      </pre>
    </div>
  );
}
