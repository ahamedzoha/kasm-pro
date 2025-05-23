import { RouteObject, Navigate } from "react-router-dom";
import { dashboardPath } from "./paths/dashboard.path";

// Simple 404 component - you can enhance this later
const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-800">
    <h1 className="text-6xl font-bold text-red-500">404</h1>
    <p className="text-xl mt-4">Page not found</p>
    <button
      onClick={() => (window.location.href = dashboardPath.default)}
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Go to Dashboard
    </button>
  </div>
);

export const errorRoutes = (): RouteObject[] => [
  {
    path: "/404",
    element: <NotFoundPage />,
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];
