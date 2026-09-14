# PetGo Community — Developer Guide

Welcome to the standalone **PetGo Community** (`petgo-community`) web application! This guide covers local environment setup, architecture, and developer workflows.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v20+ (Node v24 recommended)
- **Package Manager**: `npm` exclusively (never use yarn, pnpm, or bun)

### 2. Installation
```bash
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🛠️ Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Next.js 16 development server |
| `npm run build` | Builds optimized production bundle |
| `npm run start` | Starts production server after build |
| `npm run lint` | Runs ESLint analysis |
| `npx tsc --noEmit` | Static TypeScript compiler check (0 errors required) |

---

## 🏗️ Architecture & Directory Map

```
petgo-community/
├── .agents/
│   ├── rules/
│   │   └── petgo-community.md   # Core execution rules & constraints
│   └── skills/                  # 10 specialized workflow skills
├── src/
│   ├── app/                     # Next.js 16 App Router
│   │   ├── layout.tsx           # Global HTML root layout & fonts
│   │   ├── page.tsx             # Root page (renders CommunityFeed)
│   │   └── globals.css          # Tailwind v4, dark theme tokens & navigation vars
│   ├── assets/
│   │   └── images/              # Static brand assets (Logo_PetGo.png)
│   ├── components/
│   │   └── ui/                  # Reusable UI primitives (button.tsx, carousel.tsx)
│   ├── lib/
│   │   ├── utils.ts             # cn() class merge helper (clsx + tailwind-merge)
│   │   └── store/               # RTK Query backend services & Redux store
│   └── sections/
│       └── community/           # Community feature components
│           ├── CommunityLayout.tsx # Sidebar, mobile nav & modal shell
│           ├── CommunityFeed.tsx   # Feed view
│           ├── CommunityPage.tsx   # Page wrapper
│           ├── ThreadCard.tsx      # Individual thread item with carousel
│           ├── ThreadDetailPage.tsx# Full thread discussion view
│           ├── ThreadSkeleton.tsx  # Shimmer skeleton loader
│           ├── NewThreadModal.tsx  # Compose thread modal
│           └── threadData.ts       # Mock/seed thread data
```

---

## 📡 Backend API Integration

- **Backend**: PetGo Community FastAPI Backend
- **Default Local Endpoint**: `http://localhost:8000`
- **Config**: `NEXT_PUBLIC_API_URL` in `.env.local`
- **Protocol**: RTK Query services under `src/lib/store/services/`
