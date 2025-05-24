import { useAppSelector } from "../../store/hooks";
import {
  // selectIsAuthenticated,
  selectAuthUser,
} from "../../features/auth/store";

// Simple auth hook - you can enhance this with real authentication logic later
export const useAuth = () => {
  // TODO: Reactivate this once we have real authentication logic
  // const isAuthenticated = useAppSelector(selectIsAuthenticated);
  // TODO: Remove this once we have real authentication logic
  const isAuthenticated = true;
  const user = useAppSelector(selectAuthUser);

  // For now, we'll consider loading as false since we don't have async auth checks
  // This can be enhanced later when we add token validation or refresh logic
  const isLoading = false;

  return {
    isAuthenticated,
    isLoading,
    user,
  };
};
