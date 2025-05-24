import React from "react";
import { Ui } from "@kasm-pro/ui";

export const DashboardMain: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-teal-500 text-white">
      <h1 className="text-4xl font-bold text-amber-500">Dashboard</h1>
      <p className="mt-4 text-lg">Welcome to your learning environment!</p>
      <Ui />
    </div>
  );
};

export default DashboardMain;
