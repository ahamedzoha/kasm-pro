import { RouteObject, Navigate } from "react-router-dom";
import { authPath } from "./paths/auth.path";
import { dashboardPath } from "./paths/dashboard.path";

export const homeRoutes = (isAuthenticated: boolean = false): RouteObject[] => [
  {
    path: "/",
    element: isAuthenticated ? (
      <Navigate to={dashboardPath.default} replace />
    ) : (
      <Navigate to={authPath.default} replace />
    ),
  },
];
