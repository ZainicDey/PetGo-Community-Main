'use client';

import React from 'react';
import { useGetProfileQuery, useGetUserSavedPostsQuery } from '@/lib/store/services/usersApi';
import { useFirstVisitSkeleton } from '@/lib/hooks/useFirstVisitSkeleton';
import ThreadCard, { type Thread } from './ThreadCard';
import ThreadFeedSkeleton from './ThreadSkeleton';
import type { ApiPost, ApiProfile } from '@/lib/store/types';

/* ── Map API post to ThreadCard shape ── */
function mapApiPostToThread(post: ApiPost, profile?: ApiProfile): Thread {
  const allMedia = post.media?.map((m) => ({ url: m.url, type: m.media_type })) || [];

  const dateString = post.created_at.endsWith('Z') ? post.created_at : `${post.created_at}Z`;
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

  const isOwnPost = profile && post.author_id === profile.user_id;

  const authorName =
    post.author?.username ||
    (isOwnPost ? profile?.username : undefined) ||
    `User ${post.author_id}`;

  const authorAvatar =
    post.author?.profile_picture_url ||
    (isOwnPost ? profile?.profile_picture_url : undefined);

  return {
    id: String(post.id),
    author: authorName,
    handle: authorName.toLowerCase().replace(/\s/g, ''),
    avatar: authorAvatar,
    content: post.content,
    media: allMedia.length > 0 ? allMedia : undefined,
    likes: post.likes_count ?? 0,
    replies: post.comments_count ?? 0,
    reposts: post.reposts_count ?? 0,
    time: timeStr,
    liked: post.is_liked,
    reposted: post.is_reposted,
    isSaved: post.is_saved,
    repostedBy: post.reposter?.username,
    quotedPost: post.quoted_post ? mapApiPostToThread(post.quoted_post, profile) : undefined,
    isOwn: !!isOwnPost,
    authorId: post.author?.id ?? profile?.user_id,
    isFollowed: post.author?.is_followed,
    followerCount: post.author?.follower_count,
    isPetProfile: post.author?.profile_type === 'pet',
    petType: post.author?.pet_type,
    visibility: post.visibility,
  };
}

export default function SavedPage() {
  const { data: profile } = useGetProfileQuery();

  const { data: savedPosts = [], isLoading: isSavedLoading } = useGetUserSavedPostsQuery(profile?.user_id as number, {
    skip: !profile?.user_id,
  });
  const showFirstVisitSkeleton = useFirstVisitSkeleton('saved', 1000);

  const savedAsThreads = savedPosts.map((p) => mapApiPostToThread(p, profile));

  return (
    <div className="max-w-[680px] mx-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#101010]/80 backdrop-blur-xl border-b border-white/5 px-5 max-sm:px-4 py-4 max-sm:py-2.5">
        <h1 className="text-xl max-sm:text-lg font-bold text-white m-0">Saved</h1>
      </div>

      <div className="border border-white/4 max-sm:border-0 rounded-3xl max-sm:rounded-none bg-[#181818]/70 max-sm:bg-transparent backdrop-blur-2xl max-sm:backdrop-blur-none shadow-[0_8px_32px_rgba(255,255,255,0.022)] max-sm:shadow-none overflow-hidden mt-4 max-sm:mt-0">
        {(showFirstVisitSkeleton || isSavedLoading) ? (
          <ThreadFeedSkeleton />
        ) : savedAsThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-white/30">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-40">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
            <p className="text-sm">No saved posts</p>
          </div>
        ) : (
          savedAsThreads.map((thread, idx) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              index={idx}
              showLine={false}
            />
          ))
        )}
      </div>
    </div>
  );
}
