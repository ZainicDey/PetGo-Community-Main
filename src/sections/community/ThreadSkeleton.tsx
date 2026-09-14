'use client';

import React from 'react';

interface ThreadSkeletonProps {
  hasImages?: boolean;
}

export function ThreadSkeleton({ hasImages = false }: ThreadSkeletonProps) {
  return (
    <article className="py-4 px-5 border-b border-white/5 flex gap-3 last:border-b-0">
      {/* Avatar column */}
      <div className="flex flex-col items-center gap-0 shrink-0">
        <div className="relative flex">
          <div className="w-10 h-10 rounded-full skeleton-shimmer bg-white/5" />
        </div>
      </div>

      {/* Thread body */}
      <div className="flex-1 min-w-0">
        {/* Meta row */}
        <div className="flex items-baseline gap-2 mb-2">
          <div className="h-4 w-28 bg-white/5 rounded skeleton-shimmer" />
          <div className="h-3 w-8 bg-white/5 rounded skeleton-shimmer" />
        </div>

        {/* Content */}
        <div className="space-y-2 mb-3.5">
          <div className="h-3.5 w-full bg-white/5 rounded skeleton-shimmer" />
          <div className="h-3.5 w-[92%] bg-white/5 rounded skeleton-shimmer" />
          <div className="h-3.5 w-[65%] bg-white/5 rounded skeleton-shimmer" />
        </div>

        {/* Optional images skeleton */}
        {hasImages ? (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-2.5 pb-2 min-w-0">
            {/* Render 3 image placeholder boxes matching the multi-image horizontal scroll */}
            <div className="w-[75%] sm:w-[240px] h-[220px] rounded-xl shrink-0 skeleton-shimmer bg-white/5" />
            <div className="w-[75%] sm:w-[240px] h-[220px] rounded-xl shrink-0 skeleton-shimmer bg-white/5" />
            <div className="w-[75%] sm:w-[240px] h-[220px] rounded-xl shrink-0 skeleton-shimmer bg-white/5" />
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-1">
          <div className="h-7 w-12 rounded-lg bg-white/5 skeleton-shimmer shrink-0" />
          <div className="h-7 w-12 rounded-lg bg-white/5 skeleton-shimmer shrink-0" />
          <div className="h-7 w-12 rounded-lg bg-white/5 skeleton-shimmer shrink-0" />
          <div className="h-7 w-7 rounded-lg bg-white/5 skeleton-shimmer shrink-0" />
        </div>
      </div>
    </article>
  );
}

export default function ThreadFeedSkeleton() {
  return (
    <div className="divide-y divide-white/5">
      {/* First thread has multiple images */}
      <ThreadSkeleton hasImages={true} />
      {/* Remaining threads are text-only */}
      <ThreadSkeleton hasImages={false} />
      <ThreadSkeleton hasImages={false} />
      <ThreadSkeleton hasImages={false} />
    </div>
  );
}
