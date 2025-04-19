"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/components/Dashboard";

export default function AuthenticatedContent() {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  // Add a slight delay before showing content to ensure smooth transition from skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen auth-transition ${isVisible ? "fade-in" : "opacity-0"}`}>
      <Dashboard />
    </div>
  );
}