"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/utils/api";
import TestModelItem from "@/components/TestModelItem";
import { TestModel } from "@/components/TestModelItem";
import AddModelDialog from "@/components/AddModelDialog";
import { Button } from "./ui/button";
import DeleteAccountDialog from "./DeleteAccountDialog";
import { LogOut, User, Database } from "lucide-react";

export default function AuthenticatedContent() {
  const [data, setData] = useState<TestModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logout, user, isTokenExpired } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  // Add a slight delay before showing content to ensure smooth transition from skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleAuthError = (error: unknown) => {
    if (isTokenExpired(error)) {
      logout("Your session has expired. Please log in again.");
    } else {
      console.error("API request failed:", error);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("http://localhost:8000/testmodel/");
      setData(response.data);
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteModel = async (id: number) => {
    try {
      await api.delete(`/testmodel/${id}/`);
      fetchData();
    } catch (error) {
      handleAuthError(error);
    }
  };

  const addModel = async (title: string, description: string) => {
    try {
      await api.post("http://localhost:8000/testmodel/", {
        title,
        description,
      });
      fetchData();
    } catch (error) {
      handleAuthError(error);
    }
  };

  return (
    <div
      className={`max-w-screen-lg mx-auto px-4 py-8 ${
        isVisible ? "fade-in" : "opacity-0"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            <User size={20} />
          </div>
          <h1 className="text-3xl font-bold text-primary">
            Welcome, {user?.username}
          </h1>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={() => logout()}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-muted text-muted-foreground hover:text-foreground"
          >
            <LogOut size={16} />
            Logout
          </Button>
          <DeleteAccountDialog />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Database size={20} className="text-primary" />
            <h2 className="text-2xl font-semibold text-primary">Models</h2>
          </div>
          <AddModelDialog addModel={addModel} />
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading...
          </div>
        ) : data.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No models found. Add your first model!
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-border">
            {data.map((item: TestModel) => (
              <TestModelItem key={item.id} item={item} onDelete={deleteModel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
