import { RouteObject } from "react-router-dom";

// Debug components for testing
const TestRoute = () => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold text-green-600">
      ✅ Test Route Working!
    </h1>
    <p className="mt-4 text-gray-600">
      Routing system is functioning correctly.
    </p>
  </div>
);

const DebugInfo = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Debug Information</h1>
    <div className="bg-gray-100 p-4 rounded">
      <p>
        <strong>Current Path:</strong> {window.location.pathname}
      </p>
      <p>
        <strong>Current Search:</strong> {window.location.search}
      </p>
      <p>
        <strong>Current Hash:</strong> {window.location.hash}
      </p>
    </div>
  </div>
);

export const debugRoutes = (): RouteObject[] => [
  {
    path: "/test",
    element: <TestRoute />,
  },
  {
    path: "/debug",
    element: <DebugInfo />,
  },
];
