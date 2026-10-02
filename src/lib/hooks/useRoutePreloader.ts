'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/lib/store/hooks';
import { useGetProfileQuery } from '@/lib/store/services/usersApi';
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
  const { data: profile } = useGetProfileQuery();
  const hasPrefetched = useRef(false);

  useEffect(() => {
    // Only prefetch once per mount and only when we have a profile
    if (hasPrefetched.current || !profile?.user_id) return;
    hasPrefetched.current = true;

    const userId = profile.user_id;

    switch (currentRoute) {
      case 'feed':
        // When on the feed, preload profile, search, and activity data
        dispatch(usersApi.util.prefetch('getProfile', undefined, { force: false }));
        dispatch(usersApi.util.prefetch('getUserPosts', userId, { force: false }));
        dispatch(usersApi.util.prefetch('getUserReposts', userId, { force: false }));
        dispatch(usersApi.util.prefetch('getUserSavedPosts', userId, { force: false }));
        dispatch(usersApi.util.prefetch('getUserActivity', userId, { force: false }));
        break;

      case 'profile':
        // When on profile, preload feed data and all profile tab data eagerly
        dispatch(postsApi.util.prefetch('getPosts', { limit: 20, offset: 0 }, { force: false }));
        dispatch(usersApi.util.prefetch('getUserPosts', userId, { force: false }));
        dispatch(usersApi.util.prefetch('getUserReposts', userId, { force: false }));
        dispatch(usersApi.util.prefetch('getUserSavedPosts', userId, { force: false }));
        break;

      case 'search':
        // When on search, preload feed and profile
        dispatch(postsApi.util.prefetch('getPosts', { limit: 20, offset: 0 }, { force: false }));
        dispatch(usersApi.util.prefetch('getProfile', undefined, { force: false }));
        break;

      case 'activity':
        // When on activity, preload feed and profile
        dispatch(postsApi.util.prefetch('getPosts', { limit: 20, offset: 0 }, { force: false }));
        dispatch(usersApi.util.prefetch('getProfile', undefined, { force: false }));
        break;
    }
  }, [currentRoute, dispatch, profile?.user_id]);
}
