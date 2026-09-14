'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useGetProfileQuery } from '@/lib/store/services/usersApi';

interface NewThreadModalProps {
  onClose: () => void;
  onPost?: (text: string, files: File[]) => void;
}

const MAX_CHARS = 500;

export default function NewThreadModal({ onClose, onPost }: NewThreadModalProps) {
  const [text, setText] = useState('');
  const [filesData, setFilesData] = useState<{ file: File; url: string; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handlePost = async () => {
    if (!text.trim() && filesData.length === 0) return;
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

  const remaining = MAX_CHARS - text.length;

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/75 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="New thread"
    >
      <div className="bg-[#1e1e1e] rounded-[20px] w-full max-w-[540px] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] border border-white/10 animate-in slide-in-from-bottom-4 zoom-in-95 duration-250">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-base font-semibold text-white">New thread</span>
          <button
            className="bg-transparent border-none text-white/50 cursor-pointer p-1.5 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 hover:text-white font-inherit"
            onClick={onClose}
            aria-label="Close"
            id="community-modal-close-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0 text-white overflow-hidden">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Your avatar" width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <span className="text-base font-bold text-white/70">{initials}</span>
            )}
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{username}</span>
              <button
                className="bg-transparent border-none cursor-pointer text-white/50 hover:text-white transition-colors p-1"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Add media"
              >
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 121.86 122.88" className="w-5 h-5 fill-current" xmlSpace="preserve">
                  <path fillRule="evenodd" clipRule="evenodd" d="M72.09,18.72h42.37c2.05,0,3.89,0.84,5.22,2.18c1.34,1.34,2.18,3.2,2.18,5.22v89.36 c0,2.05-0.84,3.89-2.18,5.22c-1.34,1.34-3.2,2.18-5.22,2.18H24.48c-2.05,0-3.89-0.84-5.22-2.18c-1.34-1.34-2.18-3.2-2.18-5.22 V71.46c2.47,1,5.05,1.78,7.72,2.29v20.28h0.03l0,0C37.72,81.7,46.26,75.61,59.08,65.2c0.05,0.05,0.1,0.1,0.15,0.15 c0.03,0.03,0.03,0.06,0.06,0.06l26.82,31.73l4.1-25.24c0.28-1.62,1.8-2.73,3.42-2.45c0.62,0.09,1.18,0.4,1.62,0.81l18.82,19.77 V27.91c0-0.4-0.16-0.75-0.44-0.99c-0.25-0.25-0.62-0.44-0.99-0.44H74.05C73.64,23.8,72.98,21.21,72.09,18.72L72.09,18.72z M32.79,0 C50.9,0,65.58,14.68,65.58,32.79c0,18.11-14.68,32.79-32.79,32.79C14.68,65.58,0,50.9,0,32.79C0,14.68,14.68,0,32.79,0L32.79,0z M15.37,33.37h11.04v15.76h12.45V33.37h11.36L32.8,16.44L15.37,33.37L15.37,33.37L15.37,33.37z M94.27,35.66 c2.95,0,5.66,1.21,7.58,3.14c1.96,1.96,3.14,4.63,3.14,7.59c0,2.95-1.21,5.66-3.14,7.58c-1.96,1.96-4.63,3.14-7.58,3.14 c-2.95,0-5.66-1.21-7.59-3.14c-1.96-1.96-3.14-4.63-3.14-7.58c0-2.95,1.21-5.65,3.14-7.59C88.65,36.84,91.32,35.66,94.27,35.66 L94.27,35.66L94.27,35.66z"/>
                </svg>
              </button>
            </div>
            <textarea
              id="community-new-thread-textarea"
              className="w-full bg-transparent border-none outline-none text-white/85 text-[15px] font-light resize-none leading-relaxed min-h-[100px] placeholder:text-white/30"
              placeholder="Start a thread..."
              value={text}
              onChange={(e) => {
                if (e.target.value.length <= MAX_CHARS) setText(e.target.value);
              }}
              autoFocus
              rows={4}
            />
            {/* Media Previews */}
            {filesData.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {filesData.map((data, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden bg-white/5 border border-white/10">
                    {data.type === 'video' ? (
                      <video src={data.url} className="h-32 w-auto object-contain" />
                    ) : (
                      <Image src={data.url} alt="Preview" width={120} height={120} className="h-32 w-auto object-cover" unoptimized />
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
          <div className="flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,video/*"
              className="hidden"
            />
            <span className="text-xs text-white/30">
              {remaining < 100 ? `${remaining} remaining` : ''}
            </span>
          </div>
          <button
            id="community-post-thread-btn"
            className="bg-white text-black border-none rounded-full py-2.5 px-5.5 text-sm font-bold cursor-pointer transition-all disabled:opacity-35 disabled:cursor-not-allowed hover:not-disabled:opacity-85 hover:not-disabled:scale-[1.02] font-inherit"
            onClick={handlePost}
            disabled={!text.trim() && filesData.length === 0}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
