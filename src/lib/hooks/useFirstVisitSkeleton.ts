'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Tracks which route keys have been visited during this browser session.
 * Persists across re-renders but resets on full page reload (session-level).
 */
const visitedRoutes = new Set<string>();

/**
 * Returns `true` for a configurable duration on the first visit to a route,
 * giving the illusion of a loading state even when data is already cached.
 * Subsequent visits to the same route skip the skeleton entirely.
 *
 * @param routeKey  — unique identifier for the route (e.g. 'feed', 'profile')
 * @param durationMs — how long to show the skeleton (default: 1000ms)
 */
export function useFirstVisitSkeleton(routeKey: string, durationMs = 1000): boolean {
  // Compute initial value synchronously — no effect needed for repeat visits
  const [showSkeleton, setShowSkeleton] = useState(
    () => !visitedRoutes.has(routeKey),
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visitedRoutes.has(routeKey)) {
      visitedRoutes.add(routeKey);
      timerRef.current = setTimeout(() => {
        setShowSkeleton(false);
      }, durationMs);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // Only run on mount — routeKey and durationMs should be stable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return showSkeleton;
}
