'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGetMeQuery, useGetUserActivityQuery } from '@/lib/store/services/usersApi';
import { useUnlikePostMutation, useUndoRepostMutation } from '@/lib/store/services/postsApi';

function formatRelativeTime(dateString: string) {
  const createdDate = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - createdDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeStr = 'now';
  if (diffDays > 0) timeStr = `${diffDays}d`;
  else if (diffHours > 0) timeStr = `${diffHours}h`;
  else if (diffMins > 0) timeStr = `${diffMins}m`;
  return timeStr;
}

export default function ActivityPage() {
  const router = useRouter();
  const { data: me } = useGetMeQuery();
  const { data: activityList, isLoading, isError } = useGetUserActivityQuery(me?.id as number, {
    skip: !me?.id,
  });
  
  const [unlikePost] = useUnlikePostMutation();
  const [undoRepost] = useUndoRepostMutation();

  const handleRemove = async (e: React.MouseEvent, type: 'like' | 'repost', postId: number) => {
    e.stopPropagation();
    try {
      if (type === 'like') {
        await unlikePost(postId).unwrap();
      } else {
        await undoRepost(postId).unwrap();
      }
    } catch (error) {
      console.error(`Failed to remove ${type}`, error);
    }
  };

  const handleRowClick = (postId: number) => {
    router.push(`/community/thread/${postId}`);
  };

  return (
    <div className="max-w-[680px] mx-auto px-4 pb-20 pt-5">
      <h1 className="text-2xl font-semibold mb-6">Activity</h1>
      
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-[#181818]/70 backdrop-blur-2xl p-4 rounded-2xl border border-white/5 animate-pulse"
            >
              <div className="flex items-center gap-4 overflow-hidden w-full">
                <div className="w-5 h-5 rounded-sm bg-white/10 shrink-0" />
                <div className="flex flex-col gap-2.5 w-full">
                  <div className="h-3.5 bg-white/10 rounded w-1/3" />
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                </div>
              </div>
              <div className="shrink-0 ml-4 w-[72px] h-[30px] rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-white/40">Failed to load activity</div>
      ) : !activityList || activityList.length === 0 ? (
        <div className="text-center py-16 text-white/40">No activity yet</div>
      ) : (
        <div className="flex flex-col gap-3">
          {activityList.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-[#181818]/70 backdrop-blur-2xl p-4 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => handleRowClick(item.post.id)}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="text-xl shrink-0">
                  {item.type === 'like' ? '❤️' : '🔁'}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <div className="text-sm font-medium text-white/80">
                    You {item.type}d a post
                    <span className="text-white/40 ml-2 text-xs">· {formatRelativeTime(item.timestamp)}</span>
                  </div>
                  <div className="text-base text-white truncate mt-1">
                    {item.post.content || 'Media post'}
                  </div>
                </div>
              </div>
              <button
                className="shrink-0 ml-4 px-3 py-1.5 text-xs font-semibold text-white/60 bg-transparent border border-white/20 rounded-full hover:text-white hover:border-white/40 hover:bg-white/5 transition-colors"
                onClick={(e) => handleRemove(e, item.type, item.post.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
