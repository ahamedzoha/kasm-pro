import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";
import { Mutex } from "async-mutex";
import {
  API_BASE_URL,
  HTTP_STATUS_CODE,
  HTTP_METHOD,
  API_ENDPOINTS,
} from "../constants";
import { setTokens, setUser, removeTokens } from "../../features/auth/store";
import { IAuthTokens, IApiUserData } from "../../features/auth/types";
import { RootState } from "../types";
import { ApiErrorResponse, ApiSuccessResponse } from "../../common/interfaces";

// Create a mutex to prevent concurrent refresh attempts
const mutex = new Mutex();

/**
 * Base query for public endpoints (no authentication required)
 */
export const publicBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

/**
 * Base query for protected endpoints with automatic token refresh
 */
const protectedBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState, endpoint }) => {
    const state = getState() as RootState;
    const accessToken = state.auth.accessToken;

    // Set default headers
    headers.set("Content-Type", "application/json");

    // Add authorization header if token exists and it's not an excluded endpoint
    const excludedEndpoints = ["login", "register", "refresh"];
    if (accessToken && !excludedEndpoints.includes(endpoint)) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    return headers;
  },
});

/**
 * Base query with automatic token refresh capability
 */
export const protectedBaseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError | ApiErrorResponse
> = async (args, api, extraOptions) => {
  // Wait until the mutex is available without locking it
  await mutex.waitForUnlock();

  let result = await protectedBaseQuery(args, api, extraOptions);

  // Check if we got a 401 Unauthorized error
  if (result.error && result.error.status === HTTP_STATUS_CODE.UNAUTHORIZED) {
    // Check if the mutex is already locked (another refresh is in progress)
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();

      try {
        const state = api.getState() as RootState;
        const refreshToken = state.auth.refreshToken;

        if (!refreshToken) {
          // No refresh token available, log out the user
          api.dispatch(removeTokens());
          return result;
        }

        // Attempt to refresh the token
        const refreshResult = await protectedBaseQuery(
          {
            url: API_ENDPOINTS.AUTH.REFRESH_TOKEN,
            method: HTTP_METHOD.POST,
            body: { refreshToken },
          },
          { ...api, endpoint: "refresh" },
          extraOptions
        );

        const refreshResponse = refreshResult.data as ApiSuccessResponse<{
          user: IApiUserData;
          tokens: IAuthTokens;
        }>;

        if (refreshResult.data && refreshResponse.success) {
          // Store the new tokens and user data
          api.dispatch(setTokens(refreshResponse.data.tokens));
          api.dispatch(setUser(refreshResponse.data.user));

          // Retry the original request with the new token
          result = await protectedBaseQuery(args, api, extraOptions);
        } else {
          // Refresh failed, log out the user
          api.dispatch(removeTokens());
        }
      } catch (error) {
        // Refresh failed, log out the user
        api.dispatch(removeTokens());
      } finally {
        // Always release the mutex
        release();
      }
    } else {
      // Wait for the current refresh to complete, then retry
      await mutex.waitForUnlock();
      result = await protectedBaseQuery(args, api, extraOptions);
    }
  }

  return result;
};
