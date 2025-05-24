// API Base URL - update this based on your environment configuration
export const API_BASE_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:3000/api" : "/api";

// Store slice names
export const STORE_SLICES = {
  AUTH: "auth",
  GLOBAL: "global",
} as const;

// API slice names
export const API_SLICES = {
  PUBLIC_API: "publicApi",
  // Other API slices are now managed by their respective features
} as const;

// Redux Persist configuration
export const PERSIST_KEYS = {
  AUTH: "kasm-pro:auth",
  ROOT: "kasm-pro:root",
} as const;

// RTK Query tag types for cache invalidation
export const RTK_QUERY_TAG_TYPES = [
  "User",
  "Course",
  "Challenge",
  "Environment",
  "Progress",
] as const;

// RTK Query tags - individual tag constants
export const RTK_QUERY_TAGS = {
  USER: "User",
  COURSE: "Course",
  CHALLENGE: "Challenge",
  ENVIRONMENT: "Environment",
  PROGRESS: "Progress",
  THRESHOLD: "Threshold",
  CONFIGURATIONS: "Configurations",
} as const;

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH_TOKEN: "/auth/refresh",
    LOGOUT: "/auth/logout",
    VERIFY_EMAIL: "/auth/verify-email",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
  },
  USER: {
    PROFILE: "/user/profile",
    UPDATE_PROFILE: "/user/profile",
  },
  COURSE: {
    LIST: "/courses",
    DETAILS: "/courses/:id",
  },
  CHALLENGE: {
    LIST: "/challenges",
    DETAILS: "/challenges/:id",
    SUBMIT: "/challenges/:id/submit",
  },
  ENVIRONMENT: {
    CREATE: "/environments",
    DETAILS: "/environments/:id",
    DELETE: "/environments/:id",
  },
} as const;

// HTTP constants
export const HTTP_METHOD = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
} as const;

export const HTTP_STATUS_CODE = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
