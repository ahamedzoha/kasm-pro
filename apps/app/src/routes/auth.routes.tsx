import { RouteObject } from "react-router-dom";

import { AuthIndexPage } from "../pages/auth/index.page";
import { authPath } from "./paths/auth.path";

export const authRoutes = (): RouteObject[] => [
  {
    path: authPath.default,
    element: <AuthIndexPage />,
  },
  {
    path: authPath.login,
    index: true,
    element: <AuthIndexPage />, // You can create separate login component later
  },
  {
    path: authPath.register,
    element: <AuthIndexPage />, // You can create separate register component later
  },
];
