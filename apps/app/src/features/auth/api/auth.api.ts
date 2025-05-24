import {
  API_ENDPOINTS,
  HTTP_METHOD,
  RTK_QUERY_TAGS,
} from "../../../common/constants";
import { ApiSuccessResponse } from "../../../common/interfaces";
import { defaultTransformErrorResponse } from "../../../common/utils";

import { protectedApiSlice } from "../../../store/api/protected";
import { setUser } from "../store";

import type { IApiUserData } from "../types";

const authApiSlice = protectedApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<IApiUserData, void>({
      query: () => API_ENDPOINTS.USER.PROFILE,
      providesTags: [RTK_QUERY_TAGS.USER],
      onQueryStarted: async (_, api) => {
        const { data } = await api.queryFulfilled;
        api.dispatch(setUser(data));
      },
      transformResponse: (response: ApiSuccessResponse<IApiUserData>) => {
        return response.data;
      },
      transformErrorResponse: defaultTransformErrorResponse,
    }),

    updateUserProfile: builder.mutation<IApiUserData, Partial<IApiUserData>>({
      query: (profileData) => ({
        url: API_ENDPOINTS.USER.UPDATE_PROFILE,
        method: HTTP_METHOD.PATCH,
        body: profileData,
      }),
      invalidatesTags: [RTK_QUERY_TAGS.USER],
      transformResponse: (response: ApiSuccessResponse<IApiUserData>) => {
        return response.data;
      },
      transformErrorResponse: defaultTransformErrorResponse,
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: API_ENDPOINTS.AUTH.LOGOUT,
        method: HTTP_METHOD.POST,
      }),
      invalidatesTags: [
        RTK_QUERY_TAGS.USER,
        RTK_QUERY_TAGS.COURSE,
        RTK_QUERY_TAGS.CHALLENGE,
        RTK_QUERY_TAGS.ENVIRONMENT,
        RTK_QUERY_TAGS.PROGRESS,
      ],
      transformResponse: (
        response: ApiSuccessResponse<{ message: string }>
      ) => {
        return response.data;
      },
      transformErrorResponse: defaultTransformErrorResponse,
    }),
  }),
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useLogoutMutation,
} = authApiSlice;
