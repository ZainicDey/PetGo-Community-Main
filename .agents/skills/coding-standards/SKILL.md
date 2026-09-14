---
name: coding-standards
description: "Naming conventions, import ordering, folder placement, and utility usage as observed in the actual PetGo Community codebase"
---

# Coding Standards — PetGo Community

Standards are inferred from source files in the PetGo Community repository.

---

## 📁 File & Folder Naming

| Type | Convention | Real Example |
| :--- | :--- | :--- |
| Component files | **PascalCase** `.tsx` | `CommunityLayout.tsx`, `ThreadCard.tsx`, `ThreadDetailPage.tsx` |
| Primitive UI components | **kebab-case or lowercase** | `button.tsx`, `carousel.tsx` |
| Route files | **Next.js conventions** | `page.tsx`, `layout.tsx`, `loading.tsx` |
| Utility files | **camelCase** `.ts` | `utils.ts`, `threadData.ts` |
| Feature subdirectories | **kebab-case** | `src/sections/community/`, `src/components/ui/` |

---

## 🧩 Component Patterns

- **Default export** for page components, layout shells, and standalone screens:
  ```tsx
  // src/sections/community/CommunityLayout.tsx
  export default function CommunityLayout({ children }: CommunityLayoutProps) { ... }

  // src/app/page.tsx
  export default function Home() { ... }
  ```

- **Named export** for UI primitives, data models, and sub-components:
  ```tsx
  // src/components/ui/button.tsx
  export { Button, buttonVariants };

  // src/sections/community/ThreadCard.tsx
  export interface Thread { id: string; author: string; ... }
  ```

- **Inline sub-components** for SVG icons and local sub-views:
  ```tsx
  // src/sections/community/CommunityLayout.tsx
  const HomeFilledIcon = () => (
    <svg aria-hidden viewBox="0 0 24 24" fill="none">...</svg>
  );
  ```

---

## 📥 Import Order

Follow this consistent grouping order:

```tsx
// 1. React built-ins
import React, { useState, useEffect, useCallback } from 'react';

// 2. Next.js built-ins
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

// 3. Third-party UI / icons / libraries
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

// 4. Internal project aliases (@/)
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent } from '@/components/ui/carousel';

// 5. Local assets
import PetGoLogo from '@/assets/images/Logo_PetGo.png';

// 6. Relative / sibling feature imports
import ThreadCard, { Thread } from './ThreadCard';
import { getThreadById } from './threadData';
```

---

## 🗺️ Path Aliases (`tsconfig.json`)

Always use configured absolute path aliases (`@/*` mapping to `./src/*`):

| Alias | Resolves To | Used For |
| :--- | :--- | :--- |
| `@/*` | `./src/*` | Root `src` access |
| `@/components/ui/*` | `./src/components/ui/*` | Reusable UI primitives (`button`, `carousel`) |
| `@/sections/community/*` | `./src/sections/community/*` | Community feature components |
| `@/lib/*` | `./src/lib/*` | Utilities (`utils.ts`) and store services |
| `@/assets/*` | `./src/assets/*` | Static images (`Logo_PetGo.png`) |

---

## 🎨 Class Merging — `cn()` Usage

`cn()` from `@/lib/utils` merges `clsx` + `tailwind-merge`:

```ts
// src/lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Rule**: Always wrap combined classes in `cn(...)` whenever a component accepts a `className` prop or has conditional styles:

```tsx
<div className={cn('bg-[#101010] text-white p-4 rounded-xl', className)}>
```

---

## 🔤 Section Comments

Use the standard `/* ── Label ── */` comment style to delineate major sections within a component:

```tsx
/* ── SVG Icons ── */
const SearchIcon = () => ...

/* ── Avatar helpers ── */
function getAvatarColor(name: string): string { ... }
```

---

## ✅ Coding Standards Checklist

- [ ] Components follow PascalCase filenames (`ThreadCard.tsx`).
- [ ] Imports grouped logically (React → Next → Libs → `@/*` → Siblings).
- [ ] Uses absolute `@/*` paths instead of `../../../`.
- [ ] `cn()` used for conditional or merged Tailwind classes.
- [ ] Types/interfaces exported cleanly when shared between components.
