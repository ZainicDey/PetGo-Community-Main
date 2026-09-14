---
name: api-integration
description: "Add, modify, or debug API/server data fetching in PetGo Community — covers RTK Query (createApi, injectEndpoints, caching/invalidation tags) connected to the PetGo Community FastAPI backend, social profile completion checks, and Next.js App Router usage. For client-only state (UI toggles, modals), see the state-management skill instead."
---

# API Integration Skill — PetGo Community

PetGo Community uses **RTK Query** (part of Redux Toolkit) for all server/API communication with the **PetGo Community FastAPI Backend** (`http://localhost:8000` / `NEXT_PUBLIC_API_URL`). It handles data fetching, response caching, optimistic updates, and cache invalidation tags. Client-only state (modals, UI toggles) is handled separately in Redux client slices.

> **Rule**: All API requests must go through RTK Query. Never use raw `fetch` or `axios` calls inside UI components.

---

## 🗂️ File Structure

```
src/lib/store/
  index.ts                      # Root store configuring api.reducer and api.middleware
  services/
    api.ts                      # RTK Query base api (createApi + baseQuery + Bearer auth)
    usersApi.ts                 # Profile, /users/me, follow/unfollow, user likes/reposts
    postsApi.ts                 # Post feed, create/delete post, like/unlike, repost
    commentsApi.ts              # Nested comments, replies, update/delete comment
    feedApi.ts                  # Personalized and trending feed endpoints
```

| File | What it manages |
| :--- | :--- |
| `services/api.ts` | Base `createApi` instance with shared JWT Bearer header and `tagTypes`. **Never create a 2nd createApi.** |
| `services/usersApi.ts` | User identity (`/users/me`), Profile setup/editing, Follow graph (`/users/{id}/follow`). |
| `services/postsApi.ts` | Posts CRUD, Cloudinary media attachment, Likes, and Reposts. |
| `services/commentsApi.ts` | Hierarchical comments (`CommentTree`) and thread interactions. |
| `services/feedApi.ts` | Personalized and trending feed endpoints (`/feed`, `/feed/trending`). |

---

## 📡 Base API Setup

`src/lib/store/services/api.ts`:

```ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    prepareHeaders: (headers, { getState }) => {
      // Access JWT token from Redux auth slice (Django SimpleJWT / FastAPI token)
      const token = (getState() as RootState).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Profile', 'Post', 'Comment', 'Follow'],
  endpoints: () => ({}),
});
```

Register `api.reducer` and `api.middleware` in `src/lib/store/index.ts` alongside client slices.

---

## ➕ Adding a Community Feature API

Create `src/lib/store/services/<feature>Api.ts` and inject endpoints on the shared `api`:

```ts
import { api } from './api';

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar?: string;
  };
  content: string;
  media?: string[];
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  isLiked?: boolean;
  createdAt: string;
}

export const postsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query<Post[], { category?: string } | void>({
      query: (params) => ({ url: '/posts', params: params ?? {} }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),
    getPostById: builder.query<Post, string>({
      query: (id) => `/posts/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Post', id }],
    }),
    createPost: builder.mutation<Post, { content: string; media?: string[] }>({
      query: (body) => ({ url: '/posts', method: 'POST', body }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
    likePost: builder.mutation<{ success: boolean; likesCount: number }, string>({
      query: (id) => ({ url: `/posts/${id}/like`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Post', id }],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useLikePostMutation,
} = postsApi;
```

---

## 🧩 Using RTK Query in Community Components

```tsx
'use client';

import { useGetPostsQuery } from '@/lib/store/services/postsApi';
import ThreadCard from '@/sections/community/ThreadCard';
import ThreadFeedSkeleton from '@/sections/community/ThreadSkeleton';

export function CommunityFeed() {
  const { data: posts, isLoading, isError } = useGetPostsQuery();

  if (isLoading) return <ThreadFeedSkeleton />;
  if (isError) return <div className="text-center py-10 text-white/60">Failed to load feed.</div>;

  return (
    <div className="flex flex-col gap-4">
      {posts?.map((post) => (
        <ThreadCard key={post.id} thread={post} />
      ))}
    </div>
  );
}
```

---

## 🌊 Next.js App Router Notes

- RTK Query hooks require `'use client'` at the top of the component file.
- Store must be wrapped with `<StoreProvider>` (see `state-management` skill).
- During mock/development phases before the backend is running, components can consume `threadData.ts` as fallback data.

---

## ✅ API Integration Checklist

- [ ] No ad-hoc `fetch`/`axios` calls in components — everything routes through RTK Query services.
- [ ] Single `createApi` instance in `services/api.ts` with `tagTypes: ['User', 'Profile', 'Post', 'Comment', 'Follow']`.
- [ ] JWT Bearer header correctly forwarded from auth state.
- [ ] Mutations properly invalidate relevant tags (`invalidatesTags: [{ type: 'Post', id: 'LIST' }]`).
- [ ] `api.middleware` is included in the Redux store middleware chain.
