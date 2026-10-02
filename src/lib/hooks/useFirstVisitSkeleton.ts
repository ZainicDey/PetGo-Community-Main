'use client';

import { useState, useEffect } from 'react';

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
  // Mark the route visited inside the initializer so it only happens once,
  // even if React Strict Mode double-invokes the component body.
  const [showSkeleton, setShowSkeleton] = useState(() => {
    if (visitedRoutes.has(routeKey)) return false;
    visitedRoutes.add(routeKey);
    return true;
  });

  useEffect(() => {
    if (!showSkeleton) return;

    // Always create a fresh timer — survives Strict Mode's cleanup→re-run cycle
    const timer = setTimeout(() => {
      setShowSkeleton(false);
    }, durationMs);

    return () => clearTimeout(timer);
  }, [showSkeleton, durationMs]);

  return showSkeleton;
}

