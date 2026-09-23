import { api } from './api';
import type {
  ApiPost,
  MediaItem,
  LikeResponse,
  RepostResponse,
  SaveResponse,
  UserBasicInfo,
} from '../types';

interface GetPostsParams {
  limit?: number;
  offset?: number;
}

interface CreatePostBody {
  content: string;
  media?: MediaItem[];
  quoted_post_id?: number;
}

export const postsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Feed / CRUD ── */
    getPosts: builder.query<ApiPost[], GetPostsParams | void>({
      query: (params) => ({
        url: '/posts/',
        params: params ?? { limit: 20, offset: 0 },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    getPostById: builder.query<ApiPost, number>({
      query: (postId) => `/posts/${postId}`,
      providesTags: (_r, _e, id) => [{ type: 'Post', id }],
    }),

    createPost: builder.mutation<ApiPost, CreatePostBody>({
      query: (body) => ({ url: '/posts/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),

    deletePost: builder.mutation<void, number>({
      query: (postId) => ({ url: `/posts/${postId}`, method: 'DELETE' }),
      async onQueryStarted(postId, { dispatch, queryFulfilled }) {
        // Optimistically remove from common feed configurations
        const patch1 = dispatch(
          postsApi.util.updateQueryData('getPosts', { limit: 20, offset: 0 }, (draft) => {
            const index = draft.findIndex((post) => post.id === postId);
            if (index !== -1) draft.splice(index, 1);
          })
        );
        const patch2 = dispatch(
          postsApi.util.updateQueryData('getPosts', { limit: 100, offset: 0 }, (draft) => {
            const index = draft.findIndex((post) => post.id === postId);
            if (index !== -1) draft.splice(index, 1);
          })
        );
        const patch3 = dispatch(
          postsApi.util.updateQueryData('getPosts', undefined, (draft) => {
            const index = draft.findIndex((post) => post.id === postId);
            if (index !== -1) draft.splice(index, 1);
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patch1.undo();
          patch2.undo();
          patch3.undo();
        }
      },
      invalidatesTags: (_r, _e, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    /* ── Likes ── */
    likePost: builder.mutation<LikeResponse, number>({
      query: (postId) => ({ url: `/posts/${postId}/like`, method: 'POST' }),
      invalidatesTags: (_r, _e, postId) => [
        { type: 'Post', id: postId },
        { type: 'Activity', id: 'LIST' },
      ],
    }),

    unlikePost: builder.mutation<void, number>({
      query: (postId) => ({ url: `/posts/${postId}/like`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, postId) => [
        { type: 'Post', id: postId },
        { type: 'Activity', id: 'LIST' },
      ],
    }),

    getPostLikes: builder.query<UserBasicInfo[], number>({
      query: (postId) => `/posts/${postId}/likes`,
    }),

    /* ── Reposts ── */
    repost: builder.mutation<RepostResponse, number>({
      query: (postId) => ({ url: `/posts/${postId}/repost`, method: 'POST' }),
      invalidatesTags: (_r, _e, postId) => [
        { type: 'Post', id: postId },
        { type: 'Activity', id: 'LIST' },
      ],
    }),

    undoRepost: builder.mutation<void, number>({
      query: (postId) => ({
        url: `/posts/${postId}/repost`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, postId) => [
        { type: 'Post', id: postId },
        { type: 'Activity', id: 'LIST' },
      ],
    }),

    getPostReposters: builder.query<UserBasicInfo[], number>({
      query: (postId) => `/posts/${postId}/reposters`,
    }),

    /* ── Saves ── */
    savePost: builder.mutation<SaveResponse, number>({
      query: (postId) => ({ url: `/posts/${postId}/save`, method: 'POST' }),
      invalidatesTags: (_r, _e, postId) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    unsavePost: builder.mutation<void, number>({
      query: (postId) => ({ url: `/posts/${postId}/save`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, postId) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useDeletePostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useGetPostLikesQuery,
  useRepostMutation,
  useUndoRepostMutation,
  useGetPostRepostersQuery,
  useSavePostMutation,
  useUnsavePostMutation,
} = postsApi;
