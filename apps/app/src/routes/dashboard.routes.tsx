import { RouteObject } from "react-router-dom";

import { dashboardPath } from "./paths/dashboard.path";
import { DashboardIndexPage } from "../pages/dashboard/index.page";
import { DashboardLayout } from "../common/layouts/dashboardLayout.component";

export const dashboardRoutes = (): RouteObject[] => [
  {
    path: dashboardPath.default,
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <DashboardIndexPage />,
      },
      {
        path: dashboardPath.home,
        element: <DashboardIndexPage />,
      },
      {
        path: dashboardPath.settings,
        element: <DashboardIndexPage />,
      },
    ],
  },
];
