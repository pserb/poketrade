"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Card, { CardType } from "@/components/Card";
import { getMarketplaceCards, purchaseCard } from "@/utils/cards-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";

export default function Marketplace() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchMarketplaceCards = async (nameFilter?: string) => {
    setIsLoading(true);
    try {
      const marketplaceCards = await getMarketplaceCards(nameFilter);
      setCards(marketplaceCards);
    } catch (error) {
      console.error("Failed to fetch marketplace cards:", error);
      addToast({
        title: "Error",
        description: "Failed to load marketplace cards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceCards();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMarketplaceCards(searchTerm);
  };

  const handlePurchase = async (card: CardType) => {
    try {
      const result = await purchaseCard(card.id);
      
      // Update user balance
      setUserBalance(result.new_balance);
      
      // Remove the purchased card from the list
      setCards(prevCards => prevCards.filter(c => c.id !== card.id));
      
      addToast({
        title: "Purchase Successful",
        description: result.message,
        variant: "success",
      });
      
      return result;
    } catch (error: any) {
      addToast({
        title: "Purchase Failed",
        description: error.response?.data?.error || "Failed to purchase this card",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Marketplace</h2>
          <p className="text-muted-foreground">Browse and purchase cards from other trainers</p>
        </div>
        
        {userBalance !== null && (
          <div className="bg-card p-2 px-4 rounded-md border border-border/50">
            <span className="text-muted-foreground">Balance: </span>
            <span className="text-primary font-medium">{userBalance} credits</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search by card name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            setSearchTerm("");
            fetchMarketplaceCards();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </form>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">
          Loading marketplace...
        </div>
      ) : cards.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No cards available in the marketplace.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onAction={handlePurchase}
              actionLabel={`Buy for ${card.price} credits`}
              actionVariant="default"
              disabled={card.owner_username === user?.username}
            />
          ))}
        </div>
      )}
    </div>
  );
}