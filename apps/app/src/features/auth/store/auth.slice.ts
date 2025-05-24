import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAuthSliceState, IAuthTokens, IApiUserData } from "../types";
import { STORE_SLICES } from "../../../store/constants";

const initialState: IAuthSliceState = {
  userData: undefined,
  accessToken: undefined,
  refreshToken: undefined,
};

export const authSlice = createSlice({
  name: STORE_SLICES.AUTH,
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IApiUserData | undefined>) => {
      state.userData = action.payload;
    },
    setTokens: (state, action: PayloadAction<IAuthTokens>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    removeTokens: (state) => {
      state.accessToken = undefined;
      state.refreshToken = undefined;
      state.userData = undefined;
    },
    updateUser: (state, action: PayloadAction<Partial<IApiUserData>>) => {
      if (state.userData) {
        state.userData = { ...state.userData, ...action.payload };
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { setUser, setTokens, removeTokens, updateUser } =
  authSlice.actions;

// Selectors
export const selectAuthUser = (state: { auth: IAuthSliceState }) =>
  state.auth.userData;
export const selectAccessToken = (state: { auth: IAuthSliceState }) =>
  state.auth.accessToken;
export const selectRefreshToken = (state: { auth: IAuthSliceState }) =>
  state.auth.refreshToken;
export const selectIsAuthenticated = (state: { auth: IAuthSliceState }) =>
  !!state.auth.accessToken && !!state.auth.userData;

export default authSlice.reducer;
