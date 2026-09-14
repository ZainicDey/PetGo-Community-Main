---
name: verification
description: "Static-analysis-only verification workflow with lint error fix recipes — required before marking any task complete. Do NOT use browser, localhost, or dev server."
---

# Verification Skill — PetGo Community

**This skill must run after every code change, before any task is marked complete.**

---

## 🚫 Hard Constraints

- **FORBIDDEN**: Browser subagents, opening `localhost`, or any visual debugging tools.
- **FORBIDDEN**: Launching redundant `npm run dev` or `next dev` background processes.
- **FORBIDDEN**: Using `@ts-ignore`, `@ts-expect-error`, or casting to `any` to force a passing result.

---

## 🔄 Verification Pipeline

Run steps in sequence. Stop at the first failure and fix it before proceeding.

### Step 1 — TypeScript Compilation Check
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH; npx tsc --noEmit
```
- **Required**: 0 errors.
- Fix the underlying type contract — never suppress with `@ts-ignore`.

### Step 2 — ESLint Verification
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH; npm run lint
```
- **Required**: 0 errors.
- Warnings are acceptable but must be reported.

### Step 3 — Next.js Production Build
```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH; npm run build
```
- **Required**: All App Router pages and static routes compile cleanly. 0 failed routes.

---

## 🩺 Common Lint & Type Fix Recipes

### ❌ Parameter implicitly has an 'any' type (TS7006)
- **Problem**: Event handlers in inline callbacks or primitives missing type annotations.
- **Fix**: Type the event explicitly:
  ```tsx
  onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
  ```

### ❌ `react-hooks/set-state-in-effect`
- **Problem**: Calling `setState` synchronously in `useEffect` causes re-render cascades.
- **Fix**: Initialize state directly in `useState(initialValue)` or wrap in a condition.

### ❌ `@next/next/no-img-element`
- **Problem**: Raw `<img>` tag without Next.js optimization.
- **Fix**: Use `<Image />` from `next/image` with width, height, and alt.

---

## 📊 Required Report Format

Always output this checklist before completing a task:

```
### 🛡️ Verification Report

- [x/❌] tsc:         <N errors>
- [x/❌] lint:        <N errors>, <N warnings>
- [x/❌] build:       <succeeded / failed>

Production Standards:
- [x/❌] No console.log leftovers
- [x/❌] No @ts-ignore / any casts introduced
- [x/❌] git diff scope is correct
```
