import { createApi } from "@reduxjs/toolkit/query/react";
import { protectedBaseQueryWithReauth } from "./base";
import { API_SLICES, RTK_QUERY_TAG_TYPES } from "../constants";

// Protected API slice for authenticated endpoints - base slice that can be extended
export const protectedApiSlice = createApi({
  reducerPath: API_SLICES.PROTECTED_API,
  baseQuery: protectedBaseQueryWithReauth,
  tagTypes: RTK_QUERY_TAG_TYPES,
  refetchOnMountOrArgChange: 30, // Refetch if data is older than 30 seconds
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
