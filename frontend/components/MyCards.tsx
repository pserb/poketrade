"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Card, { CardType } from "@/components/Card";
import { getUserCards, listCardForSale, removeCardFromSale } from "@/utils/cards-api";
import ListCardDialog from "@/components/ListCardDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Store } from "lucide-react";

export default function MyCards() {
  const [cards, setCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCardForListing, setSelectedCardForListing] = useState<CardType | null>(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchUserCards = async () => {
    setIsLoading(true);
    try {
      const userCards = await getUserCards();
      setCards(userCards);
    } catch (error) {
      console.error("Failed to fetch user cards:", error);
      addToast({
        title: "Error",
        description: "Failed to load your cards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCards();
  }, []);

  const handleListForSale = (card: CardType) => {
    setSelectedCardForListing(card);
  };

  const handleRemoveFromSale = async (card: CardType) => {
    try {
      const updatedCard = await removeCardFromSale(card.id);
      
      // Update the card in the list
      setCards(prevCards => 
        prevCards.map(c => c.id === updatedCard.id ? updatedCard : c)
      );
      
      addToast({
        title: "Card Removed from Sale",
        description: `${updatedCard.name} has been removed from the marketplace.`,
        variant: "info",
      });
      
    } catch (error: any) {
      addToast({
        title: "Action Failed",
        description: error.response?.data?.error || "Failed to remove card from sale",
        variant: "destructive",
      });
    }
  };

  const handleSaveListCard = async (cardId: number, price: number) => {
    try {
      const updatedCard = await listCardForSale(cardId, price);
      
      // Update the card in the list
      setCards(prevCards => 
        prevCards.map(c => c.id === updatedCard.id ? updatedCard : c)
      );
      
      setSelectedCardForListing(null);
      
      addToast({
        title: "Card Listed for Sale",
        description: `${updatedCard.name} is now available in the marketplace for ${price} credits.`,
        variant: "success",
      });
      
    } catch (error: any) {
      addToast({
        title: "Listing Failed",
        description: error.response?.data?.error || "Failed to list card for sale",
        variant: "destructive",
      });
    }
  };

  // Filter cards that are for sale and not for sale
  const cardsForSale = cards.filter(card => card.price >= 0);
  const cardsNotForSale = cards.filter(card => card.price < 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-primary">My Collection</h2>
          <p className="text-muted-foreground">Manage your Pokémon cards</p>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Cards ({cards.length})</TabsTrigger>
          <TabsTrigger value="for-sale">For Sale ({cardsForSale.length})</TabsTrigger>
          <TabsTrigger value="not-for-sale">Not For Sale ({cardsNotForSale.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="pt-4">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading your cards...
            </div>
          ) : cards.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              You don't have any cards yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onAction={card.price >= 0 ? handleRemoveFromSale : handleListForSale}
                  actionLabel={card.price >= 0 ? "Remove from sale" : "List for sale"}
                  actionVariant={card.price >= 0 ? "outline" : "secondary"}
                  showOwner={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="for-sale" className="pt-4">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading your cards...
            </div>
          ) : cardsForSale.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              You don't have any cards listed for sale.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cardsForSale.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onAction={handleRemoveFromSale}
                  actionLabel="Remove from sale"
                  actionVariant="outline"
                  showOwner={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="not-for-sale" className="pt-4">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading your cards...
            </div>
          ) : cardsNotForSale.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              All your cards are listed for sale.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cardsNotForSale.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  onAction={handleListForSale}
                  actionLabel="List for sale"
                  actionVariant="secondary"
                  showOwner={false}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedCardForListing && (
        <ListCardDialog
          card={selectedCardForListing}
          onSave={handleSaveListCard}
          onCancel={() => setSelectedCardForListing(null)}
        />
      )}
    </div>
  );
}