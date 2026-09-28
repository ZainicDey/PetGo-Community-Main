'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchUsersQuery } from '@/lib/store/services/usersApi';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

/* ── Types ── */

/** A confirmed mention selected from the dropdown. */
export interface ConfirmedMention {
  username: string;
  userId: number;
}

interface MentionsTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChangeText: (text: string) => void;
  /** Called whenever the set of confirmed mentions changes. */
  onMentionsChange?: (mentions: ConfirmedMention[]) => void;
  /** Pre-populated confirmed mentions (e.g. when editing existing content). */
  initialMentions?: ConfirmedMention[];
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

/* ── MentionsTextarea (compose-time) ── */

export function MentionsTextarea({
  value,
  onChangeText,
  onMentionsChange,
  initialMentions,
  placeholder,
  className = '',
  maxLength,
  autoFocus,
  ...props
}: MentionsTextareaProps) {
  const [mentionSearch, setMentionSearch] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [confirmedUsernames, setConfirmedUsernames] = useState<ConfirmedMention[]>(
    initialMentions ?? []
  );
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      if (mentionSearch !== null) setDebouncedSearch(mentionSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [mentionSearch]);

  const { data: users, isFetching } = useSearchUsersQuery(debouncedSearch, {
    skip: mentionSearch === null,
  });

  // Sync height on change
  useEffect(() => {
    if (textareaRef.current && bgRef.current) {
      textareaRef.current.style.height = 'auto';
      const height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.style.height = height;
      bgRef.current.style.height = height;
    }
  }, [value]);

  /**
   * Compute the pixel (top, left) of the caret inside the textarea using a
   * hidden mirror div that replicates the textarea's text and styling up to
   * the caret position.
   */
  const getCaretCoordinates = useCallback((el: HTMLTextAreaElement, position: number) => {
    const mirror = document.createElement('div');
    const style = getComputedStyle(el);

    // Copy all relevant styles so the mirror matches the textarea exactly
    const props = [
      'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
      'letterSpacing', 'lineHeight', 'textTransform',
      'wordSpacing', 'textIndent', 'paddingTop', 'paddingRight',
      'paddingBottom', 'paddingLeft', 'borderTopWidth', 'borderRightWidth',
      'borderBottomWidth', 'borderLeftWidth', 'boxSizing', 'whiteSpace',
      'wordWrap', 'overflowWrap', 'width',
    ] as const;

    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.whiteSpace = 'pre-wrap';
    mirror.style.wordWrap = 'break-word';
    mirror.style.overflow = 'hidden';

    for (const prop of props) {
      const cssKey = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      mirror.style.setProperty(cssKey, style.getPropertyValue(cssKey));
    }

    // Text up to the caret
    const textBeforeCaret = el.value.substring(0, position);
    mirror.textContent = textBeforeCaret;

    // Insert a span at the caret position to measure its coordinates
    const caretSpan = document.createElement('span');
    caretSpan.textContent = '|';
    mirror.appendChild(caretSpan);

    document.body.appendChild(mirror);

    const top = caretSpan.offsetTop - el.scrollTop;
    const left = caretSpan.offsetLeft;

    document.body.removeChild(mirror);

    return { top, left };
  }, []);

  // Prune confirmed mentions that are no longer present in the text
  const pruneConfirmed = useCallback(
    (text: string, current: ConfirmedMention[]): ConfirmedMention[] => {
      return current.filter((m) => text.includes(`@${m.username}`));
    },
    []
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newVal = e.target.value;
    if (maxLength && newVal.length > maxLength) {
      newVal = newVal.slice(0, maxLength);
    }
    onChangeText(newVal);

    // Prune mentions that were deleted
    const pruned = pruneConfirmed(newVal, confirmedUsernames);
    if (pruned.length !== confirmedUsernames.length) {
      setConfirmedUsernames(pruned);
      onMentionsChange?.(pruned);
    }

    const pos = e.target.selectionStart;
    setCursorPos(pos);
    checkMention(newVal, pos, e.target);
  };

  const checkMention = (text: string, pos: number, el?: HTMLTextAreaElement) => {
    const textBefore = text.slice(0, pos);
    const match = textBefore.match(/@(\w*)$/);
    if (match) {
      setMentionSearch(match[1]);
      // Calculate dropdown position at cursor
      const textarea = el ?? textareaRef.current;
      if (textarea) {
        const coords = getCaretCoordinates(textarea, pos);
        const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 20;
        setDropdownPos({ top: coords.top + lineHeight + 4, left: Math.min(coords.left, 8) });
      }
    } else {
      setMentionSearch(null);
    }
  };

  const handleSelectUser = (username: string, userId: number) => {
    const textBefore = value.slice(0, cursorPos);
    const textAfter = value.slice(cursorPos);
    const match = textBefore.match(/@(\w*)$/);
    if (match) {
      const startPos = textBefore.lastIndexOf('@');
      const newText = value.slice(0, startPos) + `@${username} ` + textAfter;
      onChangeText(newText);
      setMentionSearch(null);

      // Add to confirmed list (deduplicate by userId)
      const alreadyExists = confirmedUsernames.some((m) => m.userId === userId);
      if (!alreadyExists) {
        const updated = [...confirmedUsernames, { username, userId }];
        setConfirmedUsernames(updated);
        onMentionsChange?.(updated);
      }

      // Restore cursor
      setTimeout(() => {
        if (textareaRef.current) {
          const newPos = startPos + username.length + 2; // +1 for @, +1 for space
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      }, 0);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (bgRef.current) {
      bgRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Build a Set of confirmed usernames for O(1) lookup
  const confirmedSet = new Set(confirmedUsernames.map((m) => m.username));

  // Render text with highlighted mentions (only confirmed ones)
  const renderHighlightedText = () => {
    if (!value) {
      return <span className="text-white/35">{placeholder}</span>;
    }

    const parts = value.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const name = part.slice(1); // strip leading @
        if (confirmedSet.has(name)) {
          return (
            <span
              key={i}
              className="text-[#F7941D] bg-[#F7941D]/10 rounded-sm px-0.5 py-0.5 -mx-0.5"
            >
              {part}
            </span>
          );
        }
      }
      return (
        <span key={i} className="text-white/90">
          {part}
        </span>
      );
    });
  };

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = value.length;
      textareaRef.current.selectionEnd = value.length;
    }
  }, [autoFocus, value.length]);

  return (
    <div className="relative w-full">
      {/* Background Div */}
      <div
        ref={bgRef}
        className={`absolute inset-0 pointer-events-none whitespace-pre-wrap break-words overflow-hidden ${className}`}
        aria-hidden="true"
      >
        {renderHighlightedText()}
        {/* Ensure trailing newlines render */}
        {value.endsWith('\n') ? <br /> : null}
      </div>

      {/* Actual Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onScroll={handleScroll}
        onClick={(e) => {
          setCursorPos(e.currentTarget.selectionStart);
          checkMention(value, e.currentTarget.selectionStart, e.currentTarget);
        }}
        onKeyUp={(e) => {
          setCursorPos(e.currentTarget.selectionStart);
          checkMention(value, e.currentTarget.selectionStart, e.currentTarget);
        }}
        className={`relative z-10 w-full bg-transparent outline-none resize-none caret-white text-transparent ${className}`}
        style={{ color: 'transparent', WebkitTextFillColor: 'transparent' }}
        {...props}
      />

      {/* Dropdown — positioned at the caret */}
      {mentionSearch !== null && (
        <div
          className="absolute z-[3000] w-64 max-h-48 overflow-y-auto bg-[#242424] border border-white/10 rounded-xl shadow-xl py-1"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
        >
          {isFetching ? (
            <div className="px-4 py-3 text-sm text-white/50 text-center">Searching...</div>
          ) : users && users.length > 0 ? (
            users.map((user) => (
              <button
                key={user.id}
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors cursor-pointer border-none bg-transparent text-left"
                onClick={() => handleSelectUser(user.username, user.id)}
              >
                <div className="w-8 h-8 rounded-full bg-[#181818] flex items-center justify-center overflow-hidden shrink-0">
                  {user.profile_picture_url ? (
                    <Image
                      src={user.profile_picture_url}
                      alt=""
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-white/50 font-bold">
                      {user.username[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm text-white font-medium truncate w-full">
                    {user.username}
                  </span>
                  <span className="text-xs text-white/40 truncate w-full">
                    {user.profile_type === 'pet' && user.pet_type ? user.pet_type : 'User'}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-white/50 text-center">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── MentionText (display-time — renders clickable @mentions) ── */

interface MentionTextProps {
  /** The raw text content that may contain @username patterns. */
  text: string;
  /** Optional className for the wrapper. */
  className?: string;
}

/**
 * Renders text content with `@username` tokens highlighted and clickable.
 * Clicking a mention navigates to `/community/user/{id}` by performing a
 * live search lookup of the username. If the username cannot be resolved,
 * the mention is still highlighted but navigates to a search page instead.
 */
export function MentionText({ text, className }: MentionTextProps) {
  const router = useRouter();

  if (!text) return null;

  const parts = text.split(/(@\w+)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          return (
            <MentionLink key={i} mention={part} router={router} />
          );
        }
        return <span key={i} className={className}>{part}</span>;
      })}
    </>
  );
}

/* Individual mention link — does a lazy search to resolve userId */
function MentionLink({
  mention,
  router,
}: {
  mention: string;
  router: ReturnType<typeof useRouter>;
}) {
  const username = mention.slice(1); // strip @
  const { data: users } = useSearchUsersQuery(username);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const matched = users?.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (matched) {
      router.push(`/community/user/${matched.id}`);
    }
  };

  return (
    <span
      role="link"
      tabIndex={0}
      className="text-[#F7941D] hover:underline cursor-pointer font-normal"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleClick(e as unknown as React.MouseEvent);
      }}
    >
      {mention}
    </span>
  );
}
