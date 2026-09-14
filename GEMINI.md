# PetGo Community — Gemini Agent Guide

This workspace contains **PetGo Community** (`petgo-community`), a standalone Next.js 16 + React 19 application.

## 📌 Rules and Execution Constraints
Detailed operational rules, coding standards, and architectural directives are maintained in:
- [AGENTS.md](file:///d:/Temp/back%20on%20track/next%20js/petgo-community/AGENTS.md)
- [.agents/rules/petgo-community.md](file:///d:/Temp/back%20on%20track/next%20js/petgo-community/.agents/rules/petgo-community.md)

## 🧰 Agent Skills
Workflow skills are located in [.agents/skills/](file:///d:/Temp/back%20on%20track/next%20js/petgo-community/.agents/skills/):
- **api-integration**: FastAPI backend RTK Query services (`/users`, `/posts`, `/comments`, `/feed`)
- **routing-and-layouts**: Next.js 16 App Router routes, async `await params`, and `CommunityLayout`
- **uiux-design-system**: Brand palette (`#F7941D`, `#BE1E2D`, `#101010`), dark theme, and typography
- **coding-standards**: File conventions, import ordering, and `@/lib/utils` `cn()` merging
- **verification**: Mandatory static verification workflow (`tsc`, `lint`, `build`)
- **add-dependency**: Safe dependency management via `npm`
- **env-variables**: Next.js environment variables configuration
- **state-management**: Redux Toolkit slices and client UI state
- **performance-and-assets**: Image optimization (`next/image`), font loading, and bundle control
- **git-workflow**: Git commit formatting and branch conventions
