import { useAppSelector } from "../../../store/hooks";

export const useAuthUserSelector = () => {
  return useAppSelector((state) => state.auth.userData);
};

export const useAccessTokenSelector = () => {
  return useAppSelector((state) => state.auth.accessToken);
};

export const useRefreshTokenSelector = () => {
  return useAppSelector((state) => state.auth.refreshToken);
};

export const useIsAuthenticatedSelector = () => {
  return useAppSelector(
    (state) => !!state.auth.accessToken && !!state.auth.userData
  );
};
