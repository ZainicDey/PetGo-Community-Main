# PetGo Community AI Agent Execution Rules

This document outlines mandatory rules and constraints for AI agents operating within the **PetGo Community** (`petgo-community`) repository.

---

## 🏗️ 1. Project Context & Tech Stack

- **Project**: PetGo Community Frontend (`petgo-community`)
- **Framework**: Next.js 16 (App Router)
- **UI & React**: React 19, TypeScript 5
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`), Radix UI (`radix-ui`), Shadcn UI conventions, `lucide-react`, `tw-animate-css`
- **Carousel**: Embla Carousel (`embla-carousel-react`)
- **Backend API**: PetGo Community FastAPI Backend (`http://localhost:8000` / `NEXT_PUBLIC_API_URL`)
- **Data Fetching / State**: RTK Query (`createApi` with JWT Bearer auth) & Redux Toolkit client slices
- **Path Aliases**: Absolute imports via `@/*` mapping to `./src/*`

---

## ⚡ 2. Process & Execution Constraints

- **Development Server**: Do NOT launch redundant `npm run dev` or `next dev` background processes if a development server is already active in the workspace.
- **Visual Debugging**: Do NOT attempt to use browser subagents or open `localhost` windows unless explicitly requested by the user. Rely on static verification (`tsc`, `lint`, `build`).
- **Package Manager**: Exclusively use `npm` for installing dependencies or executing scripts. Never introduce `yarn`, `pnpm`, or `bun`.
- **Node Environment**: On Windows environments, ensure Node.js tools are invoked via the active installation (e.g. `C:\Program Files\nodejs`).

---

## 🧱 3. Architecture & Next.js 16 Rules

- **Server Component First**: All pages, layouts, and components inside `app/`, `sections/`, and `components/` are Server Components by default.
- **Client Component Scoping**: Use `'use client'` strictly at the top of small, leaf interactive components that require state (`useState`), effects (`useEffect`), event handlers (`onClick`), or client portals.
- **Next.js 16 Async APIs**: In Next.js 16, `params` and `searchParams` props in Page and Layout components are Promises and must be awaited (`const { id } = await params`).
- **Data Fetching Protocol**: All server/API calls must go through RTK Query services under `src/lib/store/services/`. Never use raw ad-hoc `fetch` or `axios` calls in UI components.

---

## 🎨 4. Styling & Component Design Rules

- **Class Merging**: Always combine conditional or custom Tailwind classes using the `cn(...)` utility from `@/lib/utils`.
- **Design Tokens**: Standardize colors, typography, and spacing using Tailwind v4 theme directives and CSS variables defined in `src/app/globals.css`.
  - **Brand Canvas**: `#101010` (Dark canvas), `#151515` / `#1c1919` (Cards and elevated panels).
  - **Brand Accents**: Brand Orange `#F7941D`, Brand Red `#BE1E2D`, Hover light `#FFE1BD`.
  - **Borders**: `border-white/10` or `border-[#2a2a2d]`.
- **Icons**: Use `lucide-react` with tree-shakeable named imports.

---

## 🧹 5. Code Hygiene & Verification

- **No Diagnostic Workarounds**: Never fix type or lint errors by inserting `@ts-ignore`, `@ts-expect-error`, or casting to `any`. Fix the underlying type signature or contract.
- **Clean Commits**: Remove all temporary `console.log` statements, unused variables, and leftover debugging code before marking any task as complete.
- **Mandatory Verification**: Every code modification must pass the verification workflow outlined in `.agents/skills/verification/SKILL.md`:
  1. TypeScript compilation: `npx tsc --noEmit` (0 errors)
  2. ESLint checks: `npm run lint` (0 errors)
  3. Production build: `npm run build` (successful compilation)

---

## 📝 6. Continuous Documentation Maintenance

Whenever completing a task, run through this checklist before closing out:

### 📁 File Ownership Map

| File | Primary Purpose | Update When... |
| :--- | :--- | :--- |
| `DEVELOPMENT.md` | Local setup, scripts, tech stack, troubleshooting | Package added/removed, new npm scripts, new setup steps, env var changes |
| `AGENTS.md` | AI agent guidelines, coding conventions, skills index | Architectural changes, new component patterns, new skills added/removed |
| `.agents/rules/petgo-community.md` | Operational constraints & agent execution directives | Build tool changes, server policies, styling standards, verification changes |
| `.agents/skills/*/SKILL.md` | Targeted workflow skills | Lint rules change, new patterns emerge, scripts renamed |
| `README.md` | High-level project summary and feature highlights | New features shipped, project milestones, major changes |

### 📋 Post-Task Maintenance Checklist

- [ ] **Dependencies changed** (`package.json`)? → Update `DEVELOPMENT.md` & `AGENTS.md` stack section.
- [ ] **Directory structure changed** (new `src/` folder)? → Update `DEVELOPMENT.md` & `AGENTS.md` file map.
- [ ] **npm scripts added/changed**? → Update `DEVELOPMENT.md` Available Scripts table.
- [ ] **Coding conventions or patterns changed**? → Update `AGENTS.md` & `.agents/rules/petgo-community.md`.
- [ ] **New skills added or skills deleted**? → Update `AGENTS.md` Agent Skills Index table.
