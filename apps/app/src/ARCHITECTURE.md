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

## Routing Architecture

### Routing Structure Overview

The application uses React Router v6 with a structured approach to route organization that supports authentication, role-based access, lazy loading, and maintainable path management.

```
src/routes/
├── routes.tsx              # Main routing component
├── auth.routes.tsx         # Authentication routes
├── dashboard.routes.tsx    # Protected dashboard routes
├── home.routes.tsx         # Public home/landing routes
├── error.routes.tsx        # Error handling routes (404, etc.)
├── debug.routes.tsx        # Development/testing routes
└── paths/                  # Path constants
    ├── auth.path.ts
    ├── dashboard.path.ts
    └── [feature].path.ts
```

### Route Definition Patterns

#### 1. Path Constants

**✅ Always define path constants in dedicated files:**

```typescript
// src/routes/paths/feature.path.ts
const defaultPath = "/feature-name";

export const featurePath = {
  default: defaultPath,
  subPage: `${defaultPath}/sub-page`,
  settings: `${defaultPath}/settings`,
  detail: `${defaultPath}/:id`,
} as const;
```

#### 2. Route Configuration

**✅ Use functional exports for route definitions:**

```typescript
// src/routes/feature.routes.tsx
import { RouteObject } from "react-router-dom";
import { featurePath } from "./paths/feature.path";
import { FeatureLayout } from "../common/layouts/FeatureLayout";
import { FeatureIndexPage } from "../pages/feature/index.page";

export const featureRoutes = (): RouteObject[] => [
  {
    path: featurePath.default,
    element: <FeatureLayout />,
    children: [
      {
        index: true,
        element: <FeatureIndexPage />,
      },
      {
        path: featurePath.subPage,
        element: <FeatureSubPage />,
      },
    ],
  },
];
```

#### 3. Authentication & Protected Routes

The application implements authentication-aware routing with automatic redirects:

```typescript
// src/routes/routes.tsx pattern
const allRoutes = useMemo(() => {
  const routes = isAuthenticated ? [...dashboardRoutes()] : [...authRoutes()];

  return [
    ...homeRoutes(isAuthenticated),
    ...routes,
    ...debugRoutes(), // Always include for development
    ...errorRoutes(),
  ];
}, [isAuthenticated]);
```

### Adding New Routes

#### Step 1: Create Path Constants

```typescript
// src/routes/paths/newFeature.path.ts
const defaultPath = "/new-feature";

export const newFeaturePath = {
  default: defaultPath,
  list: `${defaultPath}/list`,
  create: `${defaultPath}/create`,
  edit: `${defaultPath}/edit/:id`,
  view: `${defaultPath}/view/:id`,
} as const;
```

#### Step 2: Create Route Definitions

```typescript
// src/routes/newFeature.routes.tsx
import { RouteObject } from "react-router-dom";
import { Suspense, lazy } from "react";
import { newFeaturePath } from "./paths/newFeature.path";

// Lazy load components for performance
const NewFeatureIndexPage = lazy(
  () => import("../pages/newFeature/index.page")
);
const NewFeatureListPage = lazy(() => import("../pages/newFeature/list.page"));
const NewFeatureCreatePage = lazy(
  () => import("../pages/newFeature/create.page")
);

export const newFeatureRoutes = (): RouteObject[] => [
  {
    path: newFeaturePath.default,
    element: <NewFeatureLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteLoader />}>
            <NewFeatureIndexPage />
          </Suspense>
        ),
      },
      {
        path: newFeaturePath.list,
        element: (
          <Suspense fallback={<RouteLoader />}>
            <NewFeatureListPage />
          </Suspense>
        ),
      },
      {
        path: newFeaturePath.create,
        element: (
          <Suspense fallback={<RouteLoader />}>
            <NewFeatureCreatePage />
          </Suspense>
        ),
      },
    ],
  },
];
```

#### Step 3: Create Page Components

```typescript
// src/pages/newFeature/index.page.tsx
import { NewFeature } from "../../features/newFeature";

export const NewFeatureIndexPage = () => {
  return <NewFeature />;
};
```

#### Step 4: Create Layout (if needed)

```typescript
// src/common/layouts/NewFeatureLayout.tsx
import { Outlet } from "react-router-dom";
import { NewFeatureProvider } from "../../features/newFeature/context";

export const NewFeatureLayout = () => {
  return (
    <NewFeatureProvider>
      <div className="new-feature-layout">
        <NewFeatureNavigation />
        <main>
          <Outlet />
        </main>
      </div>
    </NewFeatureProvider>
  );
};
```

#### Step 5: Register Routes

```typescript
// src/routes/routes.tsx
import { newFeatureRoutes } from "./newFeature.routes";

const allRoutes = useMemo(() => {
  // Determine if user should have access to new feature
  const hasNewFeatureAccess =
    isAuthenticated && checkFeatureAccess("newFeature");

  const routes = isAuthenticated
    ? [...dashboardRoutes(), ...(hasNewFeatureAccess ? newFeatureRoutes() : [])]
    : [...authRoutes()];

  return [
    ...homeRoutes(isAuthenticated),
    ...routes,
    ...debugRoutes(),
    ...errorRoutes(),
  ];
}, [isAuthenticated, user?.permissions]);
```

### Route Types & Access Control

#### 1. Public Routes

- Accessible without authentication
- Examples: landing page, marketing pages
- Located in `home.routes.tsx`

#### 2. Authentication Routes

- For login, register, password reset
- Redirects authenticated users away
- Located in `auth.routes.tsx`

#### 3. Protected Routes

- Requires authentication
- Automatic redirect to auth if not logged in
- Located in feature-specific route files

#### 4. Role-Based Routes

- Requires specific user roles/permissions
- Dynamically added based on user capabilities

```typescript
// Example: Admin-only routes
const adminRoutes = (): RouteObject[] => [
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "users", element: <UserManagement /> },
      { path: "settings", element: <SystemSettings /> },
    ],
  },
];

// Add conditionally based on role
const routes = isAuthenticated
  ? [...dashboardRoutes(), ...(isAdmin ? adminRoutes() : [])]
  : [...authRoutes()];
```

### Route Context & State Management

#### Route-Specific Context

For routes that need shared state across child routes:

```typescript
// src/features/newFeature/context/NewFeatureContext.tsx
export const NewFeatureProvider = ({ children }: PropsWithChildren) => {
  const [state, setState] = useState<NewFeatureState>({});

  const contextValue = useMemo(
    () => ({
      state,
      setState,
      // Route-specific methods
    }),
    [state]
  );

  return (
    <NewFeatureContext.Provider value={contextValue}>
      {children}
    </NewFeatureContext.Provider>
  );
};

export const useNewFeatureContext = () => {
  const context = useContext(NewFeatureContext);
  if (!context) {
    throw new Error(
      "useNewFeatureContext must be used within NewFeatureProvider"
    );
  }
  return context;
};
```

### Error Handling & 404 Pages

#### Error Boundaries for Routes

```typescript
// Wrap route sections with error boundaries
{
  path: featurePath.default,
  element: (
    <ErrorBoundary fallback={<FeatureErrorPage />}>
      <FeatureLayout />
    </ErrorBoundary>
  ),
  children: [...]
}
```

#### 404 Handling

The application uses a centralized 404 handling pattern:

```typescript
// src/routes/error.routes.tsx
export const errorRoutes = (): RouteObject[] => [
  {
    path: "/404",
    element: <NotFoundPage />,
  },
  {
    path: "*", // Catch-all route
    element: <Navigate to="/404" replace />,
  },
];
```

### Performance Optimization

#### 1. Lazy Loading

```typescript
// Use React.lazy for code splitting
const FeatureComponent = lazy(() => import("../pages/feature/Component"));

// Wrap with Suspense
<Suspense fallback={<RouteLoader />}>
  <FeatureComponent />
</Suspense>;
```

#### 2. Route Memoization

```typescript
// Memoize expensive route calculations
const allRoutes = useMemo(() => {
  // Complex route logic here
}, [dependencies]);
```

#### 3. Navigation Guards

```typescript
// Prevent unnecessary navigation during loading
useEffect(() => {
  if (isLoading) return; // Wait for auth check

  // Navigation logic
}, [isAuthenticated, isLoading, location.pathname, navigate]);
```

### Development & Debug Routes

For development and testing purposes:

```typescript
// src/routes/debug.routes.tsx
export const debugRoutes = (): RouteObject[] => [
  {
    path: "/test",
    element: <TestRoute />, // For testing routing
  },
  {
    path: "/debug",
    element: <DebugInfo />, // Debug information
  },
];
```

### Route Maintenance

#### 1. Regular Audits

- Review unused routes and remove them
- Check for hardcoded paths and replace with constants
- Validate permission requirements

#### 2. Path Refactoring

- Update path constants when URLs change
- Maintain backward compatibility with redirects
- Update any deep links in documentation

#### 3. Performance Monitoring

- Monitor route bundle sizes
- Check loading times for lazy-loaded routes
- Optimize imports and dependencies

#### 4. Testing Routes

```typescript
// Route testing helper
const renderWithRouter = (
  component: React.ReactElement,
  initialPath = "/",
  authState = { isAuthenticated: false }
) => {
  return render(
    <BrowserRouter>
      <Provider store={createTestStore(authState)}>{component}</Provider>
    </BrowserRouter>
  );
};

// Test route access
test("redirects unauthenticated users to auth", () => {
  renderWithRouter(<AppRoutes />, "/dashboard");
  expect(screen.getByRole("heading")).toHaveTextContent("Login");
});
```

### Route Naming Conventions

- **Route Files**: `featureName.routes.tsx`
- **Path Files**: `featureName.path.ts`
- **Page Files**: `descriptiveName.page.tsx`
- **Layout Files**: `FeatureNameLayout.tsx`
- **Context Files**: `FeatureNameContext.tsx`

### Best Practices

1. **Always use path constants** - Never hardcode routes
2. **Implement lazy loading** for performance
3. **Use route-specific contexts** for shared state
4. **Add error boundaries** to route sections
5. **Test route access** and navigation flows
6. **Document route purposes** and requirements
7. **Implement proper loading states** for transitions
8. **Use type-safe navigation** with path constants
