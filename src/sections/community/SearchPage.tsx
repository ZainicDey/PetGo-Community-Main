'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useSearchUsersQuery,
  useSearchPostsQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetProfileQuery,
  useGetFollowingQuery,
} from '@/lib/store/services/usersApi';
import ThreadCard, { type Thread } from './ThreadCard';
import ThreadFeedSkeleton from './ThreadSkeleton';
import type { ApiPost, ApiProfile } from '@/lib/store/types';

type SearchTab = 'profiles' | 'top';

/* ── Pet Type Icons ── */
const PawIcon = () => (
  <svg
    viewBox="0 0 48.839 48.839"
    fill="black"
    style={{ width: 11, height: 11, transform: 'rotate(20deg)', display: 'inline-block' }}
    aria-label="Pet profile"
  >
    <path d="M39.041,36.843c2.054,3.234,3.022,4.951,3.022,6.742c0,3.537-2.627,5.252-6.166,5.252
      c-1.56,0-2.567-0.002-5.112-1.326c0,0-1.649-1.509-5.508-1.354c-3.895-0.154-5.545,1.373-5.545,1.373
      c-2.545,1.323-3.516,1.309-5.074,1.309c-3.539,0-6.168-1.713-6.168-5.252c0-1.791,0.971-3.506,3.024-6.742
      c0,0,3.881-6.445,7.244-9.477c2.43-2.188,5.973-2.18,5.973-2.18h1.093v-0.001c0,0,3.698-0.009,5.976,2.181
      C35.059,30.51,39.041,36.844,39.041,36.843z M16.631,20.878c3.7,0,6.699-4.674,6.699-10.439S20.331,0,16.631,0
      S9.932,4.674,9.932,10.439S12.931,20.878,16.631,20.878z M10.211,30.988c2.727-1.259,3.349-5.723,1.388-9.971
      s-5.761-6.672-8.488-5.414s-3.348,5.723-1.388,9.971C3.684,29.822,7.484,32.245,10.211,30.988z M32.206,20.878
      c3.7,0,6.7-4.674,6.7-10.439S35.906,0,32.206,0s-6.699,4.674-6.699,10.439C25.507,16.204,28.506,20.878,32.206,20.878z
       M45.727,15.602c-2.728-1.259-6.527,1.165-8.488,5.414s-1.339,8.713,1.389,9.972c2.728,1.258,6.527-1.166,8.488-5.414
      S48.455,16.861,45.727,15.602z" />
  </svg>
);

const FishIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="black"
    style={{ width: 11, height: 11, display: 'inline-block' }}
    aria-label="Fish profile"
  >
    <path d="M21.5 12C21.5 12 18 16 12 16C6 16 2.5 19 2.5 19V5C2.5 5 6 8 12 8C18 8 21.5 12 21.5 12Z" />
    <circle cx="16" cy="10.5" r="1.5" fill="white" />
    <path d="M11 8L10 3L14 6.5L11 8Z" />
    <path d="M11 16L10 21L14 17.5L11 16Z" />
  </svg>
);

const BirdIcon = () => (
  <span style={{ fontSize: '9px', lineHeight: 1, position: 'relative', top: '1px' }} aria-label="Bird profile">
    🐥
  </span>
);

/* ── Map API post to ThreadCard shape (same as ProfilePage) ── */
function mapApiPostToThread(
  post: ApiPost,
  profile?: ApiProfile,
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
    quotedPost: post.quoted_post
      ? mapApiPostToThread(post.quoted_post, profile)
      : undefined,
    isOwn: !!isOwnPost,
    authorId: post.author?.id ?? profile?.user_id,
    isFollowed: post.author?.is_followed,
    followerCount: post.author?.follower_count,
    isPetProfile: post.author?.profile_type === 'pet',
    petType: post.author?.pet_type,
  };
}

export default function SearchPage() {
  const router = useRouter();
  const { data: profile } = useGetProfileQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('profiles');

  // 1 second debounce for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: myFollowing = [] } = useGetFollowingQuery(profile?.user_id ?? 0, {
    skip: !profile?.user_id,
  });

  /* ── User search query ── */
  const { data: userResults = [], isLoading: isUsersLoading, isFetching: isUsersFetching } = useSearchUsersQuery(
    debouncedSearchTerm,
    {
      skip: !debouncedSearchTerm.trim() || activeTab !== 'profiles',
    }
  );

  /* ── Posts search query ── */
  const { data: postResults = [], isLoading: isPostsLoading, isFetching: isPostsFetching } = useSearchPostsQuery(
    debouncedSearchTerm,
    {
      skip: !debouncedSearchTerm.trim() || activeTab !== 'top',
    }
  );

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const [localFollowState, setLocalFollowState] = useState<Record<number, boolean>>({});

  const handleFollow = async (targetUserId: number) => {
    setLocalFollowState((prev) => ({ ...prev, [targetUserId]: true }));
    try {
      await followUser(targetUserId).unwrap();
    } catch {
      setLocalFollowState((prev) => ({ ...prev, [targetUserId]: false }));
    }
  };

  const handleUnfollow = async (targetUserId: number) => {
    setLocalFollowState((prev) => ({ ...prev, [targetUserId]: false }));
    try {
      await unfollowUser(targetUserId).unwrap();
    } catch {
      setLocalFollowState((prev) => ({ ...prev, [targetUserId]: true }));
    }
  };

  const isUsersSearching = isUsersLoading || isUsersFetching;
  const isPostsSearching = isPostsLoading || isPostsFetching;

  const postsAsThreads = postResults.map((p) => mapApiPostToThread(p, profile));

  const hasQuery = debouncedSearchTerm.trim() !== '';

  return (
    <div className="max-w-[680px] mx-auto px-4 pb-20 pt-5">
      {/* Search Input Box */}
      <div className="sticky top-0 z-10 bg-[#101010]/95 backdrop-blur-md pb-0 pt-1">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            className="w-full bg-[#181818] rounded-full py-3.5 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ── Tabs ── */}
        <div className="flex relative border-b border-white/10 mb-0">
          {(['profiles', 'top'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center text-sm font-semibold transition-colors cursor-pointer bg-transparent border-none ${activeTab === tab
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/60'
                }`}
            >
              {tab === 'profiles' ? 'Profiles' : 'Top'}
            </button>
          ))}
          {/* Animated bottom border */}
          <div
            className="absolute bottom-0 w-1/2 h-full pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              transform: activeTab === 'profiles' ? 'translateX(0%)' : 'translateX(100%)',
            }}
          >
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white rounded-t-full" />
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      {activeTab === 'profiles' ? (
        /* ── Profiles Tab ── */
        <div className="mt-2 flex flex-col gap-1">
          {!hasQuery ? (
            <div className="text-center py-16 text-white/40">
              <p className="text-sm">Search for users...</p>
            </div>
          ) : isUsersSearching ? (
            <div className="flex flex-col gap-3 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse px-2 py-2">
                  <div className="w-12 h-12 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-3.5 bg-white/10 rounded w-32" />
                    <div className="h-2.5 bg-white/5 rounded w-24" />
                  </div>
                  <div className="h-9 w-[100px] bg-white/10 rounded-xl" />
                </div>
              ))}
            </div>
          ) : userResults.length === 0 ? (
            <div className="text-center py-16 text-white/40">
              <p className="text-sm">No users found for &quot;{debouncedSearchTerm}&quot;</p>
            </div>
          ) : (
            userResults.map((user) => {
              const isCurrentlyFollowing = myFollowing.some((f) => f.id === user.id);
              const isFollowed = localFollowState[user.id] ?? isCurrentlyFollowing;
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-4 px-2 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors rounded-xl cursor-pointer"
                  onClick={() => {
                    if (user.id === profile?.user_id) {
                      router.push('/community/profile');
                    } else {
                      router.push(`/community/user/${user.id}`);
                    }
                  }}
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {user.profile_picture_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.profile_picture_url}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-white/50">
                        {user.username[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[15px] font-semibold text-white truncate">
                      {user.username}
                      {user.profile_type === 'pet' && (
                        <span className="inline-flex items-center justify-center bg-[#d4d4d4] rounded-full w-[15px] h-[15px] relative shrink-0">
                          {user.pet_type?.toLowerCase() === 'fish' ? <FishIcon /> : user.pet_type?.toLowerCase() === 'bird' ? <BirdIcon /> : <PawIcon />}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/50 truncate">
                      {user.username}
                    </p>
                  </div>

                  {/* Follow Button */}
                  {user.id !== profile?.user_id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isFollowed) {
                          handleUnfollow(user.id);
                        } else {
                          handleFollow(user.id);
                        }
                      }}
                      className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                        isFollowed
                          ? 'bg-transparent border-white/20 text-white/60 hover:border-white/40'
                          : 'bg-white text-black border-transparent hover:bg-white/90'
                      }`}
                    >
                      {isFollowed ? 'Unfollow' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* ── Top (Posts) Tab ── */
        <div className="mt-4 border-1 border-white/4 rounded-3xl bg-[#181818]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(255,255,255,0.022)] overflow-hidden">
          {!hasQuery ? (
            <div className="text-center py-16 text-white/40">
              <p className="text-sm">Search for posts...</p>
            </div>
          ) : isPostsSearching ? (
            <ThreadFeedSkeleton />
          ) : postsAsThreads.length === 0 ? (
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
              <p className="text-sm">No posts found for &quot;{debouncedSearchTerm}&quot;</p>
            </div>
          ) : (
            postsAsThreads.map((thread, idx) => (
              <ThreadCard
                key={thread.id}
                thread={thread}
                index={idx}
                showLine={false}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
