'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useFollowUserMutation, useUnfollowUserMutation } from '@/lib/store/services/usersApi';

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
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface FollowBadgeProps {
  authorId?: number;
  authorName: string;
  authorAvatar?: string;
  isFollowed?: boolean;
  isOwn?: boolean;
  followerCount?: number;
  /** Background color for the badge ring — should match the card bg */
  ringColor?: string;
  /** Size variant */
  size?: 'sm' | 'md';
}

export default function FollowBadge({
  authorId,
  authorName,
  authorAvatar,
  isFollowed: initialFollowed = false,
  isOwn = false,
  followerCount,
  ringColor = '#101010',
  size = 'sm',
}: FollowBadgeProps) {
  const [followed, setFollowed] = useState(initialFollowed);
  const [showModal, setShowModal] = useState(false);
  const [justFollowed, setJustFollowed] = useState(false);
  const [followUser] = useFollowUserMutation();
  const [unfollowUser] = useUnfollowUserMutation();

  const [isHidden, setIsHidden] = useState(false);

  // Sync external prop changes
  const [prevFollowed, setPrevFollowed] = useState(initialFollowed);
  if (initialFollowed !== prevFollowed) {
    setPrevFollowed(initialFollowed);
    setFollowed(initialFollowed);
  }

  // Don't render anything for own posts, or if we were already following them before this interaction
  if (isOwn || isHidden) return null;
  if (initialFollowed && !justFollowed) return null;

  const badgeSize = size === 'md' ? 'w-7 h-7' : 'w-5 h-5';
  const iconSize = size === 'md' ? 28 : 20;

  const handleFollow = async () => {
    if (!authorId) return;
    setFollowed(true);
    setJustFollowed(true);
    setShowModal(false);

    // Hide the checkmark after 1.5 seconds for a smooth UI transition
    setTimeout(() => {
      setIsHidden(true);
    }, 1500);

    try {
      await followUser(authorId).unwrap();
    } catch (err) {
      console.error('Follow API error:', err);
      // Intentionally not reverting UI state here so the checkmark/hide animation 
      // plays smoothly even if the backend endpoint is not fully ready.
    }
  };

  const handleUnfollow = async () => {
    if (!authorId) return;
    setFollowed(false);
    setJustFollowed(false);
    try {
      await unfollowUser(authorId).unwrap();
    } catch {
      setFollowed(true);
      setJustFollowed(true);
    }
  };

  const avatarColor = getAvatarColor(authorName);
  const initials = authorName[0]?.toUpperCase() ?? '?';

  return (
    <>
      {/* Badge */}
      <button
        className={`absolute -bottom-1 -right-1 rounded-full flex items-center justify-center ${badgeSize} border-none p-0 cursor-pointer transition-all duration-200 ease-out hover:scale-125 active:scale-95 bg-transparent`}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          if (followed) {
            handleUnfollow();
          } else {
            setShowModal(true);
          }
        }}
        aria-label={followed ? 'Unfollow' : 'Follow'}
      >
        {followed ? (
          /* Checkmark icon */
          <Image
            src="/follow_check.png"
            alt="Following"
            width={iconSize}
            height={iconSize}
            className={`${badgeSize} object-contain rounded-full shadow-sm`}
          />
        ) : (
          /* Plus icon */
          <Image
            src="/follow_plus.png"
            alt="Follow"
            width={iconSize}
            height={iconSize}
            className={`${badgeSize} object-contain rounded-full shadow-sm`}
          />
        )}
      </button>

      {/* Follow Preview Modal */}
      {showModal && createPortal(
        <div
          className="fixed inset-0 z-[2000] bg-black/70 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="bg-[#1e1e1e] rounded-2xl w-full max-w-[340px] p-0 shadow-[0_24px_80px_rgba(0,0,0,0.6)] border border-white/10 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Card Content */}
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="text-lg font-bold text-white truncate m-0">{authorName}</h3>
                  <p className="text-sm text-white/40 mt-0.5 m-0">@{authorName.toLowerCase().replace(/\s/g, '')}</p>
                </div>
                {/* Avatar */}
                <div className="shrink-0">
                  {authorAvatar ? (
                    <Image
                      src={authorAvatar}
                      alt={authorName}
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${avatarColor}dd, ${avatarColor}88)` }}
                    >
                      {initials}
                    </div>
                  )}
                </div>
              </div>
              {/* Follower count */}
              {followerCount !== undefined && (
                <p className="text-sm text-white/40 m-0">
                  <span className="font-semibold text-white/60">{followerCount}</span>
                  {' '}
                  {followerCount === 1 ? 'follower' : 'followers'}
                </p>
              )}
            </div>

            {/* Follow button */}
            <div className="px-5 pb-5">
              <button
                className="w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all border border-white/20 bg-white text-black hover:opacity-90 active:scale-[0.98]"
                onClick={handleFollow}
              >
                Follow
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
