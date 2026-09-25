'use client';

import React, { useState } from 'react';
import { PawPrint, Camera, Loader2 } from 'lucide-react';
import ThreadCard, { type Thread } from './ThreadCard';
import ThreadFeedSkeleton from './ThreadSkeleton';
import FollowersModal from './FollowersModal';
import EditProfileModal from './EditProfileModal';
import CreatePetProfileModal from './CreatePetProfileModal';
import { useGetProfileQuery, useGetUserPostsQuery, useGetUserRepostsQuery, useGetUserSavedPostsQuery, useUpdateProfileMutation } from '@/lib/store/services/usersApi';
import type { ApiPost, ApiProfile } from '@/lib/store/types';

type ProfileTab = 'posts' | 'reposts' | 'saved';

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

  const isOwnPost = profile && post.author_id === profile.user_id;

  // Use author info from API, or fallback to current profile info
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
    reposted: isRepost ? true : post.is_reposted,
    isSaved: post.is_saved,
    repostedBy: isRepost && profile ? profile.username : post.reposter?.username,
    quotedPost: post.quoted_post
      ? mapApiPostToThread(post.quoted_post, profile)
      : undefined,
    isOwn: !!isOwnPost,
    authorId: post.author?.id ?? profile?.user_id,
    isFollowed: post.author?.is_followed,
    followerCount: post.author?.follower_count,
    isPetProfile: post.author?.profile_type === 'pet' || profile?.profile_type === 'pet',
    petType: post.author?.pet_type || profile?.pet_type,
  };
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [showFollowers, setShowFollowers] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showCreatePet, setShowCreatePet] = useState(false);
  const [isUploadingPfp, setIsUploadingPfp] = useState(false);

  const {
    data: profile,
    isLoading: profileLoading,
  } = useGetProfileQuery();

  const [updateProfile] = useUpdateProfileMutation();

  const handleQuickPfpUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'petgo_preset';

    if (!cloudName) {
      alert('Cloudinary is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to .env.local.');
      return;
    }

    setIsUploadingPfp(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData },
      );

      if (!uploadRes.ok) throw new Error('Failed to upload image');

      const uploadData = await uploadRes.json();
      
      await updateProfile({ profile_picture_url: uploadData.secure_url }).unwrap();
    } catch (err) {
      console.error('Quick PFP upload error:', err);
      alert('Failed to update profile picture. Please try again.');
    } finally {
      setIsUploadingPfp(false);
      e.target.value = '';
    }
  };

  const { data: myPosts = [], isLoading: isPostsLoading } = useGetUserPostsQuery(
    profile?.user_id ?? 0,
    { skip: !profile?.user_id },
  );
  const { data: reposts = [], isLoading: isRepostsLoading } = useGetUserRepostsQuery(
    profile?.user_id ?? 0,
    { skip: !profile?.user_id },
  );
  const { data: saved = [], isLoading: isSavedLoading } = useGetUserSavedPostsQuery(
    profile?.user_id ?? 0,
    { skip: !profile?.user_id },
  );

  const postsAsThreads = myPosts.map((p) => mapApiPostToThread(p, profile, false));
  const repostsAsThreads = reposts.map((p) => mapApiPostToThread(p, profile, true));
  const savedAsThreads = saved.map((p) => mapApiPostToThread(p, profile, false));

  const currentList =
    activeTab === 'posts' ? postsAsThreads : activeTab === 'reposts' ? repostsAsThreads : savedAsThreads;

  const isListLoading = activeTab === 'posts' ? isPostsLoading : activeTab === 'reposts' ? isRepostsLoading : isSavedLoading;

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

  if (!profile) {
    return (
      <div className="max-w-[620px] mx-auto py-16 px-4 text-center text-white/40">
        <p className="text-lg">Profile not found</p>
        <p className="text-sm mt-2">Please complete your profile setup first.</p>
      </div>
    );
  }

  const avatarBg = getAvatarColor(profile.username);
  const initials = profile.username[0]?.toUpperCase() || '?';

  return (
    <>
      <div className="max-w-[620px] mx-auto py-6 px-4">
        {/* ── Profile Header ── */}
        <div className="border border-white/10 rounded-2xl bg-[#181818] p-5 mb-4">
          {/* Top row: name + avatar */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0 mr-4">
              <h1 className="text-2xl font-bold text-white truncate">
                {profile.username}
              </h1>
              <p className="text-sm text-white/50 mt-0.5">
                @{profile.username}
              </p>
            </div>
            <div className="relative shrink-0">
              <div
                className="w-[76px] h-[76px] rounded-full overflow-hidden border-2 border-white/10 flex items-center justify-center"
                style={
                  !profile.profile_picture_url
                    ? { backgroundColor: avatarBg }
                    : undefined
                }
              >
                {profile.profile_picture_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {initials}
                  </span>
                )}
              </div>
              <label 
                htmlFor="profile-picture-upload-quick"
                className="absolute bottom-0 right-0 w-7 h-7 bg-[#282828] border border-white/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors shadow-md"
                title="Change Profile Picture"
              >
                {isUploadingPfp ? (
                  <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-white" />
                )}
                <input
                  id="profile-picture-upload-quick"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleQuickPfpUpload}
                  disabled={isUploadingPfp}
                />
              </label>
            </div>
          </div>

          {/* Follower count — clickable */}
          <button
            onClick={() => setShowFollowers(true)}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/60 transition-colors cursor-pointer bg-transparent border-none p-0 mb-4"
          >
            <span className="font-semibold text-white/60">
              {profile.follower_count ?? 0}
            </span>
            <span>
              {(profile.follower_count ?? 0) === 1
                ? 'follower'
                : 'followers'}
            </span>
          </button>

          {/* Edit Profile button */}
          <button
            onClick={() => setShowEditProfile(true)}
            className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border border-white/20 bg-transparent text-white hover:bg-white/5 active:scale-[0.98]"
            id="profile-edit-btn"
          >
            Edit profile
          </button>

          {/* Create Pet Profile — only visible for owner (user) profiles */}
          {profile.profile_type?.toLowerCase() !== 'pet' && (
            <button
              onClick={() => setShowCreatePet(true)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border border-[#F7941D]/30 bg-transparent text-[#F7941D] hover:bg-[#F7941D]/5 active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
              id="profile-create-pet-btn"
            >
              <PawPrint className="w-4 h-4" />
              Create Pet Profile
            </button>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex relative border-b border-white/10 mb-0">
          {(['posts', 'reposts', 'saved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center text-sm font-semibold transition-colors cursor-pointer bg-transparent border-none ${activeTab === tab
                  ? 'text-white'
                  : 'text-white/40 hover:text-white/60'
                }`}
            >
              {tab === 'posts' ? 'Posts' : tab === 'reposts' ? 'Reposts' : 'Saved'}
            </button>
          ))}
          {/* Animated bottom border */}
          <div
            className="absolute bottom-0 w-1/3 h-full pointer-events-none transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
            style={{
              transform: activeTab === 'posts' ? 'translateX(0%)' : activeTab === 'reposts' ? 'translateX(100%)' : 'translateX(200%)',
            }}
          >
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-white rounded-t-full" />
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
          userId={profile.user_id}
          followerCount={profile.follower_count ?? 0}
          onClose={() => setShowFollowers(false)}
        />
      )}

      {showEditProfile && (
        <EditProfileModal onClose={() => setShowEditProfile(false)} />
      )}

      {showCreatePet && (
        <CreatePetProfileModal onClose={() => setShowCreatePet(false)} />
      )}
    </>
  );
}
