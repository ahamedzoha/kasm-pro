// Auth API Barrel Export

// Protected API hooks (authenticated endpoints)
export {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useLogoutMutation,
  protectedAuthApiSlice,
} from "./auth.api";

// Public API hooks (unauthenticated endpoints)
export {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  publicAuthApiSlice,
} from "./public.api";
