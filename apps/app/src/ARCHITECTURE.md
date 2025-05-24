# App Architecture Guidelines

## Overview

This document outlines the architectural patterns and separation of concerns established in the KASM-Pro React application.

## Feature-Based Architecture

### Feature Structure

Each feature should follow this standardized structure:

```
features/
├── feature-name/
│   ├── components/          # Feature-specific components
│   │   ├── ComponentName.tsx
│   │   └── index.ts        # Export all components
│   ├── hooks/              # Feature-specific hooks
│   │   ├── useFeatureName.ts
│   │   └── index.ts        # Barrel export for hooks
│   ├── api/                # Feature-specific API slices
│   │   ├── feature.api.ts
│   │   ├── public.api.ts (if needed)
│   │   └── index.ts        # Barrel export for API
│   ├── store/              # Feature-specific state
│   │   ├── feature.slice.ts
│   │   └── index.ts        # Barrel export for store
│   ├── types/              # Feature-specific types
│   │   ├── feature.types.ts
│   │   └── index.ts        # Barrel export for types
│   └── index.tsx           # ONLY exports React component
```

### Feature Public Interface

⚠️ **Critical: Feature Index ONLY Exports React Component**

For optimal **HMR (Hot Module Replacement) performance** and clean separation, the feature index should **ONLY export the React component**. Mixed exports hurt HMR efficiency and create unnecessary coupling.

**✅ Correct Pattern (HMR Optimized):**

```typescript
// features/feature-name/index.tsx - ONLY the React component
import { FeatureMainComponent } from "./components";

export const FeatureName = () => {
  return <FeatureMainComponent />;
};
```

**❌ Incorrect Pattern (Breaks HMR Efficiency):**

```typescript
// DON'T DO THIS - Hurts HMR performance
export const FeatureName = () => {
  /* ... */
};
export { useFeatureHook } from "./hooks"; // ❌ Mixed exports
export type { FeatureType } from "./types"; // ❌ Mixed exports
```

### Importing from Features

When other features need hooks, types, or APIs from a feature, import directly from the corresponding barrel exports:

**✅ Correct Imports:**

```typescript
// Import hooks from hooks barrel
import { useAuthFeature } from "../features/auth/hooks";

// Import types from types barrel
import type { IApiUserData } from "../features/auth/types";

// Import API hooks from API barrel
import { useLoginMutation } from "../features/auth/api";

// Import the React component from feature index
import { Auth } from "../features/auth";
```

**❌ Incorrect Imports:**

```typescript
// DON'T DO THIS - Breaks HMR and encapsulation
import { Auth, useAuthFeature, IApiUserData } from "../features/auth"; // ❌
```

### Why This Pattern?

1. **HMR Efficiency**: Changes to hooks don't trigger component re-renders unnecessarily
2. **Clean Separation**: Each concern has its own import path
3. **Better Performance**: Bundler can optimize imports more effectively
4. **Clear Intent**: Import path shows exactly what you're using

## State Management Patterns

### 1. Feature-Level Hooks

Features should provide abstracted hooks that hide store implementation details:

```typescript
// features/auth/hooks/useAuthFeature.ts
export const useAuthFeature = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const loginUser = async (credentials) => {
    // Handle login logic
  };

  return {
    isAuthenticated,
    loginUser,
    // ... other auth-specific functionality
  };
};
```

### 2. Global vs Feature State

- **Global State**: App-wide concerns (loading, notifications, online status)
- **Feature State**: Feature-specific data and UI state

### 3. API Organization

- Each feature manages its own API slices
- No global protected API slice
- Features register their API middleware in the store

## Component Ownership

### Global Components

Located in `src/components/`:

- App-wide UI components (AppLoader, Layout components)
- Shared utilities that don't belong to any specific feature

### Feature Components

Located in `src/features/[feature]/components/`:

- Components that are specific to a feature's domain
- **Should NEVER be imported directly by other features**
- Access through feature's public interface only

## Authentication Pattern

### Global Auth Hook

```typescript
// src/common/hooks/useAuth.hook.ts
export const useAuth = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  return {
    isAuthenticated,
    isLoading: false, // Can be enhanced for async auth checks
    user,
  };
};
```

### Feature Auth Hook

```typescript
// src/features/auth/hooks/useAuthFeature.ts
export const useAuthFeature = () => {
  // Provides auth-specific functionality
  // Abstracts store implementation details
};
```

## Loading State Management

### Global Loading

Use the global loading state for app-wide loading indicators:

```typescript
const dispatch = useAppDispatch();
dispatch(setGlobalLoading(true));
```

### Component Loading

The `AppLoader` component now integrates both external and global loading states:

```typescript
<AppLoader isLoading={routeLoading} element={element} />
```

## Best Practices

### 1. Separation of Concerns

- Features should not directly import from global store hooks
- Use feature-specific hooks to abstract store access
- Keep feature boundaries clear and well-defined
- **Feature index ONLY exports React components**

### 2. Consistent Exports

- Feature index exports **ONLY the React component**
- Use dedicated barrel exports (`hooks/index.ts`, `types/index.ts`, etc.) for other exports
- Import from specific barrels, not the feature index
- **Never mix React components with hooks/types in exports**

### 3. API Management

- Features own their API slices
- Register API middleware at the store level
- Use consistent naming patterns for API slices
- **Import API hooks from `./api` barrel, not feature index**

### 4. Type Safety

- Keep feature-specific types in dedicated `types/` folder with barrel export
- Import types from `./types` barrel when needed elsewhere
- Use strict TypeScript configuration

## Inter-Feature Communication

### ✅ Correct Way to Access Other Features

```typescript
// Use the global auth hook for auth state
import { useAuth } from "../common/hooks/useAuth.hook";

// Import feature-specific functionality from proper barrels
import { useAuthFeature } from "../features/auth/hooks";
import type { IApiUserData } from "../features/auth/types";
import { useLoginMutation } from "../features/auth/api";

// Import React component from feature index
import { Auth } from "../features/auth";

const Component = () => {
  const { isAuthenticated } = useAuth(); // ✅ Global auth state
  const { loginUser } = useAuthFeature(); // ✅ From hooks barrel
};
```

### ❌ Incorrect Way (Breaking HMR and Encapsulation)

```typescript
// DON'T DO THIS - Breaks HMR efficiency
import { Auth, useAuthFeature, IApiUserData } from "../features/auth"; // ❌

// DON'T DO THIS - Breaks encapsulation
import { AuthComponent } from "../features/auth/components"; // ❌
```

## Migration Guidelines

When creating new features:

1. Follow the established feature structure with dedicated barrels
2. **Feature index ONLY exports the React component**
3. Create separate barrel exports for hooks, types, API, etc.
4. Import from specific barrels, never from feature index for non-components
5. Keep internal components, types, and APIs organized in their respective folders

## Examples

### ✅ Good: Clean Feature Index (HMR Optimized)

```typescript
// features/dashboard/index.tsx - ONLY React component
import { DashboardMain } from "./components";

export const Dashboard = () => {
  return <DashboardMain />;
};
```

```typescript
// features/auth/index.tsx - ONLY React component
import AuthExample from "./components/AuthExample";

export const Auth = () => {
  return <AuthExample />;
};
```

### ✅ Good: Proper Barrel Exports

```typescript
// features/auth/hooks/index.ts
export { useAuthFeature } from "./useAuthFeature";

// features/auth/types/index.ts
export type { IApiUserData, IAuthTokens } from "./auth.types";

// features/auth/api/index.ts
export { useLoginMutation, protectedAuthApiSlice } from "./auth.api";
```

### ✅ Good: Proper Imports

```typescript
// Other features importing auth functionality
import { useAuthFeature } from "../features/auth/hooks"; // ✅
import type { IApiUserData } from "../features/auth/types"; // ✅
import { useLoginMutation } from "../features/auth/api"; // ✅
import { Auth } from "../features/auth"; // ✅
```

### ❌ Bad: Mixed Exports (Breaks HMR)

```typescript
// DON'T DO THIS - Hurts HMR performance
export const Feature = () => {
  /* ... */
};
export { useFeatureHook } from "./hooks"; // ❌ Mixed with component
export type { FeatureType } from "./types"; // ❌ Mixed with component
export { featureAPI } from "./api"; // ❌ Mixed with component
```
