import { api } from './api';
import type { ApiComment, CreateCommentBody } from '../types';

export const commentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /* ── Fetch top-level comments for a post (paginated) ── */
    getCommentsByPostId: builder.query<
      ApiComment[],
      { postId: number; limit?: number; offset?: number }
    >({
      query: ({ postId, limit = 10, offset = 0 }) =>
        `/comments/post/${postId}?limit=${limit}&offset=${offset}`,
      providesTags: (_result, _err, { postId }) => [
        { type: 'Comment', id: `POST-${postId}` },
      ],
    }),

    /* ── Fetch replies for a specific comment (paginated) ── */
    getCommentReplies: builder.query<
      ApiComment[],
      { commentId: number; limit?: number; offset?: number }
    >({
      query: ({ commentId, limit = 10, offset = 0 }) =>
        `/comments/${commentId}/replies?limit=${limit}&offset=${offset}`,
      providesTags: (_result, _err, { commentId }) => [
        { type: 'Comment', id: `REPLIES-${commentId}` },
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
        // Also invalidate parent's replies cache if this is a nested reply
        ...(arg.parent_id
          ? [{ type: 'Comment' as const, id: `REPLIES-${arg.parent_id}` }]
          : []),
      ],
    }),
  }),
});

export const {
  useGetCommentsByPostIdQuery,
  useGetCommentRepliesQuery,
  useLazyGetCommentRepliesQuery,
  useCreateCommentMutation,
} = commentsApi;
