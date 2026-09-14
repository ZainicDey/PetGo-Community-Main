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
    profile_type?: string;
  };
  content: string;
  media: MediaItem[];
  created_at: string;
  likes_count: number;
  comments_count: number;
  reposts_count: number;
  is_liked?: boolean;
  is_reposted?: boolean;
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
  };
  parent_id: number | null;
  content: string;
  created_at: string;
  replies: ApiComment[];
}

export interface CreateCommentBody {
  post_id: number;
  parent_id?: number | null;
  content: string;
}

export interface ActivityItem {
  id: string;
  type: 'like' | 'repost';
  post: ApiPost;
  timestamp: string;
}
