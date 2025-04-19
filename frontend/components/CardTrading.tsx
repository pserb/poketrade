"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Card, { CardType } from "@/components/Card";
import { getUserCards, getTradableCardsByUsername, createTradeOffer } from "@/utils/cards-api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight,
  CheckCircle2,
  Loader2
} from "lucide-react";
import TradeOffers from "./TradeOffers";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CardTrading() {
  const [userCards, setUserCards] = useState<CardType[]>([]);
  const [otherUserCards, setOtherUserCards] = useState<CardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedUserCard, setSelectedUserCard] = useState<CardType | null>(null);
  const [selectedOtherCard, setSelectedOtherCard] = useState<CardType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchUserCards = async () => {
    setIsLoading(true);
    try {
      const cards = await getUserCards();
      // Only include cards that are NOT for sale (price < 0)
      const availableCards = cards.filter(card => card.price < 0);
      setUserCards(availableCards);
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      addToast({
        title: "Error",
        description: "Please enter a username to search for.",
        variant: "destructive",
      });
      return;
    }
    
    // Don't allow searching for your own username
    if (username.trim() === user?.username) {
      addToast({
        title: "Error",
        description: "You cannot trade with yourself. Please enter a different username.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    try {
      const cards = await getTradableCardsByUsername(username.trim());
      setOtherUserCards(cards);
      
      // Reset selections
      setSelectedUserCard(null);
      setSelectedOtherCard(null);
      
      if (cards.length === 0) {
        addToast({
          title: "No Cards Found",
          description: `${username} doesn't have any cards available for trading.`,
          variant: "info",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch other user's cards:", error);
      
      if (error.response?.status === 404) {
        addToast({
          title: "User Not Found",
          description: `User '${username}' was not found.`,
          variant: "destructive",
        });
      } else {
        addToast({
          title: "Error",
          description: "Failed to load cards. Please try again.",
          variant: "destructive",
        });
      }
      
      // Clear the other user's cards
      setOtherUserCards([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUserCard = (card: CardType) => {
    setSelectedUserCard(card);
  };

  const handleSelectOtherCard = (card: CardType) => {
    setSelectedOtherCard(card);
  };

  const handleCreateTradeOffer = async () => {
    if (!selectedUserCard || !selectedOtherCard) {
      addToast({
        title: "Incomplete Selection",
        description: "Please select both your card and the card you want to trade for.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createTradeOffer(username, selectedUserCard.id, selectedOtherCard.id);
      
      addToast({
        title: "Trade Offer Sent",
        description: `Your trade offer has been sent to ${username}.`,
        variant: "success",
      });
      
      // Reset selections
      setSelectedUserCard(null);
      setSelectedOtherCard(null);
      
    } catch (error: any) {
      console.error("Failed to create trade offer:", error);
      addToast({
        title: "Trade Offer Failed",
        description: error.response?.data?.error || "Failed to create trade offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="create">
        <TabsList>
          <TabsTrigger value="create">Create Trade</TabsTrigger>
          <TabsTrigger value="manage">Manage Trades</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="pt-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-primary">Create a Trade</h2>
              <p className="text-muted-foreground">Trade cards with other players</p>
            </div>
            
            <div className="bg-card/60 p-4 rounded-md border border-border/30">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Enter username to trade with"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isSearching}>
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Search
                </Button>
                <Button type="button" variant="outline" onClick={fetchUserCards} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </form>
            </div>
    
            {otherUserCards.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Your cards */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium text-primary">Your Cards</h3>
                    {selectedUserCard && (
                      <div className="p-2 px-3 bg-secondary/30 rounded-md border border-border/30">
                        Selected: <span className="text-primary font-medium">{selectedUserCard.name}</span>
                      </div>
                    )}
                  </div>
                  
                  {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">
                      Loading your cards...
                    </div>
                  ) : userCards.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      You don't have any cards available for trading.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userCards.map((card) => (
                        <Card
                          key={card.id}
                          card={card}
                          onAction={handleSelectUserCard}
                          actionLabel={selectedUserCard?.id === card.id ? "✓ Selected" : "Select"}
                          actionVariant={selectedUserCard?.id === card.id ? "default" : "secondary"}
                          showOwner={false}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Other user's cards */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-medium text-primary">{username}'s Cards</h3>
                    {selectedOtherCard && (
                      <div className="p-2 px-3 bg-secondary/30 rounded-md border border-border/30">
                        Selected: <span className="text-primary font-medium">{selectedOtherCard.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {otherUserCards.map((card) => (
                      <Card
                        key={card.id}
                        card={card}
                        onAction={handleSelectOtherCard}
                        actionLabel={selectedOtherCard?.id === card.id ? "✓ Selected" : "Select"}
                        actionVariant={selectedOtherCard?.id === card.id ? "default" : "secondary"}
                        showOwner={false}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {otherUserCards.length > 0 && selectedUserCard && selectedOtherCard && (
              <div className="mt-6 p-4 rounded-md bg-card border border-primary/30">
                <h3 className="text-lg font-medium text-primary mb-4">Trade Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <div className="p-3 rounded-md bg-secondary/20 border border-border/30">
                    <p className="text-sm text-muted-foreground">You will give:</p>
                    <p className="text-foreground text-lg">{selectedUserCard.name}</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="flex items-center gap-3">
                      <ArrowRight className="h-5 w-5 text-primary hidden md:block" />
                      <div className="md:hidden flex flex-col items-center">
                        <ArrowDown className="h-5 w-5 text-primary" />
                        <ArrowDown className="h-5 w-5 text-primary" />
                      </div>
                      <ArrowLeft className="h-5 w-5 text-primary hidden md:block" />
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-md bg-secondary/20 border border-border/30">
                    <p className="text-sm text-muted-foreground">You will receive:</p>
                    <p className="text-foreground text-lg">{selectedOtherCard.name}</p>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={handleCreateTradeOffer} 
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Trade...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Create Trade Offer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="manage" className="pt-4">
          <TradeOffers />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Arrow down icon component
function ArrowDown(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}