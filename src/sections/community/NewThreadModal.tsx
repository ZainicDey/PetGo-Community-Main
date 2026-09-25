'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ImagePlus, X, ChevronDown } from 'lucide-react';
import { useGetProfileQuery } from '@/lib/store/services/usersApi';
import type { Thread } from './ThreadCard';

interface NewThreadModalProps {
  onClose: () => void;
  onPost?: (text: string, files: File[]) => void;
  quotedThread?: Thread;
}

const MAX_CHARS = 500;

const AUDIENCE_OPTIONS = [
  { value: 'anyone', label: 'Anyone' },
  { value: 'followers', label: 'Your followers' },
] as const;

/* GIF icon (inline SVG since lucide doesn't have a dedicated GIF icon) */
const GifIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <text x="12" y="15" textAnchor="middle" fill="currentColor" stroke="none" fontSize="8" fontWeight="700" fontFamily="sans-serif">GIF</text>
  </svg>
);

export default function NewThreadModal({ onClose, onPost, quotedThread }: NewThreadModalProps) {
  const [text, setText] = useState('');
  const [filesData, setFilesData] = useState<{ file: File; url: string; type: string }[]>([]);
  const [audience, setAudience] = useState<'anyone' | 'followers'>('anyone');
  const [isAudienceOpen, setIsAudienceOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: profile } = useGetProfileQuery();
  const avatarUrl = profile?.profile_picture_url;
  const username = profile?.username || 'You';
  const initials = username[0]?.toUpperCase() || '?';

  useEffect(() => {
    // Cleanup object URLs on unmount
    return () => {
      filesData.forEach((data) => URL.revokeObjectURL(data.url));
    };
  }, [filesData]);

  /* Auto-grow textarea */
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [text]);

  const handlePost = async () => {
    if (!text.trim() && filesData.length === 0 && !quotedThread) return;
    onPost?.(text.trim(), filesData.map(f => f.file));
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
      }));
      setFilesData((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFilesData((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const canPost = text.trim().length > 0 || filesData.length > 0 || !!quotedThread;



  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/70 flex items-center justify-center backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="New thread"
    >
      <div
        className="relative w-full max-w-[540px] max-h-[90vh] bg-[#181818] border border-white/10 rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="text-[15px] text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none min-w-[60px] text-left"
            id="community-modal-close-btn"
          >
            Cancel
          </button>
          <h2 className="text-[15px] font-bold text-white">
            {quotedThread ? 'Quote post' : 'New thread'}
          </h2>
          <div className="min-w-[60px]" />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4">
          {/* Avatar + compose area */}
          <div className="flex gap-3">
            {/* Avatar column with thread line */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#242424] flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="Your avatar" width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white/60">{initials}</span>
                )}
              </div>
              {/* Thread line */}
              <div className="w-0.5 flex-1 min-h-[24px] bg-white/10 rounded-full mt-2" />
            </div>

            {/* Compose area */}
            <div className="flex-1 flex flex-col min-w-0 pt-0.5">
              <span className="text-[15px] font-semibold text-white">{username}</span>
              <textarea
                ref={textareaRef}
                id="community-new-thread-textarea"
                className="w-full bg-transparent border-none outline-none text-white/90 text-[15px] font-light resize-none leading-relaxed min-h-[44px] placeholder:text-white/35 mt-0.5"
                placeholder="What's new?"
                value={text}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) setText(e.target.value);
                }}
                autoFocus
              />

              {/* Media Previews */}
              {filesData.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {filesData.map((data, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden bg-white/5 border border-white/10">
                      {data.type === 'video' ? (
                        <video src={data.url} className="h-32 w-auto object-contain" />
                      ) : (
                        <Image src={data.url} alt="Preview" width={120} height={120} className="h-32 w-auto object-cover" unoptimized />
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-1.5 right-1.5 bg-black/70 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer hover:bg-black/90"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quoted post preview */}
              {quotedThread && (
                <div className="mt-3 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
                  <div className="px-4 pt-3 pb-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      {quotedThread.avatar ? (
                        <Image
                          src={quotedThread.avatar}
                          alt={quotedThread.author}
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-[#f7941d]/70 shrink-0"
                        >
                          {quotedThread.author[0]?.toUpperCase() ?? '?'}
                        </div>
                      )}
                      <span className="text-[13px] font-semibold text-white">{quotedThread.author}</span>
                      <span className="text-[13px] text-white/35">{quotedThread.time}</span>
                    </div>
                    {quotedThread.content && (
                      <p className="text-[14px] font-extralight leading-relaxed text-white/75 break-words line-clamp-3">
                        {quotedThread.content}
                      </p>
                    )}
                  </div>
                  {quotedThread.media && quotedThread.media.length > 0 && (
                    <div className="px-4 pb-3 pt-1">
                      {quotedThread.media[0].type === 'video' ? (
                        <video
                          src={quotedThread.media[0].url}
                          className="w-full max-h-[380px] rounded-xl object-cover"
                        />
                      ) : (
                        <Image
                          src={quotedThread.media[0].url}
                          alt="Quoted media"
                          width={680}
                          height={380}
                          unoptimized
                          className="w-full max-h-[380px] rounded-xl object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Faded avatar + media buttons row */}
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 flex justify-center shrink-0">
              <div className="w-5 h-5 rounded-full bg-[#242424] flex items-center justify-center overflow-hidden opacity-40">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="" width={20} height={20} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[9px] font-bold text-white/60">{initials}</span>
                )}
              </div>
            </div>
            {!quotedThread && (
              <div className="flex items-center gap-0.5">
                <button
                  className="p-1.5 rounded-full text-white/40 hover:text-white/70 hover:bg-white/5 transition-all bg-transparent border-none cursor-pointer"
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = 'image/*,video/*';
                      fileInputRef.current.click();
                    }
                  }}
                  aria-label="Add media"
                >
                  <ImagePlus className="w-[18px] h-[18px]" />
                </button>
                <button
                  className="p-1.5 rounded-full text-white/40 hover:text-white/70 hover:bg-white/5 transition-all bg-transparent border-none cursor-pointer"
                  aria-label="Add GIF"
                >
                  <GifIcon />
                </button>
              </div>
            )}
          </div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*,video/*"
            className="hidden"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-white/10">
          {/* Post Options dropdown */}
          <div className="relative">
            <button
              className="flex items-center gap-1.5 text-[13px] text-white/40 hover:text-white/60 transition-colors bg-transparent border-none cursor-pointer"
              onClick={() => setIsAudienceOpen(!isAudienceOpen)}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" />
              </svg>
              <span>{AUDIENCE_OPTIONS.find(o => o.value === audience)?.label ?? 'Anyone'} can reply</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAudienceOpen ? 'rotate-180' : ''}`} />
            </button>

            {isAudienceOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsAudienceOpen(false)} />
                <div className="absolute bottom-full left-0 mb-2 w-[180px] bg-[#242424] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                  {AUDIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setAudience(opt.value);
                        setIsAudienceOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 bg-transparent border-none cursor-pointer ${
                        audience === opt.value ? 'text-[#F7941D] bg-[#F7941D]/10' : 'text-white/80'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Post button */}
          <button
            id="community-post-thread-btn"
            onClick={handlePost}
            disabled={!canPost}
            className="bg-white/10 text-white border border-white/10 rounded-full py-1.5 px-5 text-sm font-semibold cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed enabled:hover:bg-white enabled:hover:text-black"
          >
            {quotedThread && !text.trim() ? 'Repost' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
