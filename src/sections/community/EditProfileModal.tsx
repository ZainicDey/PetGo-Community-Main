'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, User, ChevronDown, Trash2 } from 'lucide-react';
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useCheckUsernameMutation,
  useDeletePetProfileMutation,
  type UpdateProfileBody,
} from '@/lib/store/services/usersApi';

interface EditProfileModalProps {
  onClose: () => void;
}

export default function EditProfileModal({ onClose }: EditProfileModalProps) {
  const { data: profile } = useGetProfileQuery();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [deletePetProfile, { isLoading: isDeleting }] = useDeletePetProfileMutation();
  const [checkUsername] = useCheckUsernameMutation();
  const router = useRouter();

  const [username, setUsername] = useState(profile?.username || '');
  const [profileType, setProfileType] = useState<'user' | 'pet'>(
    profile?.profile_type?.toLowerCase() === 'pet' ? 'pet' : 'user',
  );

  const isPresetPet = (pt?: string) => pt ? ['dog', 'cat', 'fish'].includes(pt.toLowerCase()) : false;
  const [petType, setPetType] = useState(
    isPresetPet(profile?.pet_type) ? profile!.pet_type!.toLowerCase() : (profile?.pet_type ? 'other' : 'dog')
  );
  const [isPetTypeOpen, setIsPetTypeOpen] = useState(false);
  const [customPetType, setCustomPetType] = useState(
    !isPresetPet(profile?.pet_type) && profile?.pet_type ? profile.pet_type : ''
  );

  const [gender, setGender] = useState(profile?.gender || '');
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(profile?.date_of_birth || '');
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    profile?.profile_picture_url || '',
  );
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const handleDeleteProfile = async () => {
    try {
      await deletePetProfile().unwrap();
      onClose();
      router.push('/community/profile');
    } catch (err) {
      const apiError = err as { data?: { detail?: string }; status?: number };
      setError(
        apiError?.data?.detail || 'Failed to delete profile. Please try again.',
      );
      setIsDeleteModalOpen(false);
    }
  };

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

    const finalPetType = petType === 'other' ? customPetType.trim() : petType;
    if (profileType === 'pet' && finalPetType !== (profile?.pet_type || '')) {
      patchPayload.pet_type = finalPetType;
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



            {/* Pet Type (Only shown if Profile Type is Pet) */}
            {profileType === 'pet' && (
              <>
                <div>
                  <label
                    htmlFor="edit-profile-pet-type"
                    className="block text-sm text-white/60 mb-1.5 font-medium"
                  >
                    Pet Type
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsPetTypeOpen(!isPetTypeOpen)}
                      className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#F7941D]/60 focus:ring-1 focus:ring-[#F7941D]/30 flex items-center justify-between"
                    >
                      <span className="capitalize">{petType}</span>
                      <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isPetTypeOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isPetTypeOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsPetTypeOpen(false)} />
                        <div className="absolute top-full left-0 w-full mt-2 bg-[#181818] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                          {['dog', 'cat', 'fish', 'other'].map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setPetType(type);
                                setIsPetTypeOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 capitalize ${
                                petType === type ? 'text-[#F7941D] bg-[#F7941D]/10' : 'text-white/80'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Custom Pet Type (if Other) */}
                {petType === 'other' && (
                  <div>
                    <label
                      htmlFor="edit-profile-custom-pet-type"
                      className="block text-sm text-white/60 mb-1.5 font-medium"
                    >
                      Specify Pet Type
                    </label>
                    <input
                      id="edit-profile-custom-pet-type"
                      type="text"
                      value={customPetType}
                      onChange={(e) => setCustomPetType(e.target.value)}
                      placeholder="e.g. Rabbit, Bird, Reptile"
                      className="w-full bg-[#101010] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#F7941D]/60 focus:ring-1 focus:ring-[#F7941D]/30"
                    />
                  </div>
                )}
              </>
            )}

            {/* Gender */}
            <div>
              <label
                htmlFor="edit-profile-gender"
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

            {/* Delete Pet Profile Button */}
            {profile?.profile_type?.toLowerCase() === 'pet' && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 active:scale-[0.98] cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Pet Profile
              </button>
            )}

            {/* Spacer for dropdowns to avoid clipping in the scroll container */}
            {(isPetTypeOpen || isGenderOpen) && <div className="h-15" />}
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div 
          className="fixed inset-0 z-[3000] flex items-center justify-center"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          {/* Animated backdrop */}
          <style>{`
            @keyframes deleteBackdropIn {
              from { opacity: 0; backdrop-filter: blur(0px); }
              to { opacity: 1; backdrop-filter: blur(8px); }
            }
            @keyframes deleteModalZoom {
              0% { opacity: 0; transform: scale(0.4); }
              50% { opacity: 1; transform: scale(1.03); }
              70% { transform: scale(0.97); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes deleteIconPulse {
              0% { opacity: 0; transform: scale(0); }
              60% { transform: scale(1.2); }
              100% { opacity: 1; transform: scale(1); }
            }
            @keyframes deleteTextSlide {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <div 
            className="absolute inset-0 bg-black/80"
            style={{ animation: 'deleteBackdropIn 0.3s ease-out forwards' }}
          />
          <div
            className="relative w-[90%] max-w-[320px] bg-[#181818] border border-white/10 rounded-2xl flex flex-col items-center p-6 text-center shadow-2xl"
            style={{ animation: 'deleteModalZoom 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4"
              style={{ animation: 'deleteIconPulse 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both' }}
            >
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 
              className="text-xl font-semibold text-white mb-2"
              style={{ animation: 'deleteTextSlide 0.35s ease-out 0.2s both' }}
            >
              Delete Profile?
            </h3>
            <p 
              className="text-sm text-white/60 mb-6"
              style={{ animation: 'deleteTextSlide 0.35s ease-out 0.28s both' }}
            >
              Are you sure you want to delete this pet profile? This action cannot be undone.
            </p>
            <div 
              className="flex gap-3 w-full"
              style={{ animation: 'deleteTextSlide 0.35s ease-out 0.35s both' }}
            >
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-white/10 bg-[#101010] text-white hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProfile}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
