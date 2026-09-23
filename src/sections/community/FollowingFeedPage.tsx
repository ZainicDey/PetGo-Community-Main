'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useGetMeQuery, useGetFollowingQuery, useFollowUserMutation, useUnfollowUserMutation } from '@/lib/store/services/usersApi';
import type { UserBasicInfo } from '@/lib/store/types';

const AVATAR_COLORS = [
  '#f7941d', '#e05c97', '#6ec6e6', '#b8d84e', '#c490d1',
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function UserCard({ user, isOwnId }: { user: UserBasicInfo; isOwnId: boolean }) {
  const router = useRouter();
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();
  const [isFollowed, setIsFollowed] = React.useState(true); // They're in our following list

  const initials = user.username[0]?.toUpperCase() ?? '?';
  const color = getAvatarColor(user.username);

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isFollowed) {
        setIsFollowed(false);
        await unfollowUser(user.id).unwrap();
      } else {
        setIsFollowed(true);
        await followUser(user.id).unwrap();
      }
    } catch {
      setIsFollowed(!isFollowed);
    }
  };

  return (
    <div
      className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
      onClick={() => {
        if (isOwnId) {
          router.push('/community/profile');
        } else {
          router.push(`/community/user/${user.id}`);
        }
      }}
    >
      {/* Avatar */}
      {user.profile_picture_url ? (
        <Image
          src={user.profile_picture_url}
          alt={user.username}
          width={44}
          height={44}
          className="w-11 h-11 rounded-full object-cover shrink-0"
        />
      ) : (
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
          style={{ background: `linear-gradient(135deg, ${color}dd, ${color}88)` }}
        >
          {initials}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-white truncate m-0">{user.username}</p>
        <p className="text-[13px] text-white/40 truncate m-0">@{user.username.toLowerCase().replace(/\s/g, '')}</p>
      </div>

      {/* Follow/Unfollow button */}
      {!isOwnId && (
        <button
          className={`shrink-0 px-4 py-1.5 text-[13px] font-semibold rounded-full border transition-all duration-200 ${
            isFollowed
              ? 'bg-transparent border-white/20 text-white/60 hover:border-red-400/50 hover:text-red-400 hover:bg-red-400/5'
              : 'bg-white text-[#101010] border-white hover:bg-white/90'
          }`}
          onClick={handleToggleFollow}
        >
          {isFollowed ? 'Following' : 'Follow'}
        </button>
      )}
    </div>
  );
}

export default function FollowingFeedPage() {
  const { data: me } = useGetMeQuery();
  const { data: following, isLoading, isError } = useGetFollowingQuery(me?.id as number, {
    skip: !me?.id,
  });

  return (
    <div className="max-w-[680px] mx-auto pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#101010]/80 backdrop-blur-xl border-b border-white/5 px-5 py-4">
        <h1 className="text-xl font-bold text-white m-0">Following</h1>
        <p className="text-sm text-white/40 mt-0.5 m-0">
          {following ? `${following.length} user${following.length !== 1 ? 's' : ''}` : 'People you follow'}
        </p>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 animate-pulse"
            >
              <div className="w-11 h-11 rounded-full bg-white/10 shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-4 bg-white/10 rounded w-1/3" />
                <div className="h-3 bg-white/10 rounded w-1/5" />
              </div>
              <div className="w-[90px] h-[32px] rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-white/40">Failed to load following list</div>
      ) : !following || following.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-lg font-semibold text-white/70 mb-2">Not following anyone yet</h3>
          <p className="text-sm text-white/40 max-w-[300px]">
            When you follow someone, they&apos;ll appear here. Explore the feed to find people to follow!
          </p>
        </div>
      ) : (
        <div>
          {following.map((user) => (
            <UserCard key={user.id} user={user} isOwnId={user.id === me?.id} />
          ))}
        </div>
      )}
    </div>
  );
}
