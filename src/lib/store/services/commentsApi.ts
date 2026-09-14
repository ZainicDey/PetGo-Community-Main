import { api } from './api';
import type { ApiComment, CreateCommentBody } from '../types';

export const commentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Fetch nested comments for a post ── */
    getCommentsByPostId: builder.query<ApiComment[], number>({
      query: (postId) => `/comments/post/${postId}`,
      providesTags: (_result, _err, postId) => [
        { type: 'Comment', id: `POST-${postId}` },
      ],
    }),

    /* ── Create a top-level comment or nested reply ── */
    createComment: builder.mutation<ApiComment, CreateCommentBody>({
      query: (body) => ({
        url: '/comments/',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Comment', id: `POST-${arg.post_id}` },
        { type: 'Post', id: arg.post_id },
      ],
    }),
  }),
});

export const {
  useGetCommentsByPostIdQuery,
  useCreateCommentMutation,
} = commentsApi;
