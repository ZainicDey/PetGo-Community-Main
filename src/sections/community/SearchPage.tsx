'use client';

import React, { useState, useEffect } from 'react';
import {
  useSearchUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetProfileQuery,
  useGetFollowingQuery,
} from '@/lib/store/services/usersApi';

export default function SearchPage() {
  const { data: profile } = useGetProfileQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // 2 second debounce for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: myFollowing = [] } = useGetFollowingQuery(profile?.user_id ?? 0, {
    skip: !profile?.user_id,
  });

  const { data: results = [], isLoading, isFetching } = useSearchUsersQuery(
    debouncedSearchTerm,
    {
      skip: !debouncedSearchTerm.trim(),
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

  const isSearching = isLoading || isFetching;

  return (
    <div className="max-w-[680px] mx-auto px-4 pb-20 pt-5">
      {/* Search Input Box */}
      <div className="sticky top-0 z-10 bg-[#101010]/95 backdrop-blur-md pb-4 pt-1">
        <div className="relative">
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
            className="w-full bg-[#181818] border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Results List */}
      <div className="mt-2 flex flex-col gap-1">
        {debouncedSearchTerm.trim() === '' ? (
          <div className="text-center py-16 text-white/40">
            <p className="text-sm">Search for users...</p>
          </div>
        ) : isSearching ? (
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
        ) : results.length === 0 ? (
          <div className="text-center py-16 text-white/40">
            <p className="text-sm">No results found for &quot;{debouncedSearchTerm}&quot;</p>
          </div>
        ) : (
          results.map((user) => {
            const isCurrentlyFollowing = myFollowing.some((f) => f.id === user.id);
            const isFollowed = localFollowState[user.id] ?? isCurrentlyFollowing;
            return (
              <div
                key={user.id}
                className="flex items-center gap-4 px-2 py-3 border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors rounded-xl"
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
                  <p className="text-[15px] font-semibold text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-sm text-white/50 truncate">
                    {user.username}
                  </p>
                </div>

                {/* Follow Button */}
                {user.id !== profile?.user_id && (
                  <button
                    onClick={() =>
                      isFollowed ? handleUnfollow(user.id) : handleFollow(user.id)
                    }
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
    </div>
  );
}
