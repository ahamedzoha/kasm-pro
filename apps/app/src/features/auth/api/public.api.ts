import { createApi } from "@reduxjs/toolkit/query/react";
import { publicBaseQuery } from "../../../store/api/base";
import {
  API_SLICES,
  API_ENDPOINTS,
  HTTP_METHOD,
} from "../../../common/constants";
import { IAuthTokens, IApiUserData } from "../types";
import { ApiSuccessResponse } from "../../../common/interfaces";

// Public API slice for unauthenticated auth endpoints
export const publicAuthApiSlice = createApi({
  reducerPath: API_SLICES.PUBLIC_API,
  baseQuery: publicBaseQuery,
  endpoints: (builder) => ({
    // Login endpoint
    login: builder.mutation<
      ApiSuccessResponse<{
        user: IApiUserData;
        tokens: IAuthTokens;
      }>,
      {
        email: string;
        password: string;
      }
    >({
      query: (credentials) => ({
        url: API_ENDPOINTS.AUTH.LOGIN,
        method: HTTP_METHOD.POST,
        body: credentials,
      }),
    }),

    // Registration endpoint
    register: builder.mutation<
      ApiSuccessResponse<{
        user: IApiUserData;
        tokens: IAuthTokens;
      }>,
      {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
      }
    >({
      query: (userData) => ({
        url: API_ENDPOINTS.AUTH.REGISTER,
        method: HTTP_METHOD.POST,
        body: userData,
      }),
    }),

    // Forgot password endpoint
    forgotPassword: builder.mutation<
      ApiSuccessResponse<{ message: string }>,
      { email: string }
    >({
      query: (data) => ({
        url: API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        method: HTTP_METHOD.POST,
        body: data,
      }),
    }),

    // Reset password endpoint
    resetPassword: builder.mutation<
      ApiSuccessResponse<{ message: string }>,
      {
        token: string;
        password: string;
      }
    >({
      query: (data) => ({
        url: API_ENDPOINTS.AUTH.RESET_PASSWORD,
        method: HTTP_METHOD.POST,
        body: data,
      }),
    }),

    // Email verification endpoint
    verifyEmail: builder.mutation<
      ApiSuccessResponse<{ message: string }>,
      { token: string }
    >({
      query: (data) => ({
        url: API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        method: HTTP_METHOD.POST,
        body: data,
      }),
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
} = publicAuthApiSlice;
