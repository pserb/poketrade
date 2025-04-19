"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";
import api from "@/utils/api";
import { useToast } from "./ToastContext";

interface User {
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: (message?: string) => void;
  destroyAccount: () => Promise<void>;
  isTokenExpired: (error: unknown) => boolean;
}

// Define error response types
interface ApiErrorResponse {
  detail?: string;
  username?: string[];
  email?: string[];
  password?: string[];
  [key: string]: unknown;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      setIsLoading(true);
      const accessToken = Cookies.get("access_token");
      const username = Cookies.get("username");
      const email = Cookies.get("email");

      if (accessToken && username) {
        // You might want to validate the token here
        setUser({ username, email });
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Helper function to check if an error is due to an expired token
  const isTokenExpired = (error: unknown): boolean => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorResponse>;

      // Check for 401 Unauthorized or specific "token_not_valid" message
      if (axiosError.response?.status === 401) {
        return true;
      }

      // Check for specific JWT expired error message in the response
      if (axiosError.response?.data?.detail?.includes("token")) {
        return true;
      }
    }
    return false;
  };

  const login = async (username: string, email: string, password: string): Promise<void> => {
    try {
      const response = await api.post("http://localhost:8000/api/token/", {
        username,
        password,
      });
      Cookies.set("access_token", response.data.access);
      Cookies.set("username", username);
      Cookies.set("email", email);
      Cookies.set("refresh_token", response.data.refresh);
      setUser({ username, email });

      addToast({
        title: "Login Successful",
        description: `Welcome back, ${username}!`,
        variant: "success",
      });
    } catch (error) {
      // Type guard to check if it's an axios error
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;

          if (errorData.detail) {
            throw new Error(errorData.detail);
          }

          if (errorData.username?.[0]) {
            throw new Error(errorData.username[0]);
          }

          if (errorData.email?.[0]) {
            throw new Error(errorData.email[0]);
          }

          if (errorData.password?.[0]) {
            throw new Error(errorData.password[0]);
          }
        }
      }

      // Fallback error message
      throw new Error("Login failed. Please try again.");
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      await api.post("http://localhost:8000/api/user/create/", {
        username,
        email,
        password,
      });
      await login(username, email, password);

      addToast({
        title: "Registration Successful",
        description: "Your account has been created successfully!",
        variant: "success",
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;

          if (errorData.username?.[0]) {
            throw new Error(errorData.username[0]);
          }

          if (errorData.email?.[0]) {
            throw new Error(errorData.email[0]);
          }

          if (errorData.password?.[0]) {
            throw new Error(errorData.password[0]);
          }
        }
      }

      // Fallback error message
      throw new Error("Registration failed. Please try again.");
    }
  };

  const logout = (message?: string): void => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("username");
    Cookies.remove("email");
    setUser(null);

    if (message) {
      addToast({
        title: "Session Ended",
        description: message,
        variant: "info",
      });
    }
  };

  const destroyAccount = async (): Promise<void> => {
    try {
      await api.delete("http://localhost:8000/api/user/destroy/");

      addToast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
        variant: "info",
      });

      logout();
    } catch (error) {
      console.error("Failed to delete account:", error);

      addToast({
        title: "Error",
        description: "Failed to delete your account. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        destroyAccount,
        isTokenExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};