'use client';

import React, { useState } from 'react';
import {
  useGetFollowersQuery,
  useGetFollowingQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetProfileQuery,
} from '@/lib/store/services/usersApi';

type FollowTab = 'followers' | 'following';

interface FollowersModalProps {
  userId: number;
  followerCount: number;
  onClose: () => void;
  initialTab?: FollowTab;
}

export default function FollowersModal({
  userId,
  followerCount,
  onClose,
  initialTab = 'followers',
}: FollowersModalProps) {
  const { data: profile } = useGetProfileQuery();
  const [activeTab, setActiveTab] = useState<FollowTab>(initialTab);

  const { data: followers = [], isLoading: loadingFollowers } =
    useGetFollowersQuery(userId);
  const { data: following = [], isLoading: loadingFollowing } =
    useGetFollowingQuery(userId);

  const { data: myFollowing = [] } = useGetFollowingQuery(profile?.user_id ?? 0, {
    skip: !profile?.user_id,
  });

  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  /* Track local follow state per user for optimistic UI */
  const [localFollowState, setLocalFollowState] = useState<
    Record<number, boolean>
  >({});

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

  const list = activeTab === 'followers' ? followers : following;
  const isLoading =
    activeTab === 'followers' ? loadingFollowers : loadingFollowing;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] max-h-[80vh] bg-[#181818] border border-white/10 rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border-none text-white/60 hover:text-white"
          aria-label="Close"
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('followers')}
            className={`flex-1 py-4 text-center text-sm font-semibold transition-colors cursor-pointer bg-transparent border-none ${
              activeTab === 'followers'
                ? 'text-white border-b-2 border-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span className="block">Followers</span>
            <span className="block text-xs font-normal mt-0.5 text-white/40">
              {followerCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`flex-1 py-4 text-center text-sm font-semibold transition-colors cursor-pointer bg-transparent border-none ${
              activeTab === 'following'
                ? 'text-white border-b-2 border-white'
                : 'text-white/40 hover:text-white/60'
            }`}
          >
            <span className="block">Following</span>
            <span className="block text-xs font-normal mt-0.5 text-white/40">
              {following.length}
            </span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-2">
          {isLoading ? (
            <div className="flex flex-col gap-3 py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/10 rounded w-28" />
                    <div className="h-2.5 bg-white/5 rounded w-20" />
                  </div>
                  <div className="h-8 w-24 bg-white/10 rounded-lg" />
                </div>
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-white/30 text-sm">
              {activeTab === 'followers'
                ? 'No followers yet'
                : 'Not following anyone yet'}
            </div>
          ) : (
            list.map((user) => {
              const isCurrentlyFollowing = myFollowing.some((f) => f.id === user.id);
              const isFollowed = localFollowState[user.id] ?? isCurrentlyFollowing;
              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 py-3 border-b border-white/5 last:border-b-0"
                >
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {user.profile_picture_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={user.profile_picture_url}
                        alt={user.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-white/50">
                        {user.username[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {user.username}
                    </p>
                  </div>

                  {/* Follow button */}
                  {user.id !== profile?.user_id && (
                    <button
                      onClick={() =>
                        isFollowed
                          ? handleUnfollow(user.id)
                          : handleFollow(user.id)
                      }
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
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
      </div>
    </div>
  );
}
