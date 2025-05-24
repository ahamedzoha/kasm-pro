// Auth-specific constants
export const AUTH_VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

export const AUTH_MESSAGES = {
  LOGIN_SUCCESS: "Successfully logged in",
  LOGIN_FAILED: "Invalid email or password",
  REGISTER_SUCCESS: "Account created successfully",
  LOGOUT_SUCCESS: "Successfully logged out",
  PASSWORD_RESET_SENT: "Password reset email sent",
} as const;
