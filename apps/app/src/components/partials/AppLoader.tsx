import React from "react";
import { useAppSelector } from "../../store/hooks";
import { selectGlobalLoading } from "../../store/slices/global.slice";

interface AppLoaderProps {
  isLoading?: boolean;
  element: React.ReactElement | null;
}

export const AppLoader: React.FC<AppLoaderProps> = ({
  isLoading: externalLoading,
  element,
}) => {
  const globalLoading = useAppSelector(selectGlobalLoading);

  // Show loading if either external loading or global loading is true
  const shouldShowLoading = externalLoading || globalLoading;

  if (shouldShowLoading) {
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
