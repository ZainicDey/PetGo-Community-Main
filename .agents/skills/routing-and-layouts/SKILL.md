---
name: routing-and-layouts
description: "Next.js 16 App Router routing patterns, route groups, dynamic parameters (await params), metadata, loading states, and CommunityLayout shell for PetGo Community"
---

# Routing and Layouts Skill — PetGo Community

This skill governs creating and modifying Next.js 16 App Router routes, layouts, and page structures in **PetGo Community** (`petgo-community`).

---

## 📁 Route Architecture (`src/app/`)

```text
src/
├── app/
│   ├── page.tsx               # Route: / (Community Feed)
│   ├── layout.tsx             # Root HTML document & font definitions
│   ├── loading.tsx            # Skeleton loader fallback (ThreadSkeleton)
│   ├── globals.css            # Global CSS directives & font variables
│   └── post/
│       └── [id]/
│           ├── page.tsx       # Route: /post/:id (Thread Detail View)
│           └── loading.tsx    # Thread detail skeleton
├── components/
│   └── ui/                    # Primitives (button.tsx, carousel.tsx)
└── sections/
    └── community/             # Feature components
        ├── CommunityLayout.tsx # Responsive shell (Sidebar / Mobile Nav / Modals)
        ├── CommunityFeed.tsx   # Feed tab view
        ├── ThreadDetailPage.tsx # Dedicated post page view
        └── NewThreadModal.tsx # Compose modal
```

---

## ⚡ Next.js 16 Async Dynamic Parameters

In **Next.js 16**, `params` and `searchParams` props are **Promises**. You MUST `await` them in Page components:

```tsx
// ✅ Correct Next.js 16 Dynamic Route Page Pattern
// src/app/post/[id]/page.tsx

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PostDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab } = await searchParams;

  return (
    <main>
      <ThreadDetailPage threadId={id} />
    </main>
  );
}
```

---

## 🏷️ Metadata & SEO Rules

Every public `page.tsx` must export a `metadata` object or `generateMetadata` function:

### Static Metadata
```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PetGo Community — Connect with Pet Parents',
  description: 'Share stories, ask questions, and connect with fellow pet lovers across the PetGo Community.',
};
```

### Dynamic Metadata (`generateMetadata`)
```tsx
import type { Metadata } from 'next';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Thread #${id} | PetGo Community`,
    description: `Join the discussion on PetGo Community.`,
  };
}
```

---

## 🏛️ Community Shell Architecture (`CommunityLayout`)

`src/sections/community/CommunityLayout.tsx` serves as the primary navigation shell:
- **Desktop Sidebar**: Left-aligned fixed navigation (`w-[260px]`) with logo, For You, Search, Messages, Activity, Profile, and "+ New Post" button.
- **Mobile Bottom Bar**: Fixed bottom navigation on small screens (`sm:hidden`).
- **Modal Layer**: Host for `NewThreadModal` controlled via client state.

When creating new community sub-pages, wrap children inside `CommunityLayout` or apply it at the route group layout level.

---

## ⏳ Loading States & Suspense (`loading.tsx`)

Place a `loading.tsx` file inside any route directory to automatically display fallback skeletons:

```tsx
// src/app/loading.tsx
import ThreadFeedSkeleton from '@/sections/community/ThreadSkeleton';

export default function Loading() {
  return <ThreadFeedSkeleton />;
}
```

---

## 🔗 Client-Side Navigation

### Standard Next Link
Always use `next/link` for internal page navigation:

```tsx
import Link from 'next/link';

<Link href={`/post/${thread.id}`} className="hover:text-[#FFE1BD] transition-colors">
  View comments
</Link>
```

### Programmatic Navigation
In Client Components (`'use client'`):

```tsx
'use client';

import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className="cursor-pointer">
      Back
    </button>
  );
}
```

---

## ✅ Routing Checklist

- [ ] Route files placed in `src/app/` following App Router conventions.
- [ ] Dynamic `params` and `searchParams` are awaited (`const { id } = await params`).
- [ ] Every page exports `metadata` or `generateMetadata`.
- [ ] Fallback `loading.tsx` exists for dynamic routes.
- [ ] Internal navigation uses `next/link` or `useRouter`.
