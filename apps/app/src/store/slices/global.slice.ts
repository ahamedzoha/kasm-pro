import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { STORE_SLICES } from "../constants";

export interface IGlobalSliceState {
  globalLoading: boolean;
  isOnline: boolean;
  notifications: Array<{
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
    timestamp: number;
  }>;
}

const initialState: IGlobalSliceState = {
  globalLoading: false,
  isOnline: navigator.onLine,
  notifications: [],
};

export const globalSlice = createSlice({
  name: STORE_SLICES.GLOBAL,
  initialState,
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    addNotification: (
      state,
      action: PayloadAction<
        Omit<IGlobalSliceState["notifications"][0], "id" | "timestamp">
      >
    ) => {
      const notification = {
        ...action.payload,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

// Action creators
export const {
  setGlobalLoading,
  setOnlineStatus,
  addNotification,
  removeNotification,
  clearNotifications,
} = globalSlice.actions;

// Selectors
export const selectGlobalLoading = (state: { global: IGlobalSliceState }) =>
  state.global.globalLoading;
export const selectIsOnline = (state: { global: IGlobalSliceState }) =>
  state.global.isOnline;
export const selectNotifications = (state: { global: IGlobalSliceState }) =>
  state.global.notifications;

export default globalSlice.reducer;
