"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/contexts/ToastContext";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@/components/ui/toast";

export default function Toaster() {
  const { toasts, removeToast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-3 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[400px]">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          className={`shadow-md ${
            toast.removing
              ? "animate-out fade-out slide-out-to-right-full duration-300"
              : "animate-in fade-in slide-in-from-right-full duration-300"
          }`}
        >
          <div className="flex flex-col gap-1.5">
            {toast.title && (
              <ToastTitle className="text-primary">{toast.title}</ToastTitle>
            )}
            <ToastDescription className="text-foreground">
              {toast.description}
            </ToastDescription>
          </div>
          <ToastClose onClick={() => removeToast(toast.id)} />
        </Toast>
      ))}
    </div>
  );
}
