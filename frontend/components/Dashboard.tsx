"use client";

import { useState } from "react";
import NavBar from "@/components/NavBar";
import MyCards from "@/components/MyCards";
import Marketplace from "@/components/Marketplace";
import CardTrading from "@/components/CardTrading";
import DeleteAccountDialog from "@/components/DeleteAccountDialog";

export default function Dashboard() {
  const [activePage, setActivePage] = useState("collection");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavBar activePage={activePage} onChangePage={setActivePage} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {activePage === "collection" && <MyCards />}
        {activePage === "marketplace" && <Marketplace />}
        {activePage === "trading" && <CardTrading />}
        
        {/* Account settings section at the bottom of any page */}
        <div className="mt-16 pt-6 border-t border-border/30">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-primary">Account Settings</h2>
            <DeleteAccountDialog />
          </div>
        </div>
      </main>
      
      <footer className="bg-card/30 border-t border-border/20 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>PokéTrade &copy; 2025. A platform for trading Pokémon cards.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}