> 历史记录：此文对应 0.1 产品壳审计，不代表当前 0.2 的功能状态。当前状态见 README 与 requirements-review。

# HumanLayer prototype audit — 2026-10-02

Scope: the product shell, state transitions, mock-data boundaries, local imports, comparison, exports, and static deployment. This is not an audit of uploaded artifacts or production AI behavior.

## Findings corrected

- Focused Issue context did not affect most Inspector replies. Preset replies now use the focused issue’s explanation, evidence, reconstruction, and confidence.
- Overview severity buttons opened unfiltered Issues. They now carry the selected severity into the Issues view.
- Sample switching existed only in component state. It now updates the kind query parameter, so refresh preserves Code/Paper selection.
- The artifact breadcrumb could lose Paper context or fail to reset the active view. It now returns to Overview inside the same workspace.
- Switching views retained the main panel’s old scroll position. Navigation now resets the main panel to its top.
- React Flow controls stretched across the canvas because left/right positioning conflicted. Explicit bottom-right positioning and width keep the controls compact.
- Initial opacity-zero animation could hide server-rendered content during slow initialization. Main content now renders visibly from the start, with small motion retained.
- Filenames were sent in query parameters despite local-only messaging. The workspace URL now carries only the sample kind.
- The initially requested paste workflow was absent. A local-only paste/selection preview is now included; no parsing or AI is performed.
- Downloads had no visible fallback when the browser did not complete them. A reusable export dialog now exposes the full selectable text and truthful download/clipboard status.
- The supervised preview supplied unsupported CLI flags. A small wrapper translates those flags for Next.js, and the development origin is explicitly allowed.

## Validation

The desktop browser pass exercised landing, pasted-content handoff, unsupported file rejection, all seven views, Code/Paper selection, focused Issue responses, split/unified diff, graph selection and controls, reconstruction selection (including zero selections), report preview, theme switching, and contextual Overview navigation. Desktop document width matched viewport width; graph nodes fitted inside their canvas after Fit View.

Ten regression tests passed for exact reconstruction of both documents from the line diff, sequential line numbers, empty/repeated/trailing-newline cases, and report verification boundaries. These test the website’s helpers, not the illustrative authentication code or manuscript.

Lint, strict TypeScript checking, and the production build are release gates; actual command results are recorded in the delivery. No artifact tests or semantic-equivalence checks were executed.

## Remaining limits

The current browser did not expose completed file downloads or allow programmatic clipboard writes. Selectable export text remains available; native OS downloads and clipboard behavior require testing in an ordinary browser. Mobile breakpoints were reviewed in source; physical mobile/touch and cross-browser coverage are not claimed. Browser-extension attribute injection produced a development hydration warning; no application component mismatch was observed in that warning.

All analysis, confidence, scores, creation patterns, and reconstructions remain explicitly authored mock data. No known blocking defect remains in the exercised product-shell paths. This is a bounded audit, not a guarantee that no bugs exist.
