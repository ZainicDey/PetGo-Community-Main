'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import PetGoLogo from '@/assets/images/Logo_PetGo.png';
import NewThreadModal from './NewThreadModal';
import type { Thread } from './ThreadCard';
import ProfileSwitcher from './ProfileSwitcher';
import { useGetMeQuery } from '@/lib/store/services/usersApi';

/* ── SVG Icons ── */
const HomeOutlineIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 20, height: 20 }}
  >
    <path
      d="M21 10.9229C21 10.0115 20.5856 9.1494 19.874 8.58008L13.5615 3.53028C12.6485 2.79985 11.3515 2.79985 10.4385 3.53028L4.12598 8.58008C3.41436 9.1494 3 10.0115 3 10.9229V18C3 19.6569 4.34315 21 6 21H18C19.6569 21 21 19.6569 21 18V10.9229ZM23 18C23 20.7614 20.7614 23 18 23H6C3.23858 23 1 20.7614 1 18V10.9229C1 9.40394 1.69088 7.96742 2.87695 7.01856L9.18848 1.96876C10.832 0.65397 13.168 0.653969 14.8115 1.96876L21.123 7.01856C22.3091 7.96742 23 9.40394 23 10.9229V18Z"
      fill="currentColor"
    />
  </svg>
);

const HomeFilledIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 20, height: 20 }}
  >
    <path
      d="M9.18887 1.96827C10.8324 0.653482 13.1676 0.65348 14.8111 1.96827L21.1235 7.01815C22.3096 7.96701 23 9.40357 23 10.9225V18C23 20.7614 20.7614 23 18 23H6C3.23858 23 1 20.7614 1 18V10.9225C1 9.40357 1.69045 7.96701 2.87652 7.01815L9.18887 1.96827Z"
      fill="currentColor"
      clipRule="evenodd"
      fillRule="evenodd"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    aria-hidden
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 17, height: 17 }}
  >
    <path
      d="M12 2C12.5523 2 13 2.44772 13 3V11H21C21.5523 11 22 11.4477 22 12C22 12.5523 21.5523 13 21 13H13V21C13 21.5523 12.5523 22 12 22C11.4477 22 11 21.5523 11 21V13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H11V3C11 2.44772 11.4477 2 12 2Z"
      fill="currentColor"
    />
  </svg>
);

const SearchIcon = () => (
  <svg
    aria-label="Search"
    role="img"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 20, height: 20 }}
  >
    <path
      clipRule="evenodd"
      d="M11 1C16.5228 1 21 5.47715 21 11C21 13.2202 20.275 15.2704 19.0508 16.9297L22.5605 20.4395C23.1463 21.0252 23.1463 21.9748 22.5605 22.5605C21.9748 23.1463 21.0252 23.1463 20.4395 22.5605L16.9297 19.0508C15.2704 20.275 13.2202 21 11 21C5.47715 21 1 16.5228 1 11C1 5.47715 5.47715 1 11 1ZM11 4C7.13401 4 4 7.13401 4 11C4 14.866 7.13401 18 11 18C14.866 18 18 14.866 18 11C18 7.13401 14.866 4 11 4Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

/* 
const MessageOutlineIcon = () => (
  <svg
    aria-label="Messages"
    role="img"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 20, height: 20 }}
  >
    <path
      clipRule="evenodd"
      d="M7.24745 1.49856C4.18329 -0.187009 0.600309 2.64312 1.53043 6.01434L3.18186 12L1.53043 17.9857C0.600324 21.3569 4.18329 24.1871 7.24745 22.5015L20.8245 15.0329C23.2153 13.7177 23.2153 10.2823 20.8244 8.96715L7.24745 1.49856ZM3.4584 5.48242C2.99878 3.81652 4.76932 2.41799 6.2835 3.25092L19.8605 10.7195C20.0016 10.7971 20.123 10.8923 20.2247 11H4.98069L3.4584 5.48242ZM4.98069 13L3.4584 18.5176C2.99878 20.1835 4.76932 21.5821 6.2835 20.7491L19.8605 13.2805C20.0016 13.2029 20.123 13.1078 20.2247 13H4.98069Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const MessageFilledIcon = () => (
  <svg
    aria-label="Messages"
    role="img"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 20, height: 20 }}
  >
    <path
      d="M5.85195 21.4694L19.3245 14.0577C20.3799 13.477 21.1437 12.4247 21.2273 11.2231C21.3235 9.84073 20.6427 8.59809 19.4491 7.94169L5.99304 0.539493C4.62004 -0.215795 2.90086 -0.199435 1.63504 0.724303C0.58005 1.49419 0 2.65449 0 3.88663C0 4.24341 0.0481501 4.60548 0.1483 4.96612L1.33112 9.25543C1.44906 9.68303 1.83808 9.97933 2.28172 9.97933H14.3338C14.8788 9.97933 15.3199 10.4208 15.3199 10.9654C15.3199 11.5099 14.8788 11.9515 14.3338 11.9515H2.28172C1.83808 11.9515 1.44906 12.2477 1.33112 12.6754L0.19476 16.7962C-0.22893 18.3326 0.20275 20.0322 1.43072 21.0482C2.70569 22.103 4.40849 22.2628 5.85195 21.4694Z"
      fill="currentColor"
    />
  </svg>
);
*/

const ActivityOutlineIcon = () => (
  <svg
    aria-label="Notifications"
    role="img"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 20, height: 20 }}
  >
    <path
      d="M16.5 2C14.8335 2 13.2217 2.70703 12 3.93652C10.7783 2.70704 9.1665 2 7.5 2C3.3785 2 0.5 5.08423 0.5 9.5C0.5 14.1284 4.84516 19.4619 11.311 22.7719C11.5267 22.8827 11.7633 22.9379 12 22.9379C12.2367 22.9379 12.4733 22.8827 12.689 22.7719C19.1548 19.4619 23.5 14.1284 23.5 9.5C23.5 5.08423 20.6217 2 16.5 2ZM12 20.8764C6.30767 17.8962 2.5 13.3467 2.5 9.5C2.5 6.15893 4.4625 4 7.5 4C9.5 4 11.25 5.75 12 7.5C12.75 5.75 14.5 4 16.5 4C19.5377 4 21.5 6.15893 21.5 9.5C21.5 13.3467 17.6923 17.8962 12 20.8764Z"
      fill="currentColor"
    />
  </svg>
);

const ActivityFilledIcon = () => (
  <svg
    aria-label="Notifications"
    role="img"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 20, height: 20 }}
  >
    <path
      d="M16.5 2C14.8335 2 13.2217 2.70703 12 3.93652C10.7783 2.70704 9.1665 2 7.5 2C3.3785 2 0.5 5.08423 0.5 9.5C0.5 14.1284 4.84516 19.4619 11.311 22.7719C11.5267 22.8827 11.7633 22.9379 12 22.9379C12.2367 22.9379 12.4733 22.8827 12.689 22.7719C19.1548 19.4619 23.5 14.1284 23.5 9.5C23.5 5.08423 20.6217 2 16.5 2Z"
      fill="currentColor"
    />
  </svg>
);

/* 
const ProfileOutlineIcon = () => (
  <svg
    aria-label="Profile"
    role="img"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 20, height: 20 }}
  >
    <path
      d="M11.9997 1C15.0373 1 17.4997 3.46244 17.4997 6.5C17.4997 9.53756 15.0373 12 11.9997 12C8.9622 11.9998 6.49967 9.53745 6.49967 6.5C6.49967 3.46255 8.9622 1.00018 11.9997 1ZM11.9997 3C10.0668 3.00018 8.49967 4.56711 8.49967 6.5C8.49967 8.43289 10.0668 9.99982 11.9997 10C13.9327 10 15.4997 8.433 15.4997 6.5C15.4997 4.567 13.9327 3 11.9997 3Z"
      fill="currentColor"
      clipRule="evenodd"
      fillRule="evenodd"
    />
    <path
      d="M11.9997 14C16.9121 14 21.0591 17.2609 22.4538 21.7002C22.6193 22.2271 22.3263 22.7886 21.7995 22.9541C21.2727 23.1194 20.7111 22.8266 20.5456 22.2998C19.4022 18.6603 16.0038 16 11.9997 16C7.99569 16.0001 4.5971 18.6603 3.45377 22.2998C3.28818 22.8266 2.72671 23.1196 2.19986 22.9541C1.67323 22.7884 1.38015 22.2269 1.54557 21.7002C2.94019 17.2609 7.0873 14.0001 11.9997 14Z"
      fill="currentColor"
    />
  </svg>
);

const ProfileFilledIcon = () => (
  <svg
    aria-label="Profile"
    role="img"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: 20, height: 20 }}
  >
    <path
      d="M11.9999 1C15.0375 1 17.4999 3.46243 17.4999 6.5C17.4999 9.53757 15.0375 12 11.9999 12C8.96239 12 6.49992 9.53754 6.49992 6.5C6.49992 3.46246 8.96239 1.00005 11.9999 1Z"
      fill="currentColor"
    />
    <path
      d="M11.9999 14C16.3825 14 20.1557 16.5961 21.9081 20.3047C22.5576 21.6792 21.432 23 20.1376 23H3.86223C2.56787 22.9999 1.44225 21.6792 2.09172 20.3047C3.84408 16.5961 7.61734 14 11.9999 14Z"
      fill="currentColor"
    />
  </svg>
);
*/

const navItems = [
  {
    id: 'home',
    label: 'For you',
    href: '/',
    OutlineIcon: HomeOutlineIcon,
    FilledIcon: HomeFilledIcon,
  },
  {
    id: 'search',
    label: 'Search',
    href: '/community/search',
    OutlineIcon: SearchIcon,
    FilledIcon: SearchIcon,
  },
  /* {
    id: 'messages',
    label: 'Messages',
    href: '/community/messages',
    OutlineIcon: MessageOutlineIcon,
    FilledIcon: MessageFilledIcon,
  }, */
  {
    id: 'activity',
    label: 'Activity',
    href: '/community/activity',
    OutlineIcon: ActivityOutlineIcon,
    FilledIcon: ActivityFilledIcon,
  },
  /* {
    id: 'profile',
    label: 'Profile',
    href: '/community/profile',
    OutlineIcon: ProfileOutlineIcon,
    FilledIcon: ProfileFilledIcon,
  }, */
];

interface CommunityLayoutProps {
  children: React.ReactNode;
}

const navBtnBaseClass =
  'flex flex-col sm:flex-row items-center justify-center lg:justify-start lg:pl-2 gap-0.5 sm:gap-0 lg:gap-2.5 rounded-md sm:rounded-lg transition-all hover:bg-white/10 hover:text-[#ffe1bd] sm:hover:translate-x-0.5 select-none cursor-pointer bg-transparent border-none font-inherit mx-auto lg:mx-0 p-1 sm:p-0';

export default function CommunityLayout({ children }: CommunityLayoutProps) {
  const [showNewThread, setShowNewThread] = useState(false);
  const [quoteThread, setQuoteThread] = useState<Thread | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  useGetMeQuery();

  const isOnActivityRoute = pathname?.startsWith('/community/activity') ?? false;
  const [activityExpanded, setActivityExpanded] = useState(isOnActivityRoute);
  const [showMobileActivityMenu, setShowMobileActivityMenu] = useState(false);

  /* Derive active nav from current pathname */
  const activeNav = pathname?.startsWith('/community/profile')
    ? 'profile'
    : pathname?.startsWith('/community/search')
      ? 'search'
      : pathname?.startsWith('/community/activity')
        ? 'activity'
        : 'home';

  /* Derive active activity sub-route */
  const activeActivitySub = pathname === '/community/activity/liked'
    ? 'liked'
    : pathname === '/community/activity/following'
      ? 'following'
      : pathname === '/community/activity'
        ? 'myactivity'
        : null;

  /* Keep activity expanded when navigating between sub-routes */
  const [prevOnActivity, setPrevOnActivity] = useState(isOnActivityRoute);
  if (isOnActivityRoute && !prevOnActivity) {
    setPrevOnActivity(true);
    setActivityExpanded(true);
  } else if (!isOnActivityRoute && prevOnActivity) {
    setPrevOnActivity(false);
  }

  React.useEffect(() => {
    const handleOpenModal = () => setShowNewThread(true);
    const handleOpenQuote = (e: Event) => {
      const detail = (e as CustomEvent<{ thread: Thread }>).detail;
      if (detail?.thread) {
        setQuoteThread(detail.thread);
        setShowNewThread(true);
      }
    };
    window.addEventListener('community-open-new-thread', handleOpenModal);
    window.addEventListener('community-open-quote-thread', handleOpenQuote);
    return () => {
      window.removeEventListener('community-open-new-thread', handleOpenModal);
      window.removeEventListener('community-open-quote-thread', handleOpenQuote);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[1000] flex bg-[#101010] text-white font-open-sans flex-col sm:flex-row">
      {/* ── Left Sidebar ── */}
      <aside className="w-full sm:w-[80px] lg:w-[260px] sm:ml-1 sm:min-w-[80px] lg:min-w-[260px] h-auto sm:h-screen flex flex-row sm:flex-col pt-0 sm:pt-4 px-1 sm:px-2 lg:px-3 pb-1 sm:pb-6 border-t sm:border-t-0 border-white/10 bg-[#101010] order-2 sm:order-1 fixed sm:static bottom-0 left-0 right-0 z-[100] sm:z-auto overflow-y-visible sm:overflow-y-auto scrollbar-hide">
        {/* Logo */}
        <div className="hidden sm:flex lg:pb-2.5 justify-center lg:justify-start">
          <Link
            href="/"
            className="inline-flex items-center hover:opacity-75 transition-opacity"
            aria-label="PetGo Home"
          >
            <Image
              src={PetGoLogo}
              alt="PetGo"
              width={100}
              height={32}
              className="hidden lg:block select-none pl-2"
              priority
            />
            <span className="text-2xl lg:hidden">🐾</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-row sm:flex-col w-full sm:w-auto justify-around sm:justify-start gap-0 sm:gap-0 sm:mt-5">
          {/* For You (Home) */}
          {navItems.slice(0, 1).map((item) => {
            const isActive = activeNav === item.id;
            const Icon = isActive ? item.FilledIcon : item.OutlineIcon;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`${navBtnBaseClass} ${isActive ? 'text-[#ffe1bd] font-semibold bg-white/10' : 'text-white font-normal'}`}
                style={{
                  width: 'var(--nav-btn-width)',
                  height: 'var(--nav-btn-height)',
                  fontSize: 'var(--nav-btn-font-size)',
                }}
                id={`community-nav-${item.id}`}
              >
                <span className="flex items-center justify-center shrink-0 w-[22px] h-[22px]">
                  <Icon />
                </span>
                <span className="block sm:hidden lg:block leading-none tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* New Thread button */}
          <button
            id="community-new-thread-btn"
            className={`${navBtnBaseClass} text-white`}
            style={{
              width: 'var(--nav-btn-width)',
              height: 'var(--nav-btn-height)',
              fontSize: 'var(--nav-btn-font-size)',
            }}
            onClick={() => setShowNewThread(true)}
            aria-label="Create new thread"
          >
            <span className="flex items-center justify-center shrink-0 w-[22px] h-[22px]">
              <PlusIcon />
            </span>
            <span className="block sm:hidden lg:block leading-none tracking-tight">
              New post
            </span>
          </button>

          {/* Search */}
          {navItems.slice(1, 2).map((item) => {
            const isActive = activeNav === item.id;
            const Icon = isActive ? item.FilledIcon : item.OutlineIcon;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`${navBtnBaseClass} ${isActive ? 'text-[#ffe1bd] font-semibold bg-white/10' : 'text-white font-normal'}`}
                style={{
                  width: 'var(--nav-btn-width)',
                  height: 'var(--nav-btn-height)',
                  fontSize: 'var(--nav-btn-font-size)',
                }}
                id={`community-nav-${item.id}`}
              >
                <span className="flex items-center justify-center shrink-0 w-[22px] h-[22px]">
                  <Icon />
                </span>
                <span className="block sm:hidden lg:block leading-none tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Activity section with expandable sub-items */}
          <div className="contents sm:block sm:mt-6">
            {/* Desktop: Activity toggle button */}
            <button
              className={`hidden sm:flex ${navBtnBaseClass} ${activeNav === 'activity' ? 'text-[#ffe1bd] font-semibold bg-white/10' : 'text-white font-normal'}`}
              style={{
                width: 'var(--nav-btn-width)',
                height: 'var(--nav-btn-height)',
                fontSize: 'var(--nav-btn-font-size)',
              }}
              id="community-nav-activity"
              onClick={() => setActivityExpanded((prev) => !prev)}
            >
              <span className="flex items-center justify-center shrink-0 w-[22px] h-[22px]">
                {activeNav === 'activity' ? <ActivityFilledIcon /> : <ActivityOutlineIcon />}
              </span>
              <span className="hidden lg:flex items-center gap-1.5 leading-none tracking-tight">
                Activity
                <svg
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  className={`w-2.5 h-2.5 transition-transform duration-200 ${activityExpanded ? 'rotate-180' : ''}`}
                >
                  <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>

            {/* Desktop: Sub-items (expandable) */}
            <div
              className={`hidden sm:block overflow-hidden transition-all duration-300 ease-out ${
                activityExpanded ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="lg:pl-5 flex flex-col gap-0 mt-0.5">
                {[
                  { id: 'myactivity', label: 'My Activity', href: '/community/activity', icon: '📋' },
                  { id: 'liked', label: 'Liked', href: '/community/activity/liked', icon: '❤️' },
                  { id: 'following', label: 'Following', href: '/community/activity/following', icon: '👥' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => router.push(sub.href)}
                    className={`flex items-center gap-2.5 px-2 lg:px-3 py-2 rounded-lg transition-all text-sm bg-transparent border-none cursor-pointer font-inherit ${
                      activeActivitySub === sub.id
                        ? 'text-[#ffe1bd] font-semibold bg-white/10'
                        : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-sm w-[18px] text-center">{sub.icon}</span>
                    <span className="hidden lg:block leading-none">{sub.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile: Activity button that opens sub-menu */}
            <button
              className={`sm:hidden ${navBtnBaseClass} ${activeNav === 'activity' ? 'text-[#ffe1bd] font-semibold bg-white/10' : 'text-white font-normal'}`}
              style={{
                width: 'var(--nav-btn-width)',
                height: 'var(--nav-btn-height)',
                fontSize: 'var(--nav-btn-font-size)',
              }}
              onClick={() => setShowMobileActivityMenu(true)}
            >
              <span className="flex items-center justify-center shrink-0 w-[22px] h-[22px]">
                {activeNav === 'activity' ? <ActivityFilledIcon /> : <ActivityOutlineIcon />}
              </span>
              <span className="block sm:hidden leading-none tracking-tight">
                Activity
              </span>
            </button>

            {/* Mobile Profile Switcher in the nav row */}
            <div className="contents sm:hidden">
              <ProfileSwitcher isMobile />
            </div>
          </div>

          {/* Mobile Activity Sub-Menu (slide-up sheet) */}
          {showMobileActivityMenu && (
            <div
              className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 sm:hidden"
              onClick={() => setShowMobileActivityMenu(false)}
            >
              <div
                className="absolute bottom-[70px] left-0 right-0 bg-[#1a1a1a] rounded-t-2xl border-t border-white/10 p-4 pb-2 animate-in slide-in-from-bottom-4 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                <h3 className="text-base font-semibold text-white px-1 mb-3">Activity</h3>
                {[
                  { id: 'myactivity', label: 'My Activity', href: '/community/activity', icon: '📋' },
                  { id: 'liked', label: 'Liked', href: '/community/activity/liked', icon: '❤️' },
                  { id: 'following', label: 'Following', href: '/community/activity/following', icon: '👥' },
                ].map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      router.push(sub.href);
                      setShowMobileActivityMenu(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all text-[15px] bg-transparent border-none cursor-pointer font-inherit ${
                      activeActivitySub === sub.id
                        ? 'text-[#ffe1bd] font-semibold bg-white/10'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg">{sub.icon}</span>
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* ── Profile Switcher (bottom of sidebar) ── */}
        <ProfileSwitcher />
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 h-[calc(100vh-70px)] sm:h-screen overflow-y-auto order-1 sm:order-2 scrollbar-hide">
        {children}
      </main>

      {/* ── Right Spacer to center the feed on the screen ── */}
      <div className="hidden sm:block lg:hidden xl:block sm:w-[80px] sm:min-w-[80px] xl:w-[260px] xl:min-w-[260px] order-3 pointer-events-none" />

      {/* ── New Thread Modal ── */}
      {showNewThread && (
        <NewThreadModal
          onClose={() => {
            setShowNewThread(false);
            setQuoteThread(null);
          }}
          onPost={(text, files) => {
            window.dispatchEvent(new CustomEvent('community-new-post', {
              detail: {
                text,
                files,
                quoted_post_id: quoteThread ? Number(quoteThread.id) : undefined,
              },
            }));
            setQuoteThread(null);
          }}
          quotedThread={quoteThread ?? undefined}
        />
      )}
    </div>
  );
}
