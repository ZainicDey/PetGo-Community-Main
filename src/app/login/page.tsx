'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import PetGoLogo from '@/assets/images/Logo_PetGo.png';
import { setToken } from '@/lib/store/slices/authSlice';

export default function LoginPage() {
  const [token, setTokenValue] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmed = token.trim();
    if (!trimmed) {
      setError('Please enter your access token.');
      return;
    }

    setIsLoading(true);

    try {
      // Validate the token via the backend verification endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/auth/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: trimmed }),
      });

      if (!res.ok) {
        setError('Something went wrong with the server. Please try again.');
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      
      if (!data.valid) {
        setError('Invalid or expired token. Please try again.');
        setIsLoading(false);
        return;
      }

      // Token is valid — store it and redirect
      dispatch(setToken(trimmed));
      router.push('/');
    } catch {
      setError('Could not reach the server. Please check your connection.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#101010] px-4">
      {/* Subtle radial glow behind the card */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#F7941D]/[0.04] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image
            src={PetGoLogo}
            alt="PetGo"
            width={140}
            height={44}
            className="select-none"
            priority
          />
        </div>

        {/* Card */}
        <div className="bg-[#1c1919] border border-white/10 rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-white text-center mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-white/40 text-center mb-6">
            Enter your access token to continue
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="login-token-input"
                className="block text-sm text-white/60 mb-1.5 font-medium"
              >
                Access Token
              </label>
              <input
                id="login-token-input"
                type="password"
                value={token}
                onChange={(e) => {
                  setTokenValue(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Paste your JWT access token"
                autoComplete="off"
                className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#F7941D]/60 focus:ring-1 focus:ring-[#F7941D]/30"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed bg-[#F7941D] text-white hover:bg-[#e8871a] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="opacity-25"
                    />
                    <path
                      d="M4 12a8 8 0 018-8"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="opacity-75"
                    />
                  </svg>
                  Verifying…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-xs text-white/25 text-center mt-5">
          Your token is stored locally and sent only to the PetGo API.
        </p>
      </div>
    </div>
  );
}
