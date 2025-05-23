import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useRoutes } from "react-router-dom";

import { AppLoader } from "../components/partials/AppLoader";
import { useAuth } from "../common/hooks/useAuth.hook";

import { authRoutes } from "./auth.routes";
import { dashboardRoutes } from "./dashboard.routes";
import { homeRoutes } from "./home.routes";
import { errorRoutes } from "./error.routes";
import { debugRoutes } from "./debug.routes";
import { authPath } from "./paths/auth.path";
import { dashboardPath } from "./paths/dashboard.path";

export const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Fix: Improved regex to match /auth and /auth/* paths
    const isAuthPage =
      location.pathname === authPath.default ||
      location.pathname.startsWith("/auth/");
    const isDashboardPage = location.pathname.startsWith("/dashboard");

    // Prevent navigation during loading
    if (isLoading) return;

    // Only redirect if user is authenticated and trying to access auth pages
    if (isAuthenticated && isAuthPage) {
      navigate(dashboardPath.default, { replace: true });
      return;
    }

    // Only redirect if user is not authenticated and trying to access protected pages
    if (!isAuthenticated && isDashboardPage) {
      navigate(authPath.default, { state: { from: location }, replace: true });
      return;
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  // Memoize route calculation to prevent unnecessary re-renders
  const allRoutes = useMemo(() => {
    // Always include both route sets, but let navigation logic handle access
    const routes = isAuthenticated ? [...dashboardRoutes()] : [...authRoutes()];

    return [
      ...homeRoutes(isAuthenticated),
      ...routes,
      ...debugRoutes(), // Always include debug routes for testing
      ...errorRoutes(),
    ];
  }, [isAuthenticated]);

  const element = useRoutes(allRoutes);

  return <AppLoader isLoading={isLoading} element={element} />;
};
