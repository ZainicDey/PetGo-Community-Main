---
name: add-dependency
description: "Safely add, update, or audit npm packages in PetGo Community — use before running any npm install command"
---

# Add Dependency Skill — PetGo Community

This skill governs how to safely introduce, update, or audit npm packages in the **PetGo Community** (`petgo-community`) project.

---

## 📋 Current Key Dependencies

| Package | Version | Purpose |
| :--- | :--- | :--- |
| `next` | `16.3.4` | App framework — **pin this exact version** |
| `react` / `react-dom` | `19.2.8` | UI runtime — **pin this exact version** |
| `typescript` | `^5` | Static typing |
| `tailwindcss` | `^4` | Styling runtime (v4) |
| `@tailwindcss/postcss` | `^4` | Tailwind PostCSS plugin |
| `lucide-react` | `^1.44.0` | UI icons |
| `radix-ui` | `^1.6.7` | Headless UI primitives |
| `clsx` | `^2.1.1` | Class name utility |
| `tailwind-merge` | `^3.6.0` | Tailwind class conflict resolver |
| `embla-carousel-react` | `^8.6.0` | Carousel functionality |
| `class-variance-authority` | `^0.7.1` | Component variant helper |
| `tw-animate-css` | `^1.4.0` | CSS animation utilities |

---

## ➕ Adding a New Package

### 1. Check if it already exists
```bash
npm list <package-name>
```

### 2. Install runtime dependency
```bash
npm install <package-name>
```

### 3. Install dev-only dependency (types, linters, build tools)
```bash
npm install -D <package-name>
```

---

## ⚠️ Package Constraints

- **Package Manager**: Use `npm` exclusively — never `yarn`, `pnpm`, or `bun`.
- **Do not upgrade `next` or `react` minor/major versions** without explicit user approval — breaking changes are common.
- **Avoid packages that require `'use client'` globally** — prefer tree-shakeable, SSR-compatible libraries.
- **Check bundle size** before adding heavy libraries. Prefer lighter alternatives (e.g. `date-fns` over `moment`, `lucide-react` over `react-icons`).

---

## 🧹 After Adding a Package

1. Verify `package.json` now lists it correctly.
2. Run `npm run build` to confirm the package doesn't break the build bundle.
3. Update `AGENTS.md` → **Tech Stack** section if it changes developer workflow.

---

## ✅ Add Dependency Checklist

- [ ] Package not already present in `package.json`.
- [ ] Installed with `npm` (not yarn/pnpm/bun).
- [ ] `npx tsc --noEmit` and `npm run build` pass after install.
- [ ] `AGENTS.md` updated if significant addition.
