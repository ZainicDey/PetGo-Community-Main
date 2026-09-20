'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Thread } from './ThreadCard';
import {
  useGetPostByIdQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useRepostMutation,
  useUndoRepostMutation,
  useDeletePostMutation,
} from '@/lib/store/services/postsApi';
import {
  useGetCommentsByPostIdQuery,
  useLazyGetCommentRepliesQuery,
  useCreateCommentMutation,
} from '@/lib/store/services/commentsApi';
import { useGetProfileQuery } from '@/lib/store/services/usersApi';
import type { ApiPost, ApiComment, ApiProfile } from '@/lib/store/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

/* ── Avatar helpers ── */
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

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

/** Maps an API post response to the Thread interface for rendering. */
function mapApiPostToThread(post: ApiPost, profile?: ApiProfile): Thread {
  const allMedia = post.media?.map((m) => ({ url: m.url, type: m.media_type })) || [];

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

  return {
    id: String(post.id),
    author: post.author?.username || (isOwnPost ? profile.username : undefined) || `User ${post.author_id}`,
    handle: post.author?.username || (isOwnPost ? profile.username : undefined) || `user${post.author_id}`,
    avatar: post.author?.profile_picture_url || (isOwnPost ? profile.profile_picture_url : undefined),
    content: post.content,
    media: allMedia.length > 0 ? allMedia : undefined,
    likes: post.likes_count ?? 0,
    replies: post.comments_count ?? 0,
    reposts: post.reposts_count ?? 0,
    time: timeStr,
    liked: post.is_liked,
    reposted: post.is_reposted,
    repostedBy: post.reposter?.username,
    quotedPost: post.quoted_post
      ? mapApiPostToThread(post.quoted_post, profile)
      : undefined,
    isOwn: !!isOwnPost,
    authorId: post.author?.id,
    isFollowed: post.author?.is_followed,
    isPetProfile: post.author?.profile_type === 'pet',
  };
}

/* ── Icons ── */
const BackArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HeartIcon = ({ filled }: { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill="none">
    {filled ? (
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#e0245e" />
    ) : (
      <path d="M16.5 3C14.76 3 13.09 3.81 12 5.09 10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z" fill="currentColor" />
    )}
  </svg>
);

const CommentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ImageAttachIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.6" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GifIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.6" />
    <text x="12" y="15" textAnchor="middle" fill="currentColor" fontSize="8" fontWeight="700" fontFamily="sans-serif">GIF</text>
  </svg>
);

const ExpandIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="5" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="12" cy="19" r="1.5" fill="currentColor" />
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

/* ── Relative time helper ── */
function relativeTime(isoDate: string): string {
  const dateString = isoDate.endsWith('Z') ? isoDate : `${isoDate}Z`;
  const created = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return `${diffDays}d`;
  if (diffHours > 0) return `${diffHours}h`;
  if (diffMins > 0) return `${diffMins}m`;
  return 'now';
}


/* ── Single comment row with on-demand reply loading ── */
function CommentItem({
  comment,
  postId,
  index,
  depth = 0,
}: {
  comment: ApiComment;
  postId: number;
  index: number;
  depth?: number;
}) {
  const authorName = comment.author?.username ?? `User ${comment.author_id}`;
  const avatar = comment.author?.profile_picture_url;
  const color = getAvatarColor(authorName);
  const initials = authorName[0]?.toUpperCase() ?? '?';
  const time = relativeTime(comment.created_at);

  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<ApiComment[]>([]);
  const [repliesOffset, setRepliesOffset] = useState(0);
  const [hasMoreReplies, setHasMoreReplies] = useState(true);
  const [localRepliesCount, setLocalRepliesCount] = useState(comment.replies_count);

  // Inline reply state
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');

  const [fetchReplies, { isFetching: isLoadingReplies }] = useLazyGetCommentRepliesQuery();
  const [createComment] = useCreateCommentMutation();

  const REPLIES_LIMIT = 10;

  const handleLoadReplies = async () => {
    try {
      const result = await fetchReplies({
        commentId: comment.id,
        limit: REPLIES_LIMIT,
        offset: repliesOffset,
      }).unwrap();
      setReplies((prev) => [...prev, ...result]);
      setRepliesOffset((prev) => prev + result.length);
      setHasMoreReplies(result.length === REPLIES_LIMIT);
      setShowReplies(true);
    } catch {
      // silently fail
    }
  };

  const handleToggleReplies = () => {
    if (showReplies) {
      setShowReplies(false);
    } else if (replies.length > 0) {
      setShowReplies(true);
    } else {
      handleLoadReplies();
    }
  };

  const handlePostInlineReply = async () => {
    if (!replyText.trim()) return;
    try {
      const newReply = await createComment({
        post_id: postId,
        parent_id: comment.id,
        content: replyText.trim(),
      }).unwrap();
      setReplyText('');
      setShowReplyInput(false);
      setReplies((prev) => [...prev, newReply]);
      setLocalRepliesCount((c) => c + 1);
      setShowReplies(true);
    } catch {
      // Keep the text so the user can retry
    }
  };

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className="flex gap-3 py-4 px-5 border-b border-white/5"
        style={{ paddingLeft: `${20 + depth * 28}px` }}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          {avatar ? (
            <Image
              src={avatar}
              alt={authorName}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${color}dd, ${color}88)` }}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-[14px] font-semibold text-white truncate max-w-[180px]">{authorName}</span>
              <span className="text-[13px] text-white/35">{time}</span>
            </div>
            <button className="bg-transparent border-none text-white/30 cursor-pointer p-1 rounded-md transition-colors hover:bg-white/10 hover:text-white/60">
              <MoreIcon />
            </button>
          </div>

          <p className="text-[14px] font-light leading-relaxed text-white/90 mb-1.5 break-words">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-3.5 mt-0.5">
            <button
              className="flex items-center gap-1.5 bg-transparent border-none text-white/40 cursor-pointer py-0.5 px-1 rounded-md transition-all hover:text-white/70 hover:bg-white/5 font-inherit text-[12px] font-medium"
              onClick={() => setShowReplyInput((prev) => !prev)}
            >
              <div className="w-4 h-4 shrink-0"><CommentIcon /></div>
              <span>Reply</span>
            </button>

            {/* View replies button */}
            {localRepliesCount > 0 && (
              <button
                className="flex items-center gap-1.5 bg-transparent border-none text-white/40 cursor-pointer py-0.5 px-1 rounded-md transition-all hover:text-white/70 hover:bg-white/5 font-inherit text-[12px] font-medium"
                onClick={handleToggleReplies}
                disabled={isLoadingReplies}
              >
                {isLoadingReplies ? (
                  <span className="animate-pulse">Loading...</span>
                ) : showReplies ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M18 15l-6-6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Hide replies</span>
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>View {localRepliesCount} {localRepliesCount === 1 ? 'reply' : 'replies'}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Inline reply input */}
          {showReplyInput && (
            <div className="mt-2.5 flex items-center gap-2.5 bg-white/[0.03] rounded-xl px-3 py-2 border border-white/5">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePostInlineReply(); }}
                placeholder={`Reply to ${authorName}...`}
                className="flex-1 bg-transparent border-none outline-none text-white/90 text-[13px] font-light placeholder:text-white/30 py-0.5"
                autoFocus
              />
              <button
                className="bg-transparent text-white/50 border border-white/15 rounded-full py-1 px-3 text-[12px] font-semibold cursor-pointer transition-all hover:bg-white/10 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-default"
                onClick={handlePostInlineReply}
                disabled={!replyText.trim()}
              >
                Reply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {showReplies && replies.length > 0 && (
        <div>
          {replies.map((reply, replyIdx) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              index={replyIdx}
              depth={depth + 1}
            />
          ))}
          {/* Load more replies */}
          {hasMoreReplies && (
            <div style={{ paddingLeft: `${20 + (depth + 1) * 28}px` }}>
              <button
                className="flex items-center gap-1.5 bg-transparent border-none text-white/40 cursor-pointer py-2 px-1 text-[12px] font-medium transition-all hover:text-white/70 font-inherit"
                onClick={handleLoadReplies}
                disabled={isLoadingReplies}
              >
                {isLoadingReplies ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <span>Load more replies...</span>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ThreadDetailPage — full-page thread view with comments
   ═══════════════════════════════════════════════════════════ */

interface ThreadDetailPageProps {
  threadId: string;
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
        router.push(`/community/thread/${post.id}`);
      }}
    >
      <div className="px-4 pt-3 pb-1">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-1.5">
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
              className="w-full max-h-[200px] rounded-xl object-cover"
            />
          ) : (
            <Image
              src={post.media[0].url}
              alt="Quoted media"
              width={480}
              height={200}
              unoptimized
              className="w-full max-h-[200px] rounded-xl object-cover"
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

export default function ThreadDetailPage({ threadId }: ThreadDetailPageProps) {
  const router = useRouter();
  const numericId = Number(threadId);
  const { data: apiPost, isLoading, isError } = useGetPostByIdQuery(numericId, {
    skip: isNaN(numericId),
  });

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [repostPost] = useRepostMutation();
  const [undoRepostPost] = useUndoRepostMutation();
  const [deletePost] = useDeletePostMutation();

  const { data: profile } = useGetProfileQuery();

  // Map API response to Thread shape for rendering
  const thread: Thread | undefined = apiPost
    ? mapApiPostToThread(apiPost, profile)
    : undefined;

  const [prevThread, setPrevThread] = useState(thread);
  const [liked, setLiked] = useState(thread?.liked ?? false);
  const [likes, setLikes] = useState(thread?.likes ?? 0);
  const [reposted, setReposted] = useState(thread?.reposted ?? false);
  const [reposts, setReposts] = useState(thread?.reposts ?? 0);

  if (
    prevThread?.liked !== thread?.liked ||
    prevThread?.likes !== thread?.likes ||
    prevThread?.reposted !== thread?.reposted ||
    prevThread?.reposts !== thread?.reposts
  ) {
    setPrevThread(thread);
    setLiked(thread?.liked ?? false);
    setLikes(thread?.likes ?? 0);
    setReposted(thread?.reposted ?? false);
    setReposts(thread?.reposts ?? 0);
  }
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState<'top' | 'newest'>('top');
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [, setApi] = useState<CarouselApi>();

  // Fetch top-level comments from the API (paginated)
  const { data: apiComments } = useGetCommentsByPostIdQuery(
    { postId: numericId, limit: 20, offset: 0 },
    { skip: isNaN(numericId) },
  );
  const [createComment] = useCreateCommentMutation();

  const handleLikeToggle = () => {
    const next = !liked;
    setLiked(next);
    setLikes((l) => (next ? l + 1 : l - 1));
    if (!isNaN(numericId)) {
      if (next) {
        likePost(numericId).catch(() => { setLiked(!next); setLikes((l) => l - 1); });
      } else {
        unlikePost(numericId).catch(() => { setLiked(!next); setLikes((l) => l + 1); });
      }
    }
  };

  const handleRepostToggle = () => {
    const next = !reposted;
    setReposted(next);
    setReposts((r) => (next ? r + 1 : r - 1));
    if (!isNaN(numericId)) {
      if (next) {
        repostPost(numericId).catch(() => { setReposted(!next); setReposts((r) => r - 1); });
      } else {
        undoRepostPost(numericId).catch(() => { setReposted(!next); setReposts((r) => r + 1); });
      }
    }
  };

  const handlePostReply = async () => {
    if (!replyText.trim() || isNaN(numericId)) return;
    try {
      await createComment({
        post_id: numericId,
        parent_id: null,
        content: replyText.trim(),
      }).unwrap();
      setReplyText('');
    } catch {
      // Keep the text so the user can retry
    }
  };

  /* Loading state */
  if (isLoading) {
    return (
      <div className="max-w-[680px] mx-auto px-4 pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#101010]/92 backdrop-blur-md pt-3 pb-3 mb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="bg-transparent border-none text-white cursor-pointer p-2 rounded-full transition-colors hover:bg-white/10">
                <BackArrowIcon />
              </button>
              <div className="animate-pulse">
                <div className="h-4 bg-white/10 rounded w-16 mb-1" />
                <div className="h-3 bg-white/10 rounded w-12" />
              </div>
            </div>
            <button className="bg-white/8 border-none text-white/60 cursor-pointer p-2.5 rounded-full transition-colors hover:bg-white/15 hover:text-white">
              <MoreIcon />
            </button>
          </div>
        </div>

        {/* Main card */}
        <div className="border border-white/4 rounded-3xl bg-[#181818]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(255,255,255,0.022)] overflow-hidden mt-2 animate-pulse">
          <div className="px-5 pt-5 pb-2">
            {/* Author row */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-white/10" />
              <div className="flex items-baseline gap-2 flex-1">
                <div className="h-4 bg-white/10 rounded w-24" />
                <div className="h-3 bg-white/10 rounded w-8" />
              </div>
              <div className="ml-auto w-6 h-4 flex items-center justify-center">
                <span className="text-white/35 text-lg">···</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2 mb-6">
              <div className="h-4 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-1/2" />
            </div>

            {/* Engagement bar */}
            <div className="flex items-center gap-4 py-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-1.5 py-1 px-1.5">
                  <div className="w-5 h-5 rounded bg-white/10" />
                  <div className="w-4 h-3 bg-white/10 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Sort + View activity */}
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/5">
            <div className="h-4 bg-white/10 rounded w-14" />
            <div className="h-3 bg-white/10 rounded w-20" />
          </div>

          {/* Reply input */}
          <div className="border-t border-b border-white/5">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-9 h-9 rounded-full bg-white/10 shrink-0" />
              <div className="flex-1 h-5 bg-white/5 rounded" />
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-6 h-6 rounded bg-white/5" />
                <div className="w-6 h-6 rounded bg-white/5" />
                <div className="w-6 h-6 rounded bg-white/5" />
              </div>
            </div>
          </div>

          {/* Comments from API */}
          <div className="text-center py-10">
            <div className="h-3 bg-white/5 rounded w-48 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  /* 404-style fallback */
  if (isError || !thread || isDeleted) {
    return (
      <div className="max-w-[680px] mx-auto px-4 pt-20 text-center">
        <p className="text-white/50 text-lg">Thread not found.</p>
        <button
          onClick={() => router.back()}
          className="mt-6 bg-white/10 border-none text-white cursor-pointer py-2.5 px-6 rounded-full text-sm font-medium transition-colors hover:bg-white/20 font-inherit"
        >
          Back to Community
        </button>
      </div>
    );
  }

  const avatarColor = getAvatarColor(thread.author);
  const initials = thread.author[0]?.toUpperCase() ?? '?';
  const viewCount = `${((thread.likes * 3.5 + thread.replies * 10) / 1000).toFixed(0)}K views`;

  return (
    <div className="max-w-[680px] mx-auto px-4 pb-20">
      {/* ─── Header ─── */}
      <div className="sticky top-0 z-10 bg-[#101010]/92 backdrop-blur-md pt-3 pb-3 mb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="bg-transparent border-none text-white cursor-pointer p-2 rounded-full transition-colors hover:bg-white/10"
              aria-label="Back"
            >
              <BackArrowIcon />
            </button>
            <div>
              <h1 className="text-[17px] font-bold text-white m-0 leading-tight">Thread</h1>
              <span className="text-[12px] text-white/40 font-light">{viewCount}</span>
            </div>
          </div>
          <button className="bg-white/8 border-none text-white/60 cursor-pointer p-2.5 rounded-full transition-colors hover:bg-white/15 hover:text-white">
            <MoreIcon />
          </button>
        </div>
      </div>

      {/* ─── Main card ─── */}
      <div className="border border-white/4 rounded-3xl bg-[#181818]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(255,255,255,0.022)] overflow-hidden mt-2">
        {/* Original post */}
        <div className="px-5 pt-5 pb-2">
          {/* Author row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              {thread.avatar ? (
                <Image src={thread.avatar} alt={thread.author} width={44} height={44} className="w-11 h-11 rounded-full object-cover" />
              ) : (
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${avatarColor}dd, ${avatarColor}88)` }}
                >
                  {initials}
                </div>
              )}
              {thread.author !== 'You' && (
                <div className="absolute -bottom-1 -right-1 bg-[#181818] rounded-full flex items-center justify-center w-4.5 h-4.5">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 fill-white">
                    <path d="M8 2a6 6 0 100 12A6 6 0 008 2zM8 1a7 7 0 110 14A7 7 0 018 1zm3 6.5H8.5V4.5a.5.5 0 00-1 0v3H4.5a.5.5 0 000 1h3v3a.5.5 0 001 0v-3h3a.5.5 0 000-1z" fillRule="evenodd" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-2 flex-1 min-w-0">
              <span className="text-[15px] font-semibold text-white flex items-center gap-1.5">
                {thread.author}
                {thread.isPetProfile && (
                  <span className="inline-flex items-center justify-center bg-[#d4d4d4] rounded-full w-[15px] h-[15px] relative -top-[0.5px]">
                    <PawIcon />
                  </span>
                )}
              </span>
              <span className="text-[14px] text-white/35">{thread.time}</span>
            </div>
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
          <p className="text-[15px] font-light leading-relaxed text-white/95 mb-3 break-words tracking-wide">
            {thread.content}
          </p>

          {/* Quoted post embed */}
          {thread.quotedPost && (
            <QuotedPostEmbed post={thread.quotedPost} />
          )}

          {/* Media */}
          {thread.media && thread.media.length > 0 ? (
            <div className="relative mb-3">
              <Carousel
                setApi={setApi}
                opts={{ align: 'start', loop: false, dragFree: true }}
                className="w-full select-none cursor-grab active:cursor-grabbing"
              >
                <CarouselContent className="-ml-2">
                  {thread.media.map((item, idx) => (
                    <CarouselItem
                      key={idx}
                      className={`pl-2 ${thread.media!.length === 1 ? 'basis-full' : 'basis-[70%] sm:basis-[240px]'}`}
                    >
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          controls
                          className={`rounded-xl object-cover shrink-0 select-none ${thread.media!.length === 1 ? 'w-full max-h-[360px]' : 'w-full h-[300px]'}`}
                        />
                      ) : (
                        <Image
                          src={item.url}
                          alt={`Thread media ${idx + 1}`}
                          width={thread.media!.length === 1 ? 600 : 280}
                          height={thread.media!.length === 1 ? 360 : 360}
                          unoptimized
                          draggable={false}
                          className={`rounded-xl object-cover shrink-0 select-none ${thread.media!.length === 1 ? 'w-full max-h-[360px]' : 'w-full h-[300px]'}`}
                        />
                      )}
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          ) : null}

          {/* Engagement bar */}
          <div className="flex items-center gap-4 py-2">
            <button
              className={`flex items-center gap-1.5 bg-transparent border-none cursor-pointer py-1 px-1.5 rounded-lg text-sm transition-all font-inherit hover:bg-white/5 ${liked ? 'text-[#e0245e] hover:bg-[#e0245e]/10' : 'text-white/50 hover:text-white/85'}`}
              onClick={handleLikeToggle}
            >
              <div className="w-5 h-5 shrink-0"><HeartIcon filled={liked} /></div>
              <span className="text-[13px] font-medium">{formatCount(likes)}</span>
            </button>

            <span className="flex items-center gap-1.5 text-white/50 py-1 px-1.5 text-sm">
              <div className="w-5 h-5 shrink-0"><CommentIcon /></div>
              <span className="text-[13px] font-medium">{formatCount(thread.replies)}</span>
            </span>

            <div className="relative">
              <button
                className={`flex items-center gap-1.5 bg-transparent border-none cursor-pointer py-1 px-1.5 rounded-lg text-sm transition-all font-inherit hover:bg-white/5 ${reposted ? 'text-[#00c37d] hover:bg-[#00c37d]/10' : 'text-white/50 hover:text-white/85'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowRepostMenu(!showRepostMenu);
                }}
              >
                <div className="w-5 h-5 shrink-0"><RepostIcon active={reposted} /></div>
                <span className="text-[13px] font-medium">{formatCount(reposts)}</span>
              </button>
              {showRepostMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowRepostMenu(false);
                    }}
                  />
                  <div className="absolute left-0 bottom-full mb-1 w-36 bg-[#1c1c1c] border border-white/10 rounded-xl shadow-xl z-40 overflow-hidden flex flex-col py-1">
                    <button
                      className="flex items-center gap-3 text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRepostMenu(false);
                        handleRepostToggle();
                      }}
                    >
                      <div className="w-4.5 h-4.5 shrink-0">
                        <RepostIcon />
                      </div>
                      {reposted ? 'Undo repost' : 'Repost'}
                    </button>
                    <button
                      className="flex items-center gap-3 text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition-colors border-none bg-transparent cursor-pointer font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowRepostMenu(false);
                        window.dispatchEvent(
                          new CustomEvent('community-open-quote-thread', {
                            detail: { thread: thread.quotedPost ? thread.quotedPost : thread },
                          })
                        );
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="w-4.5 h-4.5 shrink-0">
                        <path d="M10 11H6a1 1 0 01-1-1V6a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1zm0 0c0 2.5-2 4-4 4m12-4h-4a1 1 0 01-1-1V6a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1zm0 0c0 2.5-2 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Quote
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              className={`flex items-center gap-1.5 bg-transparent border-none cursor-pointer py-1 px-1.5 rounded-lg text-sm transition-all font-inherit ${copied ? 'text-[#00c37d]' : 'text-white/50 hover:text-white/85 hover:bg-white/5'}`}
              onClick={(e) => {
                e.stopPropagation();
                if (!thread) return;
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
              {copied ? (
                <span className="text-[13px] font-medium animate-fade-in-up">Copied!</span>
              ) : (
                <span className="text-[13px] font-medium">{thread.reposts > 0 ? formatCount(Math.floor(thread.reposts * 0.3)) : ''}</span>
              )}
            </button>
          </div>
        </div>

        {/* Sort + View activity */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/5">
          <button
            className="flex items-center gap-1.5 bg-transparent border-none text-white/70 cursor-pointer text-sm font-medium transition-colors hover:text-white font-inherit"
            onClick={() => setSortBy((s) => (s === 'top' ? 'newest' : 'top'))}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M7 4v16M7 4l-4 4M7 4l4 4M17 20V4M17 20l-4-4M17 20l4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="capitalize">{sortBy === 'top' ? 'Top' : 'Newest'}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="bg-transparent border-none text-white/40 cursor-pointer text-[13px] font-medium transition-colors hover:text-white/70 font-inherit">
            View activity &gt;
          </button>
        </div>

        {/* Reply input (top-level comments only) */}
        <div className="border-t border-b border-white/5">
          <div className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#666]">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handlePostReply(); }}
                placeholder={`Reply to ${thread.author.toLowerCase().replace(/\s/g, '.')}...`}
                className="w-full bg-transparent border-none outline-none text-white/90 text-[14px] font-light placeholder:text-white/30 py-1"
                id="thread-reply-input"
              />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button className="bg-transparent border-none text-white/30 cursor-pointer p-1.5 rounded-md transition-colors hover:bg-white/10 hover:text-white/50">
                <ImageAttachIcon />
              </button>
              <button className="bg-transparent border-none text-white/30 cursor-pointer p-1.5 rounded-md transition-colors hover:bg-white/10 hover:text-white/50">
                <GifIcon />
              </button>
              <button className="bg-transparent border-none text-white/30 cursor-pointer p-1.5 rounded-md transition-colors hover:bg-white/10 hover:text-white/50">
                <ExpandIcon />
              </button>
            </div>
          </div>
        </div>

        {/* Comments from API */}
        {apiComments && apiComments.length > 0 ? (
          apiComments.map((comment, idx) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={numericId}
              index={idx}
            />
          ))
        ) : (
          <div className="text-center py-10 text-white/25 text-sm">
            No comments yet — be the first to reply.
          </div>
        )}
      </div>
    </div>
  );
}
