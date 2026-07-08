# CrelioHealth · Rule Engine (LIMS)

A modern, production-feel prototype of the **Rule Engine** module for a Laboratory
Information Management System (LIMS). It focuses on **system-defined default rules**
for **Auto Approval** of pathology and toxicology reports — not a custom rule builder.

Laboratory administrators can review default rules, understand the logic behind each
one, see the tests each rule governs, simulate the rule against historical reports,
review the outcome, and fine-tune the auto-approval ranges, delta and linearity settings.

## Workflow

```
Rule Engine → View Default Rule → Review Rule Logic → View Mapped Tests
            → Run Simulation → Review Results → Configure Auto Approval Settings
            → Save & Activate
```

## Screens

| # | Screen | Route |
|---|--------|-------|
| 1 | Rule Engine landing (rule cards) | `/` |
| 2 | Default Rule Details (rule logic + mapped tests) | `/rules/:ruleId` |
| 3 | Run Simulation (modal) | on rule details |
| 4 | Simulation Results (summary cards, failure chart, report breakdown) | on rule details |
| 5 | Configure Auto Approval (tabs + editable parameters) | `/rules/:ruleId/configure` |

## Tech stack

- **React 18 + TypeScript**
- **Vite** (dev server & build)
- **Tailwind CSS v4** (design system, soft-blue medical theme)
- **React Router** (screen navigation)
- **lucide-react** (icons)

All data is mocked in `src/data/` — no backend required.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Project structure

```
src/
├── components/       Reusable UI (Toggle, Modal, Button, tables, chart, layout)
├── data/             Mock rules, mapped tests, editable parameters, simulation engine
├── pages/            The five screens
├── lib/              Small helpers
├── App.tsx           Routes
└── index.css         Tailwind theme + design tokens
```

> This is a demonstration prototype intended for laboratory administrators and
> stakeholders. Simulation numbers are generated deterministically from the chosen
> filters to feel realistic across re-runs.
