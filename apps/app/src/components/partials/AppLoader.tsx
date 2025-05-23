import React from "react";

interface AppLoaderProps {
  isLoading: boolean;
  element: React.ReactElement | null;
}

export const AppLoader: React.FC<AppLoaderProps> = ({ isLoading, element }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return element;
};
