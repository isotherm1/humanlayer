# HumanLayer requirements review

## Product and architecture

| Requirement                                                          | Implementation                                                                                                                              |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Thesis and honest inference terminology                              | Landing, mock Inspector, report exports, typed sample data                                                                                  |
| No AI detection or private chain-of-thought claims                   | Explicit boundaries in landing, graph, README, and Inspector                                                                                |
| No real AI functionality                                             | Prewritten code/paper examples; no model calls or artifact parser                                                                           |
| Next.js, TypeScript, Tailwind, shadcn/ui, Lucide, Motion, React Flow | Single App Router repository, strict types, Tailwind styles, Radix UI primitives, reduced-motion-aware transitions, custom React Flow nodes |
| No unnecessary services                                              | Static export; no database, auth, payment, backend, Docker, or secrets                                                                      |
| Landing and workspace                                                | `/` and `/workspace/`                                                                                                                       |
| Upload and format concepts                                           | ZIP/PY/JS/TS/TSX/PDF/MD/TXT labels, native file picker, drag/drop, explicit sample-preview handoff                                          |
| Required navigation                                                  | Overview, Creation Logic, Structure, Issues, Reconstruct, Compare, Verification                                                             |
| Overview scores, severity summary, pattern, confidence               | Typed mock values; severity counts derived from the sample issues                                                                           |
| Creation Logic example                                               | Original Goal → Authentication → JWT Strategy → Middleware → API Routes; selectable custom nodes and evidence panel                         |
| Reusable issue cards                                                 | Explanation, evidence, why it matters, suggested reconstruction, severity and confidence; expandable details                                |
| Right AI Inspector                                                   | Four preset questions and mock replies; custom submission explains that live AI is not connected                                            |
| Compare                                                              | Split/unified line comparison, syntax styling, explicit unverified-proposal status                                                          |
| Verification distinction                                             | Semantic review pending; artifact tests not run; no fabricated execution claims                                                             |
| Reusable components and typed data                                   | `components/`, `types/`, `lib/`; small route files                                                                                          |
| README                                                               | Thesis, status, stack, local commands, honest capability boundary                                                                           |

## Interaction and layout review

The landing layout adapts at 760px and 390px. The workspace collapses its Inspector below 1280px, replaces sidebar navigation with an accessible Dialog below 760px, stacks dense grids and comparison panels, and keeps code overflow inside scrollable blocks. Grid columns use `minmax(0, 1fr)` to contain overflow; long filenames and evidence excerpts wrap. Focus outlines, native file selection, Radix dialog focus management, reduced-motion support, and theme tokens are included.

Review was performed at the source/layout level. A real browser visual and interaction pass was **not available** because the environment lacks the control-browser capability required for managed-preview QA. Therefore mobile rendering, graph fit, and OS/browser download behavior remain to be visually verified on actual devices. These are limitations, not passed tests.

## Validation boundaries

Lint, TypeScript checking, and the production build must complete without introduced errors before delivery. Their actual outcomes are reported in the delivery message; this document does not fabricate artifact-test results. No tests of an uploaded source project, no manuscript fact checks, and no semantic-equivalence verification have been executed.

The graph and confidence values are mock inferences. Reconstruction remains an illustrative proposal; the code example deliberately exposes changes to the async/error/header contract as review requirements.
