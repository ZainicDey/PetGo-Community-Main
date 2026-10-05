'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { useGetMeQuery } from '@/lib/store/services/usersApi';
import { postsApi } from '@/lib/store/services/postsApi';
import { usersApi } from '@/lib/store/services/usersApi';

/**
 * Preloads data for adjacent routes so navigation feels instant.
 *
 * Call this at the page level to warm the RTK Query cache for sibling pages.
 * Uses `prefetch()` which fires API calls in the background without
 * subscribing the current component to the results.
 *
 * @param currentRoute — which route is currently active; determines what to preload
 */
export function useRoutePreloader(
  currentRoute: 'feed' | 'profile' | 'search' | 'activity',
) {
  const dispatch = useAppDispatch();
  const { data: me } = useGetMeQuery();
  const hasPrefetched = useRef(false);

  useEffect(() => {
    // Only prefetch once per mount and only when we have the user ID
    if (hasPrefetched.current || !me?.id) return;
    hasPrefetched.current = true;

    const userId = me.id;

    // Delay all preloading by 3 seconds so the initial page data loads instantly
    // without the browser throttling parallel requests
    const timer = setTimeout(() => {
      switch (currentRoute) {
        case 'feed':
          dispatch(usersApi.util.prefetch('getProfile', undefined, { force: false }));
          dispatch(usersApi.util.prefetch('getUserPosts', userId, { force: false }));
          dispatch(usersApi.util.prefetch('getUserReposts', userId, { force: false }));
          dispatch(usersApi.util.prefetch('getUserSavedPosts', userId, { force: false }));
          dispatch(usersApi.util.prefetch('getUserActivity', userId, { force: false }));
          dispatch(usersApi.util.prefetch('getUserLikes', userId, { force: false }));
          dispatch(postsApi.util.prefetch('getFollowingFeed', undefined, { force: false }));
          break;

        case 'profile':
          dispatch(postsApi.util.prefetch('getPosts', { limit: 20, offset: 0 }, { force: false }));
          dispatch(usersApi.util.prefetch('getUserPosts', userId, { force: false }));
          dispatch(usersApi.util.prefetch('getUserReposts', userId, { force: false }));
          dispatch(usersApi.util.prefetch('getUserSavedPosts', userId, { force: false }));
          break;

        case 'search':
          dispatch(postsApi.util.prefetch('getPosts', { limit: 20, offset: 0 }, { force: false }));
          dispatch(usersApi.util.prefetch('getProfile', undefined, { force: false }));
          break;

        case 'activity':
          dispatch(postsApi.util.prefetch('getPosts', { limit: 20, offset: 0 }, { force: false }));
          dispatch(usersApi.util.prefetch('getProfile', undefined, { force: false }));
          break;
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [currentRoute, dispatch, me?.id]);
}
