# Redux Toolkit & RTK Query Setup

This directory contains the Redux store configuration using the latest Redux Toolkit patterns with RTK Query for API management.

## Structure

```
store/
├── api/
│   ├── base.ts          # Base query configurations with token refresh
│   ├── public.ts        # Public API endpoints (login, register, etc.)
│   └── protected.ts     # Protected API base slice (can be extended)
├── slices/
│   ├── auth.slice.ts    # Authentication state management
│   └── global.slice.ts  # Global app state (loading, notifications, etc.)
├── constants.ts         # API endpoints, HTTP constants, etc.
├── hooks.ts            # Typed Redux hooks and re-exports
├── types.ts            # TypeScript type definitions
├── index.ts            # Store configuration
└── README.md           # This file
```

## Feature-Based API Structure

This setup follows a feature-based architecture where each feature can extend the base protected API slice:

```
features/
├── auth/
│   ├── api/
│   │   └── auth.api.ts      # Auth-specific API endpoints
│   ├── components/
│   ├── interfaces/
│   │   └── auth.interface.ts # Auth-specific types
│   ├── constants/
│   │   └── auth.constants.ts # Auth-specific constants
│   └── index.tsx            # Feature exports
├── common/
│   ├── constants/
│   │   └── index.ts         # Re-exported common constants
│   ├── interfaces/
│   │   └── index.ts         # Re-exported common types
│   └── utils/
│       ├── api.utils.ts     # API utility functions
│       └── index.ts         # Utility exports
```

## Key Features

### 🔐 Automatic Token Refresh

- Implements mutex-based token refresh to prevent concurrent refresh attempts
- Automatically retries failed requests after token refresh
- Logs out user if refresh fails

### 📡 RTK Query Integration with injectEndpoints

- **Base Protected API**: Core slice that can be extended by features
- **Feature APIs**: Use `injectEndpoints` to add feature-specific endpoints
- Cache invalidation using tags system
- Optimistic updates support

### 💾 Redux Persist

- Persists authentication state across browser sessions
- Configurable persistence with whitelist/blacklist

### 🎯 TypeScript Support

- Fully typed with strict TypeScript
- Type-safe hooks and selectors
- Proper error handling types

## Usage Examples

### Basic Setup

```tsx
// Wrap your app with the Redux provider
import { ReduxProvider } from "./providers/ReduxProvider";

function App() {
  return (
    <ReduxProvider>
      <YourAppComponents />
    </ReduxProvider>
  );
}
```

### Feature-Based API Extension

```tsx
// features/auth/api/auth.api.ts
import {
  API_ENDPOINTS,
  HTTP_METHOD,
  RTK_QUERY_TAGS,
} from "../../../common/constants";
import { ApiSuccessResponse } from "../../../common/interfaces";
import { defaultTransformErrorResponse } from "../../../common/utils";

import { protectedApiSlice } from "../../../store/api/protected";
import { setUser } from "../../../store/slices/auth.slice";

import type { IApiUserData } from "../interfaces/auth.interface";

const authApiSlice = protectedApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserProfile: builder.query<IApiUserData, void>({
      query: () => API_ENDPOINTS.USER.PROFILE,
      providesTags: [RTK_QUERY_TAGS.USER],
      onQueryStarted: async (_, api) => {
        const { data } = await api.queryFulfilled;
        api.dispatch(setUser(data.data));
      },
      transformResponse: (response: ApiSuccessResponse<IApiUserData>) => {
        return response.data;
      },
      transformErrorResponse: defaultTransformErrorResponse,
    }),
  }),
});

export const { useGetUserProfileQuery } = authApiSlice;
```

### Using Feature Hooks

```tsx
// Import from the feature
import { useGetUserProfileQuery } from "../features/auth";

function UserProfile() {
  const { data: user, isLoading, error } = useGetUserProfileQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;

  return <div>Welcome, {user?.firstName}!</div>;
}
```

### Manual Cache Updates

```tsx
import { useAppDispatch } from "./store/hooks";
import { protectedApiSlice } from "./store/api/protected";

function SomeComponent() {
  const dispatch = useAppDispatch();

  // Invalidate specific cache tags
  const invalidateUserData = () => {
    dispatch(protectedApiSlice.util.invalidateTags(["User"]));
  };

  // Update cache optimistically
  const updateUserCache = (userData) => {
    dispatch(
      protectedApiSlice.util.updateQueryData(
        "getUserProfile",
        undefined,
        (draft) => {
          Object.assign(draft, userData);
        }
      )
    );
  };
}
```

## Available Utilities

### API Transformations

- `camelToSnake()` - Convert camelCase to snake_case
- `snakeToCamel()` - Convert snake_case to camelCase
- `defaultTransformErrorResponse()` - Standard error response transformer

### Common Constants

- `API_ENDPOINTS` - All API endpoint URLs
- `HTTP_METHOD` - HTTP method constants
- `RTK_QUERY_TAGS` - Cache tag constants

## API Endpoints

### Public Endpoints (in store/api/public.ts)

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Password reset
- `POST /auth/verify-email` - Email verification

### Base Protected Endpoints (in store/api/protected.ts)

- `POST /auth/logout` - User logout

### Feature-Specific Endpoints

Each feature extends the base protected API with its own endpoints using `injectEndpoints`.

## Configuration

### Environment Variables

- `NODE_ENV` - Determines API base URL (development vs production)

### Constants

All API endpoints, HTTP methods, and other constants are defined in `constants.ts` and re-exported through `common/constants/index.ts`.

### Cache Behavior

- **refetchOnMountOrArgChange**: 30 seconds
- **refetchOnFocus**: true
- **refetchOnReconnect**: true

## Error Handling

The setup includes comprehensive error handling:

- Network errors
- Authentication errors (401) with automatic token refresh
- API errors with proper error types
- Fallback error states
- Standardized error transformers

## Best Practices

1. **Use feature-based APIs**: Each feature should have its own API slice using `injectEndpoints`
2. **Use typed hooks**: Always use `useAppSelector` and `useAppDispatch` instead of the plain Redux hooks
3. **Handle loading states**: RTK Query provides `isLoading`, `isFetching`, and `isError` states
4. **Use cache invalidation**: Properly invalidate cache tags after mutations
5. **Handle errors gracefully**: Always handle both network and API errors
6. **Transform data consistently**: Use the provided utility functions for data transformation
7. **Follow feature structure**: Maintain consistent directory structure across features

## Creating New Features

When creating a new feature:

1. Create the feature directory structure:

   ```
   features/yourFeature/
   ├── api/yourFeature.api.ts
   ├── components/
   ├── interfaces/yourFeature.interface.ts
   ├── constants/yourFeature.constants.ts
   └── index.tsx
   ```

2. Extend the protected API:

   ```tsx
   const yourFeatureApiSlice = protectedApiSlice.injectEndpoints({
     endpoints: (builder) => ({
       // Your endpoints here
     }),
   });
   ```

3. Export hooks and types from the feature index

## Migration from Old Redux

If migrating from older Redux patterns:

1. Replace `useSelector` with `useAppSelector`
2. Replace `useDispatch` with `useAppDispatch`
3. Replace manual API calls with RTK Query hooks
4. Update action creators to use RTK's `createSlice`
5. Remove manual loading/error state management (RTK Query handles this)
6. Move API endpoints to feature-based structure using `injectEndpoints`

## Performance Considerations

- RTK Query automatically deduplicates identical requests
- Cache is automatically managed with configurable TTL
- Mutations automatically invalidate related cache entries
- Background refetching keeps data fresh without blocking UI
- `injectEndpoints` allows code splitting at the feature level
