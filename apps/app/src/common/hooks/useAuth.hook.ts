import { useState } from "react";

// Simple auth hook - you can enhance this with real authentication logic later
export const useAuth = () => {
  // Temporarily set to false to test auth routes
  // Change this to true to test dashboard routes
  const [isAuthenticated] = useState(false);
  const [isLoading] = useState(false);

  return {
    isAuthenticated,
    isLoading,
  };
};
