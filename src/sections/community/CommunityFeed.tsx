'use client';

import React, { useState, useEffect } from 'react';
import ThreadCard, { Thread } from './ThreadCard';
import ThreadFeedSkeleton from './ThreadSkeleton';
import { useGetPostsQuery, useCreatePostMutation } from '@/lib/store/services/postsApi';
import { useGetProfileQuery, useGetUserLikesQuery } from '@/lib/store/services/usersApi';
import type { ApiPost, ApiProfile } from '@/lib/store/types';
import { uploadMediaToCloudinary } from '@/lib/utils/upload';
import Image from 'next/image';

type FeedTab = 'foryou' | 'following';

/**
 * Maps an API post response to the ThreadCard's Thread interface.
 * Handles differences between backend shape and frontend display model.
 */
function mapApiPostToThread(post: ApiPost, profile?: ApiProfile): Thread {
  const allMedia = post.media?.map((m) => ({ url: m.url, type: m.media_type })) || [];

  // Generate a relative time string from created_at
  const createdDate = new Date(post.created_at);
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
    media: allMedia.length > 0 ? allMedia : undefined,
    likes: post.likes_count ?? 0,
    replies: post.comments_count ?? 0,
    reposts: post.reposts_count ?? 0,
    time: timeStr,
    liked: post.is_liked,
    reposted: post.is_reposted,
    isOwn: !!isOwnPost,
    authorId: post.author?.id,
    isFollowed: post.author?.is_followed,
    isPetProfile: post.author?.profile_type === 'pet',
  };
}

export default function CommunityFeed() {
  const [activeTab, setActiveTab] = useState<FeedTab>('foryou');
  const [localThreads, setLocalThreads] = useState<Thread[]>([]);

  const { data: posts, isLoading: isLoadingFeed, isError: isErrorFeed } = useGetPostsQuery({ limit: 20, offset: 0 });
  const [createPost] = useCreatePostMutation();
  const { data: profile } = useGetProfileQuery();

  const { data: likedPosts, isLoading: isLoadingLiked, isError: isErrorLiked } = useGetUserLikesQuery(
    profile?.user_id as number,
    { skip: !profile?.user_id || activeTab !== 'following' }
  );

  const avatarUrl = profile?.profile_picture_url;
  const initials = profile?.username?.[0]?.toUpperCase() || '?';

  // Select the appropriate data source
  const currentPosts = activeTab === 'foryou' ? posts : likedPosts;
  const isLoading = activeTab === 'foryou' ? isLoadingFeed : isLoadingLiked;
  const isError = activeTab === 'foryou' ? isErrorFeed : isErrorLiked;

  // Map API posts to Thread[] whenever data changes
  const apiThreads: Thread[] = currentPosts?.map((p) => mapApiPostToThread(p, profile)) ?? [];
  const threads = activeTab === 'foryou' ? [...localThreads, ...apiThreads] : apiThreads;

  const handleNewThread = React.useCallback(async (text: string, files: File[] = []) => {
    // Optimistic local insert for instant feedback
    const tempMedia = files.map((f) => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video/') ? 'video' : 'image',
    }));

    const tempThread: Thread = {
      id: `temp-${Date.now()}`,
      author: profile?.username || 'You',
      handle: profile?.username || 'you',
      avatar: profile?.profile_picture_url,
      content: text,
      media: tempMedia.length > 0 ? tempMedia : undefined,
      likes: 0,
      replies: 0,
      reposts: 0,
      time: 'now',
      isOwn: true,
    };
    setLocalThreads((prev) => [tempThread, ...prev]);

    // Fire the API mutation (cache invalidation will refetch the list)
    try {
      let uploadedMedia = undefined;
      if (files.length > 0) {
        uploadedMedia = await Promise.all(files.map(uploadMediaToCloudinary));
      }
      
      await createPost({ content: text, media: uploadedMedia }).unwrap();
      // Remove local optimistic thread after the API response triggers a refetch
      setLocalThreads((prev) => prev.filter((t) => t.id !== tempThread.id));
      
      // Cleanup object URLs
      tempMedia.forEach((m) => URL.revokeObjectURL(m.url));
    } catch {
      // Keep the optimistic thread on failure so it doesn't disappear
      // In a real app, you might show a retry button here
    }
  }, [profile, createPost]);

  useEffect(() => {
    const handleCustomPost = (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string; files: File[] }>;
      if (customEvent.detail) {
        handleNewThread(customEvent.detail.text, customEvent.detail.files);
      }
    };
    window.addEventListener('community-new-post', handleCustomPost);
    return () => {
      window.removeEventListener('community-new-post', handleCustomPost);
    };
  }, [handleNewThread]);

  return (
    <div className="max-w-[680px] mx-auto px-4 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#101010]/92 backdrop-blur-md pt-5 mb-1">
        <div className="flex relative mb-5">
          <button
            id="community-tab-foryou"
            className={`flex-1 py-3 px-4 bg-transparent border-none text-[15px] cursor-pointer transition-colors hover:text-[#ffe1bd] font-inherit ${activeTab === 'foryou' ? "text-[#ffe1bd] font-semibold" : 'text-white/40 font-medium'}`}
            onClick={() => setActiveTab('foryou')}
          >
            For you
          </button>
          <button
            id="community-tab-following"
            className={`flex-1 py-3 px-4 bg-transparent border-none text-[15px] cursor-pointer transition-colors hover:text-[#ffe1bd] font-inherit ${activeTab === 'following' ? "text-[#ffe1bd] font-semibold" : 'text-white/40 font-medium'}`}
            onClick={() => setActiveTab('following')}
          >
            Liked
          </button>
          
          {/* Animated bottom border */}
          <div 
            className="absolute bottom-0 w-1/2 h-full pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ 
              transform: activeTab === 'foryou' ? 'translateX(0%)' : 'translateX(100%)',
            }}
          >
            <div className="absolute -bottom-px left-8 right-8 h-[2px] bg-[#F7941D] rounded-t-full shadow-[0_0_8px_rgba(247,148,29,0.5)]" />
          </div>
        </div>
      </div>

      {/* Main Feed Container */}
      <div className="border-1 border-white/4 rounded-3xl bg-[#181818]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(255,255,255,0.022)] overflow-hidden mt-4">
        {/* What's new box */}
        <div
          className="flex items-center gap-3 py-4 px-5 border-b border-white/5 cursor-pointer"
          onClick={(e) => {
            if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).closest('button') === null) {
              window.dispatchEvent(new CustomEvent('community-open-new-thread'));
            }
          }}
        >
          <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0 text-white overflow-hidden">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Your avatar" width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <span className="text-base font-bold text-white/70">{initials}</span>
            )}
          </div>
          <input
            id="whats-new-input"
            className="flex-1 bg-transparent border-none outline-none text-white text-base font-light placeholder:text-white/35 cursor-pointer"
            placeholder="What's new?"
            type="text"
            readOnly
          />
          <button
            className="bg-transparent text-white border border-white/20 rounded-full py-1.5 px-4 text-sm font-semibold cursor-pointer transition-colors hover:bg-white/5 hover:border-white/40"
            onClick={() => window.dispatchEvent(new CustomEvent('community-open-new-thread'))}
          >
            Post
          </button>
        </div>

        {/* Thread List */}
        {isLoading ? (
          <ThreadFeedSkeleton />
        ) : isError ? (
          <div className="text-center py-16 text-white/40">
            <p className="text-lg mb-2">Failed to load feed</p>
            <p className="text-sm">Please check your connection and try again.</p>
          </div>
        ) : threads.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <p className="text-lg">No posts yet</p>
            <p className="text-sm mt-1">Be the first to share something!</p>
          </div>
        ) : (
          threads.map((thread, i) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              index={i}
              showLine={false}
            />
          ))
        )}
      </div>
    </div>
  );
}
