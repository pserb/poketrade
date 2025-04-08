"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";
import api from "@/utils/api";

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  destroyAccount: () => Promise<void>;
}

// Define error response types
interface ApiErrorResponse {
  detail?: string;
  username?: string[];
  password?: string[];
  [key: string]: unknown;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      setIsLoading(true);
      const accessToken = Cookies.get("access_token");
      const username = Cookies.get("username");

      if (accessToken && username) {
        // You might want to validate the token here
        setUser({ username });
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await api.post("http://localhost:8000/token/", {
        username,
        password,
      });
      Cookies.set("access_token", response.data.access);
      Cookies.set("username", username);
      Cookies.set("refresh_token", response.data.refresh);
      setUser({ username });
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
    password: string
  ): Promise<void> => {
    try {
      await api.post("http://localhost:8000/user/create/", {
        username,
        password,
      });
      await login(username, password);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;

        if (axiosError.response?.data) {
          const errorData = axiosError.response.data;

          if (errorData.username?.[0]) {
            throw new Error(errorData.username[0]);
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

  const logout = (): void => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("username");
    setUser(null);
  };

  const destroyAccount = async (): Promise<void> => {
    try {
      await api.delete("http://localhost:8000/user/destroy/");
      logout();
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, destroyAccount }}
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
