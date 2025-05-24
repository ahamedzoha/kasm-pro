// Auth API Barrel Export

// Protected API hooks (authenticated endpoints)
export {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useLogoutMutation,
} from "./auth.api";

// Public API hooks (unauthenticated endpoints)
export {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
} from "./public.api";

// Export the API slices themselves if needed
export { publicAuthApiSlice } from "./public.api";
