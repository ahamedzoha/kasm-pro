import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

import { publicAuthApiSlice } from "../features/auth/api/public.api";
import { protectedApiSlice } from "./api/protected";
import { authReducer } from "../features/auth/store";
import globalReducer from "./slices/global.slice";
import { PERSIST_KEYS, API_SLICES } from "./constants";

// Configure persistence for auth slice
const authPersistConfig = {
  key: PERSIST_KEYS.AUTH,
  storage,
  whitelist: ["accessToken", "refreshToken", "userData"], // Only persist these fields
};

// Create persisted auth reducer
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

// Combine all reducers
const rootReducer = combineReducers({
  // API slices
  [API_SLICES.PUBLIC_API]: publicAuthApiSlice.reducer,
  [API_SLICES.PROTECTED_API]: protectedApiSlice.reducer,

  // Feature slices
  auth: persistedAuthReducer,
  global: globalReducer,
});

// Configure the store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat([publicAuthApiSlice.middleware, protectedApiSlice.middleware]),
  devTools: process.env.NODE_ENV !== "production",
});

// Create persistor
export const persistor = persistStore(store);

// Set up listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Export types
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Default export
export default store;
