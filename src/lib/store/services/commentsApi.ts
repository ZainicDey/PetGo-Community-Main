import { api } from './api';
import type { ApiComment, CreateCommentBody, UpdateCommentBody } from '../types';

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
        ...(arg.parent_id
          ? [{ type: 'Comment' as const, id: `REPLIES-${arg.parent_id}` }]
          : []),
      ],
    }),

    /* ── Update a comment ── */
    updateComment: builder.mutation<
      ApiComment,
      { commentId: number; body: UpdateCommentBody }
    >({
      query: ({ commentId, body }) => ({
        url: `/comments/${commentId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result) => result ? [
        { type: 'Comment', id: `POST-${result.post_id}` },
        ...(result.parent_id ? [{ type: 'Comment' as const, id: `REPLIES-${result.parent_id}` }] : [])
      ] : [],
    }),

    /* ── Delete a comment ── */
    deleteComment: builder.mutation<
      void,
      { commentId: number; postId: number; parentId: number | null }
    >({
      query: ({ commentId }) => ({
        url: `/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Comment', id: `POST-${arg.postId}` },
        { type: 'Post', id: arg.postId },
        ...(arg.parentId ? [{ type: 'Comment' as const, id: `REPLIES-${arg.parentId}` }] : [])
      ],
    }),
  }),
});

export const {
  useGetCommentsByPostIdQuery,
  useGetCommentRepliesQuery,
  useLazyGetCommentRepliesQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentsApi;
