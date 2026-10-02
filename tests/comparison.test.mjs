import test from "node:test";
import assert from "node:assert/strict";
import { compareLines } from "../lib/comparison.ts";
import { sampleReport } from "../lib/report.ts";
import { demos } from "../lib/mock-data.ts";

for (const [name, before, after] of [
  ["unchanged", "a\nb", "a\nb"],
  ["replacement", "a\nb\nc", "a\nx\nc"],
  ["repeated lines", "x\nx\ny", "x\ny\nx"],
  ["empty to text", "", "hello"],
  ["remove all", "hello\nworld", ""],
  ["trailing newline", "a\n", "a"],
  ...Object.values(demos).map(d => [d.kind, d.original, d.reconstructed]),
]) {
  test(`diff preserves both documents and line numbers: ${name}`, () => {
    const diff = compareLines(before, after);
    for (const [field, omitted, source] of [["before", "added", before], ["after", "removed", after]]) {
      const lines = diff.filter(line => line.kind !== omitted);
      assert.equal(lines.map(line => line.text).join("\n"), source);
      assert.deepEqual(lines.map(line => line[field]), lines.map((_, i) => i + 1));
    }
  });
}
for (const demo of Object.values(demos)) {
  test(`report retains truthful verification boundary: ${demo.kind}`, () => {
    const report = sampleReport(demo);
    assert.ok(report.includes("\n\n## Semantic Verification\n"));
    assert.ok(report.includes("\n\n## Test Verification\n"));
    assert.ok(report.includes("All scores and confidence values are mock data"));
    for (const check of demo.verification.tests) assert.ok(report.includes(`- Not run — ${check.title}`));
    for (const issue of demo.issues) assert.ok(report.includes(issue.evidence.excerpt));
  });
}
