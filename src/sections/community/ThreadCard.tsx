'use client';

import React, { useState, useEffect, useSyncExternalStore, startTransition } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';
import {
  useLikePostMutation,
  useUnlikePostMutation,
  useRepostMutation,
  useUndoRepostMutation,
  useDeletePostMutation,
} from '@/lib/store/services/postsApi';
import { useSavePostMutation, useUnsavePostMutation } from '@/lib/store/services/postsApi';
import FollowBadge from './FollowBadge';

const AVATAR_COLORS = [
  '#f7941d',
  '#e05c97',
  '#5c8ae0',
  '#5ce087',
  '#e0c45c',
  '#c45ce0',
  '#5ce0d8',
];

export interface Thread {
  id: string;
  author: string;
  handle: string;
  avatar?: string;
  content: string;
  media?: { url: string; type: string }[];
  likes: number;
  replies: number;
  reposts: number;
  time: string;
  liked?: boolean;
  reposted?: boolean;
  repostedBy?: string;
  quotedPost?: Thread;
  isOwn?: boolean;
  authorId?: number;
  isFollowed?: boolean;
  followerCount?: number;
  isSaved?: boolean;
  isPetProfile?: boolean;
  petType?: string;
}

interface ThreadCardProps {
  thread: Thread;
  index?: number;
  showLine?: boolean;
}

/* ── Action Icons ── */
const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none">
    {filled ? (
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="#e0245e"
      />
    ) : (
      <path
        d="M16.5 3C14.76 3 13.09 3.81 12 5.09 10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
        fill="currentColor"
      />
    )}
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RepostIcon = ({ active }: { active?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M17 1l4 4-4 4" stroke={active ? '#00c37d' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4" stroke={active ? '#00c37d' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 13v2a4 4 0 01-4 4H3" stroke={active ? '#00c37d' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path
      d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <polyline
      points="16 6 12 2 8 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="12"
      y1="2"
      x2="12"
      y2="15"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

/* ── Quoted Post Embed ── */
function QuotedPostEmbed({ post }: { post: Thread }) {
  const router = useRouter();
  const initials = post.author[0]?.toUpperCase() ?? '?';
  const avatarBg = getAvatarColor(post.author);

  return (
    <div
      className="mt-2 mb-2 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        startTransition(() => router.push(`/community/thread/${post.id}`));
      }}
    >
      <div className="px-4 pt-3 pb-1">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className="relative shrink-0 flex">
            {post.avatar ? (
              <Image
                src={post.avatar}
                alt={post.author}
                width={20}
                height={20}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${avatarBg}dd, ${avatarBg}88)`,
                }}
              >
                {initials}
              </div>
            )}
            {!post.isOwn && post.authorId && (
              <div className="absolute -bottom-1 -right-1 scale-75 transform origin-bottom-right">
                <FollowBadge
                  authorId={post.authorId}
                  authorName={post.author}
                  authorAvatar={post.avatar}
                  isFollowed={post.isFollowed}
                  isOwn={post.isOwn}
                  followerCount={post.followerCount}
                  ringColor="transparent"
                />
              </div>
            )}
          </div>
          <span className="text-[13px] font-semibold text-white">{post.author}</span>
          <span className="text-[13px] text-white/35">{post.time}</span>
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-[14px] font-extralight leading-relaxed text-white/85 mb-1 break-words">
            {post.content}
          </p>
        )}
      </div>

      {/* Media thumbnail (first item only) */}
      {post.media && post.media.length > 0 && (
        <div className="px-4 pb-2">
          {post.media[0].type === 'video' ? (
            <video
              src={post.media[0].url}
              className="w-full max-h-[380px] rounded-xl object-cover"
            />
          ) : (
            <Image
              src={post.media[0].url}
              alt="Quoted media"
              width={680}
              height={380}
              unoptimized
              className="w-full max-h-[380px] rounded-xl object-cover"
            />
          )}
        </div>
      )}

      {/* Engagement counts (read-only) */}
      <div className="flex items-center gap-4 px-4 pb-3 pt-0.5">
        <span className="flex items-center gap-1 text-[12px] text-white/45">
          <div className="w-3.5 h-3.5 shrink-0">
            <HeartIcon filled={false} />
          </div>
          {formatCount(post.likes)}
        </span>
        <span className="flex items-center gap-1 text-[12px] text-white/45">
          <div className="w-3.5 h-3.5 shrink-0">
            <CommentIcon />
          </div>
          {formatCount(post.replies)}
        </span>
        <span className="flex items-center gap-1 text-[12px] text-white/45">
          <div className="w-3.5 h-3.5 shrink-0">
            <RepostIcon />
          </div>
          {formatCount(post.reposts)}
        </span>
      </div>
    </div>
  );
}

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ThreadCard({
  thread,
  index = 0,
  showLine = false,
}: ThreadCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(thread.liked ?? false);
  const [likes, setLikes] = useState(thread.likes);
  const [selectedMedia, setSelectedMedia] = useState<{url: string; type: string} | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!api) return;

    const update = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    };

    api.on('select', update);
    api.on('reInit', update);

    const timer = setTimeout(update, 0);

    return () => {
      clearTimeout(timer);
      api.off('select', update);
      api.off('reInit', update);
    };
  }, [api]);

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [repostPost] = useRepostMutation();
  const [undoRepostPost] = useUndoRepostMutation();
  const [deletePost] = useDeletePostMutation();

  const [prevThread, setPrevThread] = useState(thread);
  const [reposted, setReposted] = useState(thread.reposted ?? false);
  const [reposts, setReposts] = useState(thread.reposts);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isSaved, setIsSaved] = useState(thread.isSaved ?? false);
  
  const [savePost] = useSavePostMutation();
  const [unsavePost] = useUnsavePostMutation();

  if (isDeleted) return null;

  if (
    prevThread.liked !== thread.liked ||
    prevThread.likes !== thread.likes ||
    prevThread.reposted !== thread.reposted ||
    prevThread.reposts !== thread.reposts ||
    prevThread.isSaved !== thread.isSaved
  ) {
    setPrevThread(thread);
    setLiked(thread.liked ?? false);
    setLikes(thread.likes);
    setReposted(thread.reposted ?? false);
    setReposts(thread.reposts);
    setIsSaved(thread.isSaved ?? false);
  }

  const handleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikes((l) => (next ? l + 1 : l - 1));

    const numericId = Number(thread.id);
    if (!isNaN(numericId)) {
      if (next) {
        likePost(numericId).catch(() => {
          setLiked(!next);
          setLikes((l) => l - 1);
        });
      } else {
        unlikePost(numericId).catch(() => {
          setLiked(!next);
          setLikes((l) => l + 1);
        });
      }
    }
  };

  const handleRepostToggle = () => {
    const next = !reposted;
    setReposted(next);
    setReposts((r) => (next ? r + 1 : r - 1));

    const numericId = Number(thread.id);
    if (!isNaN(numericId)) {
      if (next) {
        repostPost(numericId).catch(() => {
          setReposted(!next);
          setReposts((r) => r - 1);
        });
      } else {
        undoRepostPost(numericId).catch(() => {
          setReposted(!next);
          setReposts((r) => r + 1);
        });
      }
    }
  };

  const initials = thread.author[0]?.toUpperCase() ?? '?';
  const avatarColor = getAvatarColor(thread.author);
  const animationDelay = `${index * 60}ms`;

  return (
    <article
      className="py-4 px-5 border-b border-white/5 flex flex-col gap-1.5 animate-fade-in-up last:border-b-0"
      style={{ animationDelay }}
      id={`thread-${thread.id}`}
    >
      {thread.repostedBy && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-white/50 pl-[52px] mb-0.5">
          <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-[#00c37d] shrink-0">
            <path d="M17 1l4 4-4 4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 13v2a4 4 0 01-4 4H3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{thread.repostedBy} reposted</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar column */}
        <div className="flex flex-col items-center gap-0 shrink-0">
          <div className="relative flex cursor-pointer" onClick={() => {
            if (thread.isOwn) {
              startTransition(() => router.push('/community/profile'));
            } else if (thread.authorId !== undefined) {
              startTransition(() => router.push(`/community/user/${thread.authorId}`));
            }
          }}>
            {thread.avatar ? (
            <Image
              src={thread.avatar}
              alt={thread.author}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover block"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold text-white shrink-0"
              style={{
                background: `linear-gradient(135deg, ${avatarColor}dd, ${avatarColor}88)`,
              }}
              aria-label={thread.author}
            >
              {initials}
            </div>
          )}
          {!thread.isOwn && (
            <FollowBadge
              authorId={thread.authorId}
              authorName={thread.author}
              authorAvatar={thread.avatar}
              isFollowed={thread.isFollowed}
              isOwn={thread.isOwn}
              followerCount={thread.followerCount}
            />
          )}
        </div>
        {showLine && (
          <div className="w-[2px] flex-1 min-h-[24px] bg-white/10 rounded-sm mt-1.5" />
        )}
      </div>

      {/* Thread body */}
      <div className="flex-1 min-w-0">
        {/* Meta row */}
        <div className="flex items-baseline gap-2 mb-1">
          <span
            className="text-[15px] font-semibold text-white flex items-center gap-1.5 cursor-pointer hover:underline"
            onClick={() => {
              if (thread.isOwn) {
                startTransition(() => router.push('/community/profile'));
              } else if (thread.authorId !== undefined) {
                startTransition(() => router.push(`/community/user/${thread.authorId}`));
              }
            }}
          >
            {thread.author}
            {thread.isPetProfile && (
              <span className="inline-flex items-center justify-center bg-[#d4d4d4] rounded-full w-[15px] h-[15px] relative -top-[0.5px]">
                {thread.petType?.toLowerCase() === 'fish' ? <FishIcon /> : <PawIcon />}
              </span>
            )}
          </span>
          {/* <span className="text-sm text-white/40">@{thread.handle}</span> */}
          <span className="text-[15px] text-white/35">{thread.time}</span>
          <div className="relative ml-auto">
            <button 
              className="bg-transparent border-none text-white/35 cursor-pointer py-0.5 px-1.5 rounded-md text-lg leading-none transition-colors hover:bg-white/10 hover:text-white/70 font-inherit"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              ···
            </button>
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }} 
                />
                <div className="absolute right-0 top-full mt-1 w-32 bg-[#1c1c1c] border border-white/10 rounded-lg shadow-xl z-40 overflow-hidden flex flex-col py-1">
                  {thread.isOwn && (
                    <button 
                      className="text-left px-4 py-2 text-sm text-[#e0245e] hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        const numericId = Number(thread.id);
                        if (!isNaN(numericId)) {
                          setIsDeleted(true);
                          deletePost(numericId).unwrap().catch(() => {
                            setIsDeleted(false);
                          });
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
                  <button 
                    className="text-left px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors border-none bg-transparent cursor-pointer"
                    onClick={async (e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      const numericId = Number(thread.id);
                      if (isNaN(numericId)) return;
                      try {
                        if (isSaved) {
                          setIsSaved(false);
                          await unsavePost(numericId).unwrap();
                        } else {
                          setIsSaved(true);
                          await savePost(numericId).unwrap();
                        }
                      } catch (err) {
                        setIsSaved(!isSaved); // revert on error
                        console.error("Failed to save/unsave post", err);
                      }
                    }}
                  >
                    {isSaved ? 'Unsave post' : 'Save post'}
                  </button>
                  <button 
                    className="text-left px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors border-none bg-transparent cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      alert('Post reported');
                    }}
                  >
                    Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <p
          className="text-base font-extralight leading-relaxed text-white/95 mb-2.5 break-words tracking-wide cursor-pointer hover:text-white transition-colors"
          onClick={() => startTransition(() => router.push(`/community/thread/${thread.id}`))}
        >
          {thread.content}
        </p>

        {/* Quoted post embed */}
        {thread.quotedPost && (
          <QuotedPostEmbed post={thread.quotedPost} />
        )}

        {/* Optional media */}
        {thread.media && thread.media.length > 0 ? (
          <div className="relative group mb-2.5">
            <Carousel
              setApi={setApi}
              opts={{
                align: 'start',
                loop: false,
                dragFree: true,
              }}
              className="w-full select-none cursor-grab active:cursor-grabbing"
            >
              <CarouselContent className="-ml-2">
                {thread.media.map((item, idx) => (
                  <CarouselItem
                    key={idx}
                    className={`pl-2 ${
                      thread.media!.length === 1
                        ? 'basis-full'
                        : 'basis-[75%] sm:basis-[240px]'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <video
                        src={item.url}
                        controls
                        className={`rounded-xl object-cover shrink-0 select-none ${
                          thread.media!.length === 1
                            ? 'w-full max-h-[380px]'
                            : 'w-full h-[320px]'
                        }`}
                      />
                    ) : (
                      <Image
                        src={item.url}
                        alt={`Thread media ${idx + 1}`}
                        width={thread.media!.length === 1 ? 680 : 300}
                        height={thread.media!.length === 1 ? 380 : 400}
                        priority={index < 2}
                        unoptimized
                        draggable={false}
                        onClick={() => {
                          const emblaInstance = api as unknown as {
                            clickAllowed?: () => boolean;
                          };
                          if (
                            emblaInstance?.clickAllowed &&
                            !emblaInstance.clickAllowed()
                          ) {
                            return;
                          }
                          setSelectedMedia(item);
                        }}
                        className={`rounded-xl object-cover shrink-0 select-none ${
                          thread.media!.length === 1
                            ? 'w-full max-h-[380px]'
                            : 'w-full h-[320px]'
                        }`}
                      />
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* Cursor point indicator dots */}
            {count > 1 && (
              <div className="flex justify-center gap-1.5 mt-3 mb-1">
                {Array.from({ length: count }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => api?.scrollTo(idx)}
                    className={`w-1.5 h-1.5 rounded-full p-0 border-none transition-all duration-200 cursor-pointer ${
                      current === idx ? 'bg-[#F7941D] scale-125' : 'bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-1">
          <button
            className={`flex items-center gap-1.5 bg-transparent border-none cursor-pointer py-1 px-1.5 rounded-lg text-sm transition-all font-inherit hover:bg-white/5 ${liked ? 'text-[#e0245e] hover:bg-[#e0245e]/10' : 'text-white/50 hover:text-white/85'}`}
            onClick={handleLike}
            aria-label={liked ? 'Unlike' : 'Like'}
            id={`thread-like-${thread.id}`}
          >
            <div className="w-5 h-5 shrink-0">
              <HeartIcon filled={liked} />
            </div>
            <span className="text-[13px] font-medium">
              {formatCount(likes)}
            </span>
          </button>

          <button
            className="flex items-center gap-1.5 bg-transparent border-none text-white/50 cursor-pointer py-1 px-1.5 rounded-lg text-sm transition-all font-inherit hover:text-white/85 hover:bg-white/5"
            aria-label="Reply"
            id={`thread-reply-${thread.id}`}
            onClick={() => router.push(`/community/thread/${thread.id}`)}
          >
            <div className="w-5 h-5 shrink-0">
              <CommentIcon />
            </div>
            <span className="text-[13px] font-medium">
              {formatCount(thread.replies)}
            </span>
          </button>

          <div className="relative">
            <button
              className={`flex items-center gap-1.5 bg-transparent border-none cursor-pointer py-1 px-1.5 rounded-lg text-sm transition-all font-inherit hover:bg-white/5 ${reposted ? 'text-[#00c37d] hover:bg-[#00c37d]/10' : 'text-white/50 hover:text-white/85'}`}
              onClick={(e) => {
                e.stopPropagation();
                if (reposted) {
                  handleRepostToggle();
                } else {
                  window.dispatchEvent(
                    new CustomEvent('community-open-quote-thread', {
                      detail: { thread: thread.quotedPost ? thread.quotedPost : thread },
                    })
                  );
                }
              }}
              aria-label={reposted ? 'Undo repost' : 'Repost'}
              id={`thread-repost-${thread.id}`}
            >
              <div className="w-5 h-5 shrink-0">
                <RepostIcon active={reposted} />
              </div>
              <span className="text-[13px] font-medium ml-1">
                {formatCount(reposts)}
              </span>
            </button>
          </div>

          <button
            className={`flex items-center gap-1.5 bg-transparent border-none cursor-pointer py-1 px-1.5 rounded-lg text-sm transition-all font-inherit ${copied ? 'text-[#00c37d]' : 'text-white/50 hover:text-white/85 hover:bg-white/5'}`}
            aria-label="Share"
            id={`thread-share-${thread.id}`}
            onClick={(e) => {
              e.stopPropagation();
              const url = `${window.location.origin}/community/thread/${thread.id}`;
              navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }}
          >
            <div className="w-5 h-5 shrink-0 flex items-center justify-center">
              {copied ? (
                <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5">
                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <ShareIcon />
              )}
            </div>
            {copied && <span className="text-[12px] font-medium ml-0.5 animate-fade-in-up">Copied!</span>}
          </button>
        </div>
      </div>
      </div>

      {mounted && selectedMedia && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center cursor-pointer"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 border-none text-white cursor-pointer p-3 rounded-full flex items-center justify-center transition-all z-[10000]"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMedia(null);
            }}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {selectedMedia.type === 'video' ? (
            <video
              src={selectedMedia.url}
              controls
              autoPlay
              className="max-w-[95vw] max-h-[95vh] w-full h-full object-contain cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <Image
              src={selectedMedia.url}
              alt="Media"
              width={1200}
              height={800}
              unoptimized
              className="max-w-[95vw] max-h-[95vh] w-full h-full object-contain cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>,
        document.body
      )}
    </article>
  );
}
