---
name: state-management
description: "Add, modify, or debug client-side state in PetGo Community — covers Redux Toolkit slices (auth, UI, feed filter) and StoreProvider setup for Next.js App Router"
---

# State Management Skill — PetGo Community

PetGo Community uses **Redux Toolkit (RTK)** for client-only state (auth tokens, active modals, feed filters). Server/API data is managed via RTK Query (see the **api-integration** skill).

---

## 🗂️ Store Structure

```
src/lib/store/
  index.ts              # makeStore() factory, root reducer, RootState & AppDispatch types
  hooks.ts              # useAppDispatch, useAppSelector (typed hooks)
  slices/
    authSlice.ts        # Access token, current user summary
    uiSlice.ts          # Active tab, modal visibility (NewThreadModal)
```

---

## 🌊 SSR & StoreProvider Pattern

Create the store per-request on the server and once per session on the client:

```tsx
// src/app/providers.tsx
'use client';

import { Provider } from 'react-redux';
import { useRef } from 'react';
import { makeStore, AppStore } from '@/lib/store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
```

---

## 🔒 Local Component State Guidelines

- **Use `useState`** for simple toggles, dropdowns, and form input states (e.g. `showNewThread` in `CommunityLayout`).
- **Never call `setState` synchronously inside `useEffect`** without guards.

---

## ✅ State Management Checklist

- [ ] Slices live in `src/lib/store/slices/`.
- [ ] Components use typed `useAppSelector` / `useAppDispatch` hooks.
- [ ] Server data is NOT stored in client slices — handled via RTK Query.
