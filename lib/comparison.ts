export interface DiffLine {
  kind: "same" | "added" | "removed";
  text: string;
  before: number | null;
  after: number | null;
}
// A small line diff for the bundled examples. No artifact analysis or AI is involved.
export function compareLines(before: string, after: string): DiffLine[] {
  const a = before.split("\n"),
    b = after.split("\n");
  const lengths = Array.from(
    { length: a.length + 1 },
    () => new Uint16Array(b.length + 1),
  );
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      lengths[i][j] =
        a[i] === b[j]
          ? lengths[i + 1][j + 1] + 1
          : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
  const result: DiffLine[] = [];
  let i = 0,
    j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      result.push({ kind: "same", text: a[i], before: i + 1, after: j + 1 });
      i++;
      j++;
    } else if (
      j < b.length &&
      (i === a.length || lengths[i][j + 1] >= lengths[i + 1][j])
    ) {
      result.push({ kind: "added", text: b[j], before: null, after: j + 1 });
      j++;
    } else {
      result.push({ kind: "removed", text: a[i], before: i + 1, after: null });
      i++;
    }
  }
  return result;
}
