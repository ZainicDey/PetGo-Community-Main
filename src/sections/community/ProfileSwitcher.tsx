'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronUp, UserCircle, ArrowLeftRight } from 'lucide-react';
import {
  useGetProfileQuery,
  useGetSwitchableProfilesQuery,
  useSwitchProfileMutation,
} from '@/lib/store/services/usersApi';
import { api } from '@/lib/store/services/api';
import { setToken } from '@/lib/store/slices/authSlice';
import { useAppDispatch } from '@/lib/store/hooks';

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

export default function ProfileSwitcher({ className, isMobile }: { className?: string, isMobile?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfiles, setShowProfiles] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: profile } = useGetProfileQuery();
  const { data: switchableData } = useGetSwitchableProfilesQuery();
  const [switchProfile] = useSwitchProfileMutation();

  /* Close popover on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowProfiles(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSwitch = async (targetUserId: number) => {
    setIsSwitching(true);
    try {
      const result = await switchProfile({ target_user_id: targetUserId }).unwrap();
      dispatch(setToken(result.access_token));
      dispatch(api.util.resetApiState());
      setIsOpen(false);
      setShowProfiles(false);
      router.push('/');
    } catch (err) {
      console.error('Failed to switch profile:', err);
    } finally {
      setIsSwitching(false);
    }
  };

  if (!profile) return null;

  const avatarBg = getAvatarColor(profile.username);
  const initials = profile.username[0]?.toUpperCase() || '?';

  const otherProfiles =
    switchableData?.profiles.filter(
      (p) => p.user_id !== switchableData.active_profile_id,
    ) ?? [];

  const hasOtherProfiles = otherProfiles.length > 0;

  const defaultClassName = isMobile ? 'relative' : 'relative hidden sm:block mt-auto pt-4 pb-2';

  return (
    <div className={className || defaultClassName}>
      {/* ── Popover ── */}
      {isOpen && (
        <div
          ref={popoverRef}
          className={`absolute ${isMobile ? 'bottom-[calc(100%+10px)] right-0 mb-2 w-[220px]' : 'bottom-full left-1 lg:left-0 mb-2 w-[220px] lg:w-[240px]'} bg-[#1c1919] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/40 z-[1000]`}
          style={{ animation: 'fadeInUp 150ms ease-out' }}
        >
          {/* Main menu */}
          {!showProfiles ? (
            <div className="py-1.5">
              {/* My Profile */}
              <button
                id="profile-switcher-my-profile"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/community/profile');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left"
              >
                <UserCircle className="w-[18px] h-[18px] text-white/50" />
                <span>My Profile</span>
              </button>

              {/* Switch Account */}
              <button
                id="profile-switcher-switch-account"
                onClick={() => setShowProfiles(true)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-white/80 hover:bg-white/5 hover:text-white transition-colors cursor-pointer bg-transparent border-none text-left"
              >
                <span className="flex items-center gap-3">
                  <ArrowLeftRight className="w-[18px] h-[18px] text-white/50" />
                  <span>Switch Account</span>
                </span>
                {hasOtherProfiles && (
                  <ChevronUp className="w-4 h-4 text-white/30 rotate-90" />
                )}
              </button>
            </div>
          ) : (
            /* ── Profile list ── */
            <div className="py-1.5">
              {/* Back button */}
              <button
                onClick={() => setShowProfiles(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer bg-transparent border-none text-left"
              >
                <ChevronUp className="w-3.5 h-3.5 -rotate-90" />
                <span>Back</span>
              </button>

              <div className="border-t border-white/5 my-1" />

              {otherProfiles.length === 0 ? (
                <div className="px-4 py-4 text-center">
                  <p className="text-xs text-white/30">No other profiles</p>
                  <p className="text-xs text-white/20 mt-1">
                    Create a pet profile from your profile page
                  </p>
                </div>
              ) : (
                otherProfiles.map((p) => {
                  const bg = getAvatarColor(p.username);
                  const initial = p.username[0]?.toUpperCase() || '?';
                  return (
                    <button
                      key={p.user_id}
                      onClick={() => handleSwitch(p.user_id)}
                      disabled={isSwitching}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none text-left disabled:opacity-50"
                    >
                      {/* Avatar */}
                      <div
                        className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center border border-white/10"
                        style={
                          !p.profile_picture_url
                            ? { backgroundColor: bg }
                            : undefined
                        }
                      >
                        {p.profile_picture_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={p.profile_picture_url}
                            alt={p.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-bold text-white">
                            {initial}
                          </span>
                        )}
                      </div>

                      {/* Name + badge */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-white/90 font-medium truncate">
                            {p.username}
                          </span>
                          {p.profile_type === 'pet' && (
                            <span className="text-xs" title="Pet profile">
                              🐾
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-white/30">
                          {p.is_owner ? 'Owner' : 'Pet profile'}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Trigger button ── */}
      <button
        ref={triggerRef}
        id={`profile-switcher-trigger${isMobile ? '-mobile' : ''}`}
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (isOpen) setShowProfiles(false);
        }}
        className={isMobile 
          ? "flex flex-col items-center justify-center gap-0.5 rounded-md transition-all hover:bg-white/10 hover:text-[#ffe1bd] select-none cursor-pointer bg-transparent border-none font-inherit mx-auto p-1"
          : "w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer bg-transparent border-none group"}
        style={isMobile ? { width: 'var(--nav-btn-width)', height: 'var(--nav-btn-height)', fontSize: 'var(--nav-btn-font-size)' } : undefined}
      >
        {isMobile ? (
          <>
            <div
              className="w-[22px] h-[22px] rounded-full overflow-hidden shrink-0 flex items-center justify-center"
              style={!profile.profile_picture_url ? { backgroundColor: avatarBg } : undefined}
            >
              {profile.profile_picture_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profile.profile_picture_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-white">{initials}</span>
              )}
            </div>
            <span className="block leading-none tracking-tight text-white font-normal" style={{ fontSize: 'var(--nav-btn-font-size)' }}>
              Profile
            </span>
          </>
        ) : (
          <>
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center border-2 border-white/10 group-hover:border-white/20 transition-colors"
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
                <span className="text-sm font-bold text-white">{initials}</span>
              )}
            </div>

            {/* Username (desktop only) */}
            <span className="hidden lg:block text-sm text-white/70 group-hover:text-white/90 font-medium truncate flex-1 text-left transition-colors">
              {profile.username}
            </span>

            {/* Chevron (desktop only) */}
            <ChevronUp
              className={`hidden lg:block w-4 h-4 text-white/30 group-hover:text-white/50 transition-all ${isOpen ? '' : 'rotate-180'
                }`}
            />
          </>
        )}
      </button>

      {/* Inline animation keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
