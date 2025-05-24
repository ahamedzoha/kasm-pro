import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import {
  selectIsAuthenticated,
  selectAuthUser,
  selectAccessToken,
  selectRefreshToken,
  setTokens,
  setUser,
  removeTokens,
  updateUser,
} from "../store";
import { useLoginMutation, useRegisterMutation } from "../api";
import { useLogoutMutation, useGetUserProfileQuery } from "../api";

/**
 * Feature-level auth hook that provides auth-specific functionality
 * This abstracts the store implementation details from components
 */
export const useAuthFeature = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);
  const accessToken = useAppSelector(selectAccessToken);
  const refreshToken = useAppSelector(selectRefreshToken);

  // API hooks
  const [login, loginState] = useLoginMutation();
  const [register, registerState] = useRegisterMutation();
  const [logout, logoutState] = useLogoutMutation();

  // Profile query (only when authenticated)
  const profileQuery = useGetUserProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  // Action helpers
  const loginUser = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      const result = await login(credentials).unwrap();
      if (result.success) {
        dispatch(setTokens(result.data.tokens));
        dispatch(setUser(result.data.user));
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const registerUser = async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      const result = await register(userData).unwrap();
      if (result.success) {
        dispatch(setTokens(result.data.tokens));
        dispatch(setUser(result.data.user));
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error("Logout API failed:", error);
    } finally {
      dispatch(removeTokens());
    }
  };

  const updateUserProfile = (updates: Partial<typeof user>) => {
    if (user) {
      dispatch(updateUser({ ...user, ...updates }));
    }
  };

  return {
    // State
    isAuthenticated,
    user,
    accessToken,
    refreshToken,

    // Loading states
    isLoginLoading: loginState.isLoading,
    isRegisterLoading: registerState.isLoading,
    isLogoutLoading: logoutState.isLoading,
    isProfileLoading: profileQuery.isLoading,

    // Actions
    loginUser,
    registerUser,
    logoutUser,
    updateUserProfile,

    // Raw API states (for advanced usage)
    loginState,
    registerState,
    logoutState,
    profileQuery,
  };
};
