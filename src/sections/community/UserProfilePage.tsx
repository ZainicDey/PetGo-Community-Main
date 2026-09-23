'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ThreadCard, { type Thread } from './ThreadCard';
import ThreadFeedSkeleton from './ThreadSkeleton';
import FollowersModal from './FollowersModal';
import {
  useGetProfileQuery,
  useGetUserProfileQuery,
  useGetUserPostsQuery,
  useGetUserRepostsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowingQuery,
} from '@/lib/store/services/usersApi';
import type { ApiPost, ApiProfile } from '@/lib/store/types';

type ProfileTab = 'posts' | 'reposts';

const AVATAR_COLORS = [
  '#f7941d',
  '#e05c97',
  '#5c8ae0',
  '#5ce087',
  '#e0c45c',
  '#c45ce0',
  '#5ce0d8',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function mapApiPostToThread(
  post: ApiPost,
  profile?: ApiProfile,
  isRepost = false,
): Thread {
  const allMedia =
    post.media?.map((m) => ({ url: m.url, type: m.media_type })) || [];

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

  const isOwnTargetPost = profile && post.author_id === profile.user_id;

  // Use author info from API, or fallback to target profile info
  const authorName =
    post.author?.username ||
    (isOwnTargetPost ? profile?.username : undefined) ||
    `User ${post.author_id}`;

  const authorAvatar =
    post.author?.profile_picture_url ||
    (isOwnTargetPost ? profile?.profile_picture_url : undefined);

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
    reposted: isRepost ? true : post.is_reposted,
    isSaved: post.is_saved,
    repostedBy: isRepost && profile ? profile.username : post.reposter?.username,
    quotedPost: post.quoted_post
      ? mapApiPostToThread(post.quoted_post, profile)
      : undefined,
    isOwn: false,
    authorId: post.author?.id ?? profile?.user_id,
    isFollowed: post.author?.is_followed,
    followerCount: post.author?.follower_count,
    isPetProfile: post.author?.profile_type === 'pet' || profile?.profile_type === 'pet',
    petType: post.author?.pet_type || profile?.pet_type,
  };
}

interface UserProfilePageProps {
  userId: number;
}

export default function UserProfilePage({ userId }: UserProfilePageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [showFollowers, setShowFollowers] = useState(false);

  /* Fetch the logged-in user's own profile to detect self-visits */
  const { data: myProfile } = useGetProfileQuery();

  /* Redirect to own profile page if viewing own user ID */
  useEffect(() => {
    if (myProfile && myProfile.user_id === userId) {
      router.replace('/community/profile');
    }
  }, [myProfile, userId, router]);

  /* Fetch target user's profile */
  const {
    data: userProfile,
    isLoading: profileLoading,
    isError: profileError,
  } = useGetUserProfileQuery(userId);

  /* Fetch target user's posts */
  const { data: userPosts = [], isLoading: isPostsLoading } = useGetUserPostsQuery(userId);

  /* Fetch target user's reposts */
  const { data: reposts = [], isLoading: isRepostsLoading } = useGetUserRepostsQuery(userId);

  /* Follow state management */
  const { data: myFollowing = [] } = useGetFollowingQuery(
    myProfile?.user_id ?? 0,
    { skip: !myProfile?.user_id },
  );
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const [localFollowState, setLocalFollowState] = useState<boolean | null>(null);

  const isCurrentlyFollowing = myFollowing.some((f) => f.id === userId);
  const isFollowed = localFollowState ?? isCurrentlyFollowing;

  const handleFollow = async () => {
    setLocalFollowState(true);
    try {
      await followUser(userId).unwrap();
    } catch {
      setLocalFollowState(false);
    }
  };

  const handleUnfollow = async () => {
    setLocalFollowState(false);
    try {
      await unfollowUser(userId).unwrap();
    } catch {
      setLocalFollowState(true);
    }
  };

  const postsAsThreads = userPosts.map((p) => mapApiPostToThread(p, userProfile, false));
  const repostsAsThreads = reposts.map((p) => mapApiPostToThread(p, userProfile, true));

  const currentList =
    activeTab === 'posts' ? postsAsThreads : repostsAsThreads;

  const isListLoading = activeTab === 'posts' ? isPostsLoading : isRepostsLoading;

  /* ── Loading skeleton ── */
  if (profileLoading) {
    return (
      <div className="max-w-[620px] mx-auto py-8 px-4">
        <div className="animate-pulse flex flex-col gap-6">
          {/* Header skeleton */}
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <div className="h-7 bg-white/10 rounded w-40" />
              <div className="h-4 bg-white/5 rounded w-28" />
              <div className="h-4 bg-white/5 rounded w-20 mt-4" />
            </div>
            <div className="w-20 h-20 rounded-full bg-white/10" />
          </div>
          <div className="h-10 bg-white/10 rounded-xl" />
          {/* Tab skeleton */}
          <div className="flex gap-0 border-b border-white/10">
            <div className="flex-1 h-10 bg-white/5 rounded" />
            <div className="flex-1 h-10 bg-white/5 rounded" />
          </div>
          {/* Post skeletons */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-white/10 rounded w-32" />
                <div className="h-3 bg-white/5 rounded w-full" />
                <div className="h-3 bg-white/5 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Error / not found ── */
  if (profileError || !userProfile) {
    return (
      <div className="max-w-[620px] mx-auto py-16 px-4 text-center text-white/40">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mx-auto mb-4 opacity-40"
        >
          <circle cx="12" cy="8" r="5" />
          <path d="M20 21a8 8 0 10-16 0" />
        </svg>
        <p className="text-lg">User not found</p>
        <p className="text-sm mt-2">This profile may not exist or has been removed.</p>
        <button
          onClick={() => router.back()}
          className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold border border-white/20 bg-transparent text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          Go back
        </button>
      </div>
    );
  }

  const avatarBg = getAvatarColor(userProfile.username);
  const initials = userProfile.username[0]?.toUpperCase() || '?';

  return (
    <>
      <div className="max-w-[620px] mx-auto py-6 px-4">
        {/* ── Back Button ── */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors cursor-pointer bg-transparent border-none p-0 mb-4"
          id="user-profile-back-btn"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        {/* ── Profile Header ── */}
        <div className="border border-white/10 rounded-2xl bg-[#181818] p-5 mb-4">
          {/* Top row: name + avatar */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 mr-4">
              <h1 className="text-2xl font-bold text-white truncate">
                {userProfile.username}
              </h1>
              <p className="text-sm text-white/50 mt-0.5">
                @{userProfile.username}
              </p>
            </div>
            <div
              className="w-[76px] h-[76px] rounded-full overflow-hidden shrink-0 border-2 border-white/10 flex items-center justify-center"
              style={
                !userProfile.profile_picture_url
                  ? { backgroundColor: avatarBg }
                  : undefined
              }
            >
              {userProfile.profile_picture_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={userProfile.profile_picture_url}
                  alt={userProfile.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {initials}
                </span>
              )}
            </div>
          </div>

          {/* Follower count — clickable */}
          <button
            onClick={() => setShowFollowers(true)}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors cursor-pointer bg-transparent border-none p-0 mb-4"
          >
            <span className="font-semibold text-white/60">
              {userProfile.follower_count ?? 0}
            </span>
            <span>
              {(userProfile.follower_count ?? 0) === 1
                ? 'follower'
                : 'followers'}
            </span>
          </button>

          {/* Follow / Unfollow button */}
          <button
            onClick={() => (isFollowed ? handleUnfollow() : handleFollow())}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border active:scale-[0.98] ${
              isFollowed
                ? 'border-white/20 bg-transparent text-white hover:bg-white/5'
                : 'border-transparent bg-white text-black hover:bg-white/90'
            }`}
            id="user-profile-follow-btn"
          >
            {isFollowed ? 'Following' : 'Follow'}
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex relative border-b border-white/10 mb-0">
          {(['posts', 'reposts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center text-sm font-semibold transition-colors cursor-pointer bg-transparent border-none ${
                activeTab === tab
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab === 'posts' ? 'Posts' : 'Reposts'}
            </button>
          ))}
          {/* Animated bottom border */}
          <div 
            className="absolute bottom-0 w-1/2 h-full pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{ 
              transform: activeTab === 'posts' ? 'translateX(0%)' : 'translateX(100%)',
            }}
          >
            <div className="absolute -bottom-px left-0 right-0 h-[2px] bg-white rounded-t-sm" />
          </div>
        </div>

        {/* ── Posts List ── */}
        <div className="mt-4 border-1 border-white/4 rounded-3xl bg-[#181818]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(255,255,255,0.022)] overflow-hidden">
          {isListLoading ? (
            <ThreadFeedSkeleton />
          ) : currentList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/30">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-4 opacity-40"
              >
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <p className="text-sm">
                {activeTab === 'posts'
                  ? 'No posts yet'
                  : 'No reposts yet'}
              </p>
            </div>
          ) : (
            currentList.map((thread, idx) => (
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

      {/* ── Modals ── */}
      {showFollowers && (
        <FollowersModal
          userId={userProfile.user_id}
          followerCount={userProfile.follower_count ?? 0}
          onClose={() => setShowFollowers(false)}
        />
      )}
    </>
  );
}
