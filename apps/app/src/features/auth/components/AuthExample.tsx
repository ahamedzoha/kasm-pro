import React, { useState } from "react";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import {
  selectIsAuthenticated,
  selectAuthUser,
  setTokens,
  setUser,
  removeTokens,
} from "../store";
import { useLogoutMutation } from "../api/auth.api";
import { useLoginMutation } from "../api/public.api";

export const AuthExample: React.FC = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectAuthUser);

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();

      if (result.success) {
        // Store tokens and user data
        dispatch(setTokens(result.data.tokens));
        dispatch(setUser(result.data.user));
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      // Clear tokens and user data
      dispatch(removeTokens());
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear tokens anyway on error
      dispatch(removeTokens());
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">
          Welcome, {user.firstName || user.email}!
        </h2>
        <p className="text-gray-600 mb-4">You are successfully logged in.</p>
        <button
          onClick={handleLogout}
          disabled={isLogoutLoading}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {isLogoutLoading ? "Logging out..." : "Logout"}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoginLoading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoginLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default AuthExample;
