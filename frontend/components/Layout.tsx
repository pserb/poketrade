"use client";

import { useAuth } from "@/contexts/AuthContext";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import DashboardSkeleton from "./DashboardSkeleton";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Use this effect to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until after client-side hydration
  if (!mounted) {
    return null;
  }

  // When loading, show the appropriate skeleton based on what we know so far
  if (isLoading) {
    // If we have a user cookie, show the dashboard skeleton
    if (user) {
      return <DashboardSkeleton />;
    }

    // Otherwise show login skeleton
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3 mb-8">
            <div className="h-10 w-64 skeleton rounded mx-auto"></div>
            <div className="h-5 w-80 skeleton rounded mx-auto"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-center md:items-start">
            <div className="w-[400px] h-[350px] rounded-xl bg-card/60 border border-border/30 skeleton"></div>
            <div className="hidden md:flex h-64 border-r border-border/30"></div>
            <div className="w-[400px] h-[350px] rounded-xl bg-card/60 border border-border/30 skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not loading, but no user - show login forms
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background fade-in">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-3 mb-8">
            <h1 className="text-4xl font-bold text-primary">Demo Dashboard</h1>
            <p className="text-muted-foreground">
              Please log in or register to continue
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-center items-center md:items-start">
            <LoginForm />
            <div className="hidden md:flex h-64 border-r border-border"></div>
            <RegisterForm />
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, show the actual content
  return <div className="min-h-screen auth-transition">{children}</div>;
}
