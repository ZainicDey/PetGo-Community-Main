<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# PetGo Community AI Agent Guide

This repository contains the standalone **PetGo Community** (`petgo-community`) web application.

---

## 🎯 Architecture & Project Map

```
petgo-community/
├── .agents/                      # AI Agent Customizations root
│   ├── rules/                    # Workspace rules (auto-discovered)
│   │   └── petgo-community.md    # Core operational constraints & guidelines
│   └── skills/                   # On-demand workflow skills (10 skills)
├── src/
│   ├── app/                      # Next.js 16 App Router
│   │   ├── layout.tsx            # Root layout with fonts & global CSS
│   │   ├── page.tsx              # Root home route (renders CommunityFeed)
│   │   └── globals.css           # Tailwind v4, dark theme & community variables
│   ├── assets/                   # Static images & brand assets (Logo_PetGo.png)
│   ├── components/
│   │   └── ui/                   # Reusable UI primitives (button.tsx, carousel.tsx)
│   ├── lib/
│   │   ├── utils.ts              # cn() class merge utility
│   │   └── store/                # RTK Query services & Redux store
│   └── sections/
│       └── community/            # Community feature components
│           ├── CommunityLayout.tsx
│           ├── CommunityFeed.tsx
│           ├── CommunityPage.tsx
│           ├── ThreadCard.tsx
│           ├── ThreadDetailPage.tsx
│           ├── ThreadSkeleton.tsx
│           ├── NewThreadModal.tsx
│           └── threadData.ts
```

---

## 🛠️ Tech Stack & Key Dependencies

- **Framework**: Next.js 16 (`16.3.4`)
- **UI Runtime**: React 19 (`19.2.8`), TypeScript 5
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), Radix UI (`radix-ui`), `tw-animate-css`
- **Carousel**: Embla Carousel (`embla-carousel-react`)
- **Icons**: Lucide Icons (`lucide-react`)
- **Backend API**: PetGo Community FastAPI backend (`http://localhost:8000` / `NEXT_PUBLIC_API_URL`)
- **Data Fetching**: RTK Query (`src/lib/store/services/`)

---

## 📚 Agent Skills Index

AI agents should reference and activate the specialized workflow skills located in `.agents/skills/`:

| Skill | Location | Purpose |
| :--- | :--- | :--- |
| **api-integration** | `.agents/skills/api-integration/SKILL.md` | RTK Query endpoints connected to PetGo Community FastAPI backend |
| **routing-and-layouts** | `.agents/skills/routing-and-layouts/SKILL.md` | Next.js 16 App Router routes, async params, metadata, & CommunityLayout |
| **uiux-design-system** | `.agents/skills/uiux-design-system/SKILL.md` | Brand palette (`#F7941D`, `#BE1E2D`, `#101010`), typography, & component styling |
| **coding-standards** | `.agents/skills/coding-standards/SKILL.md` | Naming, imports, path aliases (`@/*`), and `cn()` usage |
| **verification** | `.agents/skills/verification/SKILL.md` | Mandatory static-analysis checks (`tsc`, `lint`, `build`) before closing tasks |
| **add-dependency** | `.agents/skills/add-dependency/SKILL.md` | Safely installing, auditing, or updating npm dependencies |
| **env-variables** | `.agents/skills/env-variables/SKILL.md` | Next.js environment configuration rules & backend endpoints |
| **state-management** | `.agents/skills/state-management/SKILL.md` | Client state slices, modals, and store hydration |
| **performance-and-assets**| `.agents/skills/performance-and-assets/SKILL.md`| Image optimization, bundle sizes, and caching |
| **git-workflow** | `.agents/skills/git-workflow/SKILL.md` | Conventional commit messages and hygiene standards |

---

## ⚡ Core Operational Directives

1. **Exclusively Use `npm`**: Never run `yarn`, `pnpm`, or `bun`.
2. **Static Verification Only**: Always verify changes via `npx tsc --noEmit` and `npm run lint`. Do not launch browser subagents or redundant dev server processes.
3. **Strict Path Aliases**: Always import components and utilities via `@/*` (e.g. `@/components/ui/carousel`, `@/lib/utils`).
4. **No Diagnostic Workarounds**: Never use `@ts-ignore`, `@ts-expect-error`, or `any` to silence TypeScript or ESLint errors.
