import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import { clearToken } from '../slices/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Wraps fetchBaseQuery to intercept 401 Unauthorized responses.
 * On 401, clears the stored auth token and redirects to /login.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    // 401 Unauthorized — clear token and redirect to login
    if (result.error.status === 401) {
      api.dispatch(clearToken());

      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional hard nav from non-React RTK Query context
        window.location.href = '/login';
      }
    }

    // 403 Forbidden — redirect to profile setup if the backend requires a social profile
    if (result.error.status === 403) {
      const detail =
        (result.error.data as { detail?: string } | undefined)?.detail ?? '';
      if (detail.toLowerCase().includes('profile')) {
        if (typeof window !== 'undefined') {
          // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional hard nav to profile setup
          window.location.href = '/complete-profile';
        }
      }
    }
  }

  return result;
};

/**
 * Base RTK Query API instance for PetGo Community.
 * All feature-specific endpoints are injected via `api.injectEndpoints()`.
 * Never create a second `createApi` — always inject into this one.
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Profile', 'Post', 'Comment', 'Follow', 'Activity', 'SwitchableProfiles'],
  endpoints: () => ({}),
});
