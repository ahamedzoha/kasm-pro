// Auth-specific types and interfaces

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IApiUserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isEmailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAuthSliceState {
  userData?: IApiUserData;
  accessToken?: string;
  refreshToken?: string;
}
