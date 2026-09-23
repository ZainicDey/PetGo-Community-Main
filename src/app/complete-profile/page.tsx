'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Camera, User, ChevronDown } from 'lucide-react';
import PetGoLogo from '@/assets/images/Logo_PetGo.png';
import {
  useCreateProfileMutation,
  useCheckUsernameMutation,
  useGetMeQuery,
} from '@/lib/store/services/usersApi';

type ProfileType = 'user' | 'pet';

export default function CompleteProfilePage() {
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const routerNav = useRouter();

  /* Guard: if profile already completed, redirect away */
  useEffect(() => {
    if (me?.has_social_profile) {
      routerNav.replace('/community/profile');
    }
  }, [me, routerNav]);

  const [username, setUsername] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('user');
  const [gender, setGender] = useState('');
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [createProfile, { isLoading }] = useCreateProfileMutation();
  const [checkUsername] = useCheckUsernameMutation();

  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsernameAvailable(null);

      setIsCheckingUsername(false);
      return;
    }


    setIsCheckingUsername(true);

    setUsernameAvailable(null);

    const timer = setTimeout(async () => {
      try {
        const res = await checkUsername({ username: trimmed }).unwrap();
        setUsernameAvailable(res.available);
      } catch {
        setUsernameAvailable(false);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [username, checkUsername]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Please choose a username.');
      return;
    }
    if (usernameAvailable === false) {
      setError('Username is not available.');
      return;
    }

    let finalAvatarUrl = profilePictureUrl;

    if (profileFile) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'petgo_preset';

      if (!cloudName) {
        setError('Cloudinary is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to .env.local.');
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', profileFile);
        formData.append('upload_preset', uploadPreset);

        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadRes.json();
        finalAvatarUrl = uploadData.secure_url;
      } catch (err) {
        console.error('Cloudinary upload error:', err);
        setError('Failed to upload profile picture. Please try again.');
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    try {
      await createProfile({
        username: trimmedUsername,
        profile_type: profileType,
        ...(gender ? { gender } : {}),
        ...(dateOfBirth ? { date_of_birth: dateOfBirth } : {}),
        ...(finalAvatarUrl ? { profile_picture_url: finalAvatarUrl } : {}),
      }).unwrap();

      routerNav.push('/');
    } catch (err) {
      const apiError = err as { data?: { detail?: string }; status?: number };
      setError(
        apiError?.data?.detail ||
        'Failed to create profile. Please try again.',
      );
    }
  };

  if (isMeLoading || me?.has_social_profile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#101010]">
        <svg className="animate-spin w-8 h-8 text-[#F7941D]" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
        </svg>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#101010] px-4">
      {/* Subtle radial glow behind the card */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#F7941D]/[0.04] blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[460px]">
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
            Complete Your Profile
          </h1>
          <p className="text-sm text-white/40 text-center mb-6">
            Set up your social profile to start interacting with the community
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Profile Picture */}
            <div className="flex flex-col items-center justify-center mb-2">
              <label htmlFor="profile-picture-upload" className="cursor-pointer group relative">
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-200 ${profilePictureUrl
                      ? 'border-[#F7941D]'
                      : 'border-white/10 bg-[#101010] group-hover:border-white/30'
                    }`}
                >
                  {profilePictureUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={profilePictureUrl}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-white/20 group-hover:text-white/40 transition-colors" />
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>
                <input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfileFile(file);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setProfilePictureUrl(event.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
              <span className="text-xs text-white/40 mt-3 font-medium">Upload Profile Picture (optional)</span>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="profile-username"
                className="block text-sm text-white/60 mb-1.5 font-medium"
              >
                Username <span className="text-[#F7941D]">*</span>
              </label>
              <div className="relative">
                <input
                  id="profile-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\s/g, '').toLowerCase();
                    setUsername(val);
                    if (error) setError('');
                  }}
                  placeholder="Choose a unique username"
                  autoComplete="off"
                  className={`w-full bg-[#101010] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#F7941D]/60 focus:ring-1 focus:ring-[#F7941D]/30 ${usernameAvailable === false ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30' : 'border-white/10'
                    }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isCheckingUsername && (
                    <svg className="animate-spin w-4 h-4 text-white/50" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                    </svg>
                  )}
                  {!isCheckingUsername && usernameAvailable === true && (
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {!isCheckingUsername && usernameAvailable === false && username.trim() !== '' && (
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </div>
              {!isCheckingUsername && usernameAvailable === false && username.trim() !== '' && (
                <p className="text-red-400 text-xs mt-1.5">This username is already taken.</p>
              )}
            </div>

            {/* Gender (optional) */}
            <div>
              <label
                htmlFor="profile-gender"
                className="block text-sm text-white/60 mb-1.5 font-medium"
              >
                Gender{' '}
                <span className="text-white/25 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsGenderOpen(!isGenderOpen)}
                  className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#F7941D]/60 focus:ring-1 focus:ring-[#F7941D]/30 flex items-center justify-between"
                >
                  <span className="capitalize">{gender === '' ? 'Prefer not to say' : gender}</span>
                  <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isGenderOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isGenderOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsGenderOpen(false)} />
                    <div className="absolute top-full left-0 w-full mt-2 bg-[#181818] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                      {[
                        { value: '', label: 'Prefer not to say' },
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setGender(opt.value);
                            setIsGenderOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                            gender === opt.value ? 'text-[#F7941D] bg-[#F7941D]/10' : 'text-white/80'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Date of Birth (optional) */}
            <div>
              <label
                htmlFor="profile-dob"
                className="block text-sm text-white/60 mb-1.5 font-medium"
              >
                Date of Birth{' '}
                <span className="text-white/25 font-normal">(optional)</span>
              </label>
              <input
                id="profile-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#F7941D]/60 focus:ring-1 focus:ring-[#F7941D]/30 [color-scheme:dark]"
              />
            </div>

            {/* Error message */}
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

            {/* Submit */}
            <button
              id="profile-submit-btn"
              type="submit"
              disabled={isLoading || isUploading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed bg-[#F7941D] text-white hover:bg-[#e8871a] active:scale-[0.98]"
            >
              {isLoading || isUploading ? (
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
                  {isUploading ? 'Uploading image…' : 'Creating profile…'}
                </span>
              ) : (
                'Create Profile & Continue'
              )}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-xs text-white/25 text-center mt-5">
          Your profile lets you like, comment, and post in the PetGo Community.
        </p>
      </div>
    </div>
  );
}
