'use client';

import React from 'react';
import ThreadCard, { Thread } from './ThreadCard';
import ThreadFeedSkeleton from './ThreadSkeleton';
import { useGetMeQuery, useGetUserLikesQuery, useGetProfileQuery } from '@/lib/store/services/usersApi';
import type { ApiPost, ApiProfile } from '@/lib/store/types';

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
    (isOwnPost ? profile.username : undefined) ||
    `User ${post.author_id}`;

  const authorAvatar =
    post.author?.profile_picture_url ||
    (isOwnPost ? profile.profile_picture_url : undefined);

  return {
    id: String(post.id),
    author: authorName,
    handle: authorName.toLowerCase().replace(/\s/g, ''),
    avatar: authorAvatar,
    content: post.content,
    media: allMedia,
    likes: post.likes_count,
    replies: post.comments_count,
    reposts: post.reposts_count,
    time: timeStr,
    liked: post.is_liked,
    reposted: post.is_reposted,
    isSaved: post.is_saved,
    repostedBy: post.reposter?.username,
    quotedPost: post.quoted_post
      ? mapApiPostToThread(post.quoted_post, profile)
      : undefined,
    isOwn: !!isOwnPost,
    authorId: post.author?.id,
    isFollowed: post.author?.is_followed,
    followerCount: post.author?.follower_count,
    isPetProfile: post.author?.profile_type === 'pet',
    petType: post.author?.pet_type,
  };
}

export default function LikedFeedPage() {
  const { data: me } = useGetMeQuery();
  const { data: profile } = useGetProfileQuery();
  const { data: likedPosts, isLoading, isError } = useGetUserLikesQuery(me?.id as number, {
    skip: !me?.id,
  });

  const threads: Thread[] = (likedPosts || []).map((post) => mapApiPostToThread(post, profile));

  return (
    <div className="max-w-[680px] mx-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#101010]/80 backdrop-blur-xl border-b border-white/5 px-5 py-4">
        <h1 className="text-xl font-bold text-white m-0">Liked Posts</h1>
        <p className="text-sm text-white/40 mt-0.5 m-0">Posts you&apos;ve liked</p>
      </div>

      {/* Content */}
      <div className="border-1 border-white/4 rounded-3xl bg-[#181818]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(255,255,255,0.022)] overflow-hidden mt-4">
        {isLoading ? (
          <ThreadFeedSkeleton />
        ) : isError ? (
          <div className="text-center py-16 text-white/40">Failed to load liked posts</div>
        ) : threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="text-lg font-semibold text-white/70 mb-2">No liked posts yet</h3>
            <p className="text-sm text-white/40 max-w-[300px]">
              When you like a post, it will show up here so you can easily find it again.
            </p>
          </div>
        ) : (
          threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))
        )}
      </div>
    </div>
  );
}
