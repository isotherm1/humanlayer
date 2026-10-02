# HumanLayer

**AI can create. Humans still need to understand.**

HumanLayer is an open-source developer-product prototype for understanding AI-assisted code and academic papers. Its intended workflow connects inferred creation logic, reconstructed intent, structural issues, evidence, and human-readable reconstruction.

HumanLayer is **not an AI detector** and does not claim access to a model’s private chain-of-thought.

## Prototype status

This release is a **product shell**, not a functioning AI analysis service. All scores, patterns, confidence values, findings, reconstructions, and inspector answers are typed, prewritten demo data. Uploaded files are not read, parsed, stored, or transmitted; the filename/type is displayed locally in a selection dialog and is not included in the workspace URL. The workspace clearly separates those files from the bundled examples.

Included: a responsive landing page with file selection and paste previews, code/paper examples, seven workspace views, an interactive React Flow creation-logic graph, reusable issue cards, a mock Inspector, split/unified comparison, review-plan/report exports, dark/light themes, and separate semantic/test verification reports. Artifact tests are explicitly marked **not run**.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style Radix primitives, Lucide, Motion, and React Flow. One repository; static export. No separate backend, database, authentication, billing, Docker, or API keys.

## Run locally

Requires Node.js 22.6+ and npm (Node 24 LTS recommended for the native TypeScript test runner).

```bash
npm ci
npm run dev
```

Open http://localhost:4173. The landing page is `/`; the workspace is `/workspace/`.

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The production static output is `out/`. Serve it with any static host. No environment variables are needed.

## Layout

- `app/`: routes, metadata, shared styles
- `components/`: landing and reusable product components
- `components/ui/`: Button, Badge, accessible Dialog primitives
- `components/workspace/`: analysis views and workspace shell
- `types/`: artifact, issue, and verification contracts
- `lib/`: typed demo data, product definitions, sample report and line comparison helpers
- `docs/`: requirements review and validation boundaries

See [requirements review](docs/requirements-review.md) for what is implemented and what remains unverified. The application build checks are separate from verification of any uploaded artifact.

Licensed under MIT. HumanLayer is an independent portfolio project and is not affiliated with another product of the same name.
