import { useAppSelector } from "../../hooks";

export const useGlobalLoadingSelector = () => {
  return useAppSelector((state) => state.global.globalLoading);
};

export const useIsOnlineSelector = () => {
  return useAppSelector((state) => state.global.isOnline);
};

export const useNotificationsSelector = () => {
  return useAppSelector((state) => state.global.notifications);
};
