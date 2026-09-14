'use client';

import React, { useState, useEffect } from 'react';
import { Camera, User } from 'lucide-react';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useCheckUsernameMutation,
  type UpdateProfileBody,
} from '@/lib/store/services/usersApi';

interface EditProfileModalProps {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { data: profile } = useGetProfileQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [checkUsername] = useCheckUsernameMutation();

  const [username, setUsername] = useState(profile?.username || '');
  const [profileType, setProfileType] = useState<'user' | 'pet'>(
    profile?.profile_type?.toLowerCase() === 'pet' ? 'pet' : 'user',
  );
  const [gender, setGender] = useState(profile?.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    profile?.profile_picture_url || '',
  );
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  /* Debounced username check — skip if unchanged */
  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed || trimmed === profile?.username) {
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
  }, [username, checkUsername, profile?.username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Username cannot be empty.');
      return;
    }
    if (
      trimmedUsername !== profile?.username &&
      usernameAvailable === false
    ) {
      setError('Username is not available.');
      return;
    }

    let finalAvatarUrl = profilePictureUrl;

    /* Upload new profile picture if selected */
    if (profileFile) {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset =
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'petgo_preset';

      if (!cloudName) {
        setError(
          'Cloudinary is not configured. Please add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME to .env.local.',
        );
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', profileFile);
        formData.append('upload_preset', uploadPreset);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: 'POST', body: formData },
        );

        if (!uploadRes.ok) throw new Error('Failed to upload image');

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

    /* Build PATCH payload with ONLY fields that actually changed */
    const patchPayload: UpdateProfileBody = {};

    if (trimmedUsername !== (profile?.username || '')) {
      patchPayload.username = trimmedUsername;
    }

    const initialProfileType =
      profile?.profile_type?.toLowerCase() === 'pet' ? 'pet' : 'user';
    if (profileType !== initialProfileType) {
      patchPayload.profile_type = profileType;
    }

    if (gender !== (profile?.gender || '')) {
      patchPayload.gender = gender;
    }

    if (dateOfBirth !== (profile?.date_of_birth || '')) {
      patchPayload.date_of_birth = dateOfBirth;
    }

    if (finalAvatarUrl !== (profile?.profile_picture_url || '')) {
      patchPayload.profile_picture_url = finalAvatarUrl;
    }

    /* If no fields were changed, close modal without making an API request */
    if (Object.keys(patchPayload).length === 0) {
      onClose();
      return;
    }

    try {
      await updateProfile(patchPayload).unwrap();
      onClose();
    } catch (err) {
      const apiError = err as { data?: { detail?: string }; status?: number };
      setError(
        apiError?.data?.detail || 'Failed to update profile. Please try again.',
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[460px] max-h-[90vh] bg-[#181818] border border-white/10 rounded-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer bg-transparent border-none"
          >
            Cancel
          </button>
          <h2 className="text-base font-semibold text-white">Edit Profile</h2>
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={isLoading || isUploading}
            className="text-sm font-semibold text-[#F7941D] hover:text-[#e8871a] transition-colors cursor-pointer bg-transparent border-none disabled:opacity-50"
          >
            {isLoading || isUploading ? 'Saving…' : 'Done'}
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-5">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
            id="edit-profile-form"
          >
            {/* Profile Picture */}
            <div className="flex flex-col items-center justify-center mb-2">
              <label
                htmlFor="edit-profile-picture-upload"
                className="cursor-pointer group relative"
              >
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-200 ${
                    profilePictureUrl
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
                  id="edit-profile-picture-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setProfileFile(file);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        setProfilePictureUrl(
                          event.target?.result as string,
                        );
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="edit-profile-username"
                className="block text-sm text-white/60 mb-1.5 font-medium"
              >
                Username
              </label>
              <div className="relative">
                <input
                  id="edit-profile-username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\s/g, '').toLowerCase();
                    setUsername(val);
                    if (error) setError('');
                  }}
                  placeholder="Username"
                  autoComplete="off"
                  className={`w-full bg-[#101010] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#F7941D]/60 focus:ring-1 focus:ring-[#F7941D]/30 ${
                    usernameAvailable === false
                      ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30'
                      : 'border-white/10'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isCheckingUsername && (
                    <svg
                      className="animate-spin w-4 h-4 text-white/50"
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
                  )}
                  {!isCheckingUsername &&
                    usernameAvailable === true && (
                      <svg
                        className="w-5 h-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  {!isCheckingUsername &&
                    usernameAvailable === false &&
                    username.trim() !== '' && (
                      <svg
                        className="w-5 h-5 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    )}
                </div>
              </div>
              {!isCheckingUsername &&
                usernameAvailable === false &&
                username.trim() !== '' && (
                  <p className="text-red-400 text-xs mt-1.5">
                    This username is already taken.
                  </p>
                )}
            </div>

            {/* Profile Type */}
            <div>
              <label className="block text-sm text-white/60 mb-2 font-medium">
                Profile Type
              </label>
              <div className="flex gap-3">
                <button
                  id="edit-profile-type-user"
                  type="button"
                  onClick={() => setProfileType('user')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer ${
                    profileType === 'user'
                      ? 'bg-[#F7941D]/15 border-[#F7941D]/50 text-[#F7941D]'
                      : 'bg-[#101010] border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  🧑 User
                </button>
                <button
                  id="edit-profile-type-pet"
                  type="button"
                  onClick={() => setProfileType('pet')}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer ${
                    profileType === 'pet'
                      ? 'bg-[#F7941D]/15 border-[#F7941D]/50 text-[#F7941D]'
                      : 'bg-[#101010] border-white/10 text-white/50 hover:border-white/20'
                  }`}
                >
                  🐾 Pet
                </button>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="edit-profile-gender"
                className="block text-sm text-white/60 mb-1.5 font-medium"
              >
                Gender{' '}
                <span className="text-white/25 font-normal">(optional)</span>
              </label>
              <select
                id="edit-profile-gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#F7941D]/60 focus:ring-1 focus:ring-[#F7941D]/30 appearance-none cursor-pointer"
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="edit-profile-dob"
                className="block text-sm text-white/60 mb-1.5 font-medium"
              >
                Date of Birth{' '}
                <span className="text-white/25 font-normal">(optional)</span>
              </label>
              <input
                id="edit-profile-dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#F7941D]/60 focus:ring-1 focus:ring-[#F7941D]/30 [color-scheme:dark]"
              />
            </div>

            {/* Error */}
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
          </form>
        </div>
      </div>
    </div>
  );
}
