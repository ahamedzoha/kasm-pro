import { Outlet } from "react-router-dom";

export const DashboardLayout = () => {
  return (
    <div className="">
      {/* Top nav bar */}
      {/* Sidebar */}
      {/* Main content area */}
      {/* Footer */}
      <div className="flex flex-col items-center justify-center h-screen bg-teal-500 text-white">
        <h1 className="text-4xl font-bold text-amber-500">Layout</h1>
        <Outlet />
      </div>
    </div>
  );
};
