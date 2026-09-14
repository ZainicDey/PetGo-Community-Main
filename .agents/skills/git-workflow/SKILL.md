---
name: git-workflow
description: "Commit message format, branch strategy, and pre-commit requirements for PetGo — based on actual git history"
---

# Git Workflow — PetGo Community

Workflow inferred from git log and development practices.

---

## 🌿 Branch Strategy

From `git branch -a`, the project currently uses a **single-branch model**:

```
* main          ← only branch, direct commits
  remotes/origin/main
```

There are no feature branches or PRs visible in history. All work has been committed directly to `main`.

**Recommended convention going forward** (when collaborating):

| Branch pattern | Purpose |
| :--- | :--- |
| `main` | Stable, deployable code |
| `feat/<short-description>` | New feature (e.g. `feat/pet-adoption-modal`) |
| `fix/<short-description>` | Bug fix (e.g. `fix/cart-qty-underflow`) |
| `docs/<short-description>` | Documentation only (e.g. `docs/agents-skill-files`) |
| `chore/<short-description>` | Config, deps, tooling (e.g. `chore/update-eslint-config`) |

---

## 💬 Commit Message Format

The majority of formal commits in this repo follow **Conventional Commits**:

```
<type>: <short imperative description>
```

**Types observed in this repo's git log:**

| Type | Used for | Real commit example |
| :--- | :--- | :--- |
| `feat:` | New features or components | `feat: implement user profile dashboard sections...` |
| `docs:` | Documentation changes | `docs: establish AI agent development guidelines...` |

**Informal commits also present** (avoid replicating these):
- `latest` — no context
- `repost removed` — no type prefix
- `community added` — no type prefix

### Format Rules

```
feat: add carousel to TopCategories section
^--^  ^-----------------------------------------^
type  imperative description (lowercase, no period)
```

- Max ~72 characters on the subject line.
- Use imperative mood: "add", "fix", "remove" — not "added", "fixed".
- No trailing period.
- For multi-file changes, include a body after a blank line:
  ```
  feat: implement community thread detail page

  - Added ThreadDetailPage with carousel support
  - Extracted Thread interface to ThreadCard.tsx
  - Wired getThreadById data helper
  ```

---

## ✅ Pre-Commit Requirements

Before committing **any** code change, the following must pass:

1. **Verification pipeline** — see `.agents/skills/verification/SKILL.md`:
   - `npx tsc --noEmit` → 0 errors
   - `npm run lint` → 0 errors
   - `npm run build` → succeeds

2. **Hygiene checks**:
   - No `console.log` or `debugger` left in changed files
   - No `@ts-ignore` or unexplained `any` introduced
   - Prettier formatting applied (config in `.prettierrc.json`)

3. **Scope check**:
   - `git diff --stat` — confirm only the expected files are staged
   - Unrelated changes must be in a separate commit

---

## 🔧 Formatting Before Commit

The project has Prettier configured (`.prettierrc.json`):

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "printWidth": 80,
  "trailingComma": "es5",
  "endOfLine": "lf"
}
```

Prettier ignores (`.prettierignore`): `.next`, `.history`, `.husky`, `node_modules`, `public`

Format all staged files before committing:
```bash
npx prettier --write .
```
