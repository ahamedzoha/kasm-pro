import { createApi } from "@reduxjs/toolkit/query/react";
import { protectedBaseQueryWithReauth } from "../../../store/api/base";
import { RTK_QUERY_TAG_TYPES } from "../../../store/constants";
import { IApiUserData } from "../types";

// Protected auth-specific API slice
export const protectedAuthApiSlice = createApi({
  reducerPath: "protectedAuthApi",
  baseQuery: protectedBaseQueryWithReauth,
  tagTypes: RTK_QUERY_TAG_TYPES,
  refetchOnMountOrArgChange: 30,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (builder) => ({
    // Get user profile
    getUserProfile: builder.query<
      { success: boolean; data: IApiUserData },
      void
    >({
      query: () => "/user/profile",
      providesTags: ["User"],
    }),

    // Update user profile
    updateUserProfile: builder.mutation<
      { success: boolean; data: IApiUserData },
      Partial<IApiUserData>
    >({
      query: (updates) => ({
        url: "/user/profile",
        method: "PATCH",
        body: updates,
      }),
      invalidatesTags: ["User"],
    }),

    // Logout
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

// Export hooks
export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useLogoutMutation,
} = protectedAuthApiSlice;
