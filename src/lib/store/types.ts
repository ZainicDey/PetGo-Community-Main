/* ── Shared API response types matching the PetGo Community FastAPI backend ── */

export interface MediaItem {
  url: string;
  media_type: string;
  public_id?: string;
}

export interface ApiPost {
  id: number;
  author_id: number;
  author?: {
    id: number;
    username: string;
    profile_picture_url?: string;
    is_followed?: boolean;
    follower_count?: number;
    profile_type?: string;
    pet_type?: string;
  };
  content: string;
  media: MediaItem[];
  created_at: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  is_liked?: boolean;
  is_reposted?: boolean;
  is_saved?: boolean;
  quoted_post_id?: number | null;
  quoted_post?: ApiPost | null;
  reposter?: {
    id: number;
    username: string;
    profile_picture_url?: string;
    is_followed?: boolean;
  } | null;
}

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  has_social_profile: boolean;
}

export interface ApiProfile {
  id: number;
  user_id: number;
  profile_type: string;
  gender?: string;
  pet_type?: string;
  date_of_birth?: string;
  username: string;
  profile_picture_url?: string;
  follower_count?: number;
}

export interface UserBasicInfo {
  id: number;
  username: string;
  profile_picture_url?: string;
}

export interface LikeResponse {
  id: number;
  post_id: number;
  user_id: number;
  created_at: string;
}

export interface SaveResponse {
  id: number;
  post_id: number;
  user_id: number;
  created_at: string;
}

export interface RepostResponse {
  id: number;
  post_id: number;
  user_id: number;
  created_at: string;
}

export interface FollowResponse {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: string;
}

export interface ApiComment {
  id: number;
  post_id: number;
  author_id: number;
  author?: {
    id: number;
    username: string;
    profile_picture_url?: string;
    is_followed?: boolean;
    follower_count?: number;
  };
  parent_id: number | null;
  content: string;
  image_url: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  replies_count: number;
}

export interface CreateCommentBody {
  post_id: number;
  parent_id?: number | null;
  content: string;
  image_url?: string | null;
}

export interface UpdateCommentBody {
  content: string;
  image_url?: string | null;
}

export interface ActivityItem {
  id: string;
  type: 'like' | 'repost';
  post: ApiPost;
  timestamp: string;
}

/* ── Pet Profile Switching types ── */

/** A single switchable profile (owner or pet) */
export interface SwitchableProfile {
  user_id: number;
  username: string;
  profile_type: 'user' | 'pet';
  profile_picture_url?: string;
  is_owner: boolean;
}

/** Response from GET /users/switchable-profiles */
export interface SwitchableProfilesResponse {
  active_profile_id: number;
  profiles: SwitchableProfile[];
}

/** Response from POST /users/switch-profile */
export interface SwitchProfileResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    profile_type: string;
  };
}

/** Body for POST /users/pet-profile */
export interface CreatePetProfileBody {
  username: string;
  gender?: string;
  pet_type?: string;
  date_of_birth?: string;
  profile_picture_url?: string;
}
