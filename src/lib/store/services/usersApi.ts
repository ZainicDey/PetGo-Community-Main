import { api } from './api';
import type {
  ApiUser,
  ApiProfile,
  ApiPost,
  UserBasicInfo,
  FollowResponse,
  ActivityItem,
} from '../types';

interface CreateProfileBody {
  username: string;
  profile_type: 'user' | 'pet';
  gender?: string;
  date_of_birth?: string;
  profile_picture_url?: string;
}

export interface UpdateProfileBody {
  username?: string;
  profile_type?: 'user' | 'pet' | string;
  gender?: string;
  date_of_birth?: string;
  profile_picture_url?: string;
}

interface CheckUsernameBody {
  username: string;
}

interface CheckUsernameResponse {
  available: boolean;
}

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Identity ── */
    getMe: builder.query<ApiUser, void>({
      query: () => '/users/me',
      providesTags: [{ type: 'User', id: 'ME' }],
    }),

    /* ── Profile ── */
    getProfile: builder.query<ApiProfile, void>({
      query: () => '/users/profile',
      providesTags: [{ type: 'Profile', id: 'ME' }],
    }),

    createProfile: builder.mutation<ApiProfile, CreateProfileBody>({
      query: (body) => ({ url: '/users/profile', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Profile', id: 'ME' },
        { type: 'User', id: 'ME' },
      ],
    }),

    updateProfile: builder.mutation<ApiProfile, UpdateProfileBody>({
      query: (body) => ({ url: '/users/profile', method: 'PATCH', body }),
      invalidatesTags: [
        { type: 'Profile', id: 'ME' },
        { type: 'User', id: 'ME' },
      ],
    }),

    checkUsername: builder.mutation<CheckUsernameResponse, CheckUsernameBody>({
      query: (body) => ({
        url: '/users/check-username',
        method: 'POST',
        body,
      }),
    }),

    /* ── Follows ── */
    followUser: builder.mutation<FollowResponse, number>({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Follow', id: 'LIST' }],
    }),

    unfollowUser: builder.mutation<void, number>({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Follow', id: 'LIST' }],
    }),

    getFollowers: builder.query<UserBasicInfo[], number>({
      query: (userId) => `/users/${userId}/followers`,
      providesTags: [{ type: 'Follow', id: 'LIST' }],
    }),

    getFollowing: builder.query<UserBasicInfo[], number>({
      query: (userId) => `/users/${userId}/following`,
      providesTags: [{ type: 'Follow', id: 'LIST' }],
    }),

    /* ── User content ── */
    getUserReposts: builder.query<ApiPost[], number>({
      query: (userId) => `/users/${userId}/reposts`,
    }),

    getUserLikes: builder.query<ApiPost[], number>({
      query: (userId) => `/users/${userId}/likes`,
    }),

    getUserActivity: builder.query<ActivityItem[], number>({
      query: (userId) => `/users/${userId}/activity`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Activity' as const, id })),
              { type: 'Activity', id: 'LIST' },
            ]
          : [{ type: 'Activity', id: 'LIST' }],
    }),

    searchUsers: builder.query<UserBasicInfo[], string>({
      query: (q) => `/search/users?q=${encodeURIComponent(q)}`,
    }),
  }),
});

export const {
  useGetMeQuery,
  useGetProfileQuery,
  useCreateProfileMutation,
  useUpdateProfileMutation,
  useCheckUsernameMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useGetUserRepostsQuery,
  useGetUserLikesQuery,
  useGetUserActivityQuery,
  useSearchUsersQuery,
} = usersApi;
