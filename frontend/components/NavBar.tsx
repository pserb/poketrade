"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, User, Store, FolderHeart, Repeat } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

interface NavBarProps {
  activePage: string;
  onChangePage: (page: string) => void;
}

export default function NavBar({ activePage, onChangePage }: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout("You have been logged out successfully.");
  };

  const handlePageChange = (page: string) => {
    setMobileMenuOpen(false);
    onChangePage(page);
  };

  const navItems = [
    { id: "collection", label: "My Collection", icon: <FolderHeart className="h-4 w-4 mr-2" /> },
    { id: "marketplace", label: "Marketplace", icon: <Store className="h-4 w-4 mr-2" /> },
    { id: "trading", label: "Trade Cards", icon: <Repeat className="h-4 w-4 mr-2" /> },
  ];

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-primary">PokéTrade</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activePage === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="hidden md:ml-6 md:flex md:items-center">
            <div className="flex items-center mr-4">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <User className="h-4 w-4" />
              </div>
              <span className="ml-2 text-sm font-medium">{user?.username}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="inline-flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-secondary/50"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card/80 backdrop-blur-sm border-b border-border/50">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handlePageChange(item.id)}
              className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium ${
                activePage === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
          
          <div className="pt-4 pb-3 border-t border-border/30">
            <div className="flex items-center px-5 mb-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium">{user?.username}</div>
                <div className="text-sm font-medium text-muted-foreground">{user?.email}</div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="w-full justify-center"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}