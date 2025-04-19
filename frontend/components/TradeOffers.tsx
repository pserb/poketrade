"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { getUserTradeOffers, tradeOfferAction, TradeOfferType } from "@/utils/cards-api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, CheckCircle2, XCircle, RefreshCw, Clock8 } from "lucide-react";

export default function TradeOffers() {
  const [tradeOffers, setTradeOffers] = useState<TradeOfferType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();

  const fetchTradeOffers = async () => {
    setIsLoading(true);
    try {
      const offers = await getUserTradeOffers();
      setTradeOffers(offers);
    } catch (error) {
      console.error("Failed to fetch trade offers:", error);
      addToast({
        title: "Error",
        description: "Failed to load trade offers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeOffers();
  }, []);

  const handleTradeAction = async (tradeId: number, action: 'accept' | 'decline' | 'cancel') => {
    try {
      const result = await tradeOfferAction(tradeId, action);
      
      // Update the local state with the updated trade offer
      setTradeOffers(prevOffers => 
        prevOffers.map(offer => 
          offer.id === tradeId ? result.trade : offer
        )
      );
      
      addToast({
        title: "Trade Updated",
        description: result.message,
        variant: "success",
      });
      
    } catch (error: any) {
      addToast({
        title: "Action Failed",
        description: error.response?.data?.error || `Failed to ${action} trade`,
        variant: "destructive",
      });
    }
  };

  // Filter offers by status
  const pendingOffers = tradeOffers.filter(offer => offer.status === 'pending');
  const sentOffers = pendingOffers.filter(offer => offer.sender_username === user?.username);
  const receivedOffers = pendingOffers.filter(offer => offer.recipient_username === user?.username);
  const completedOffers = tradeOffers.filter(offer => offer.status !== 'pending');

  const renderTradeOffer = (offer: TradeOfferType) => {
    const isSender = offer.sender_username === user?.username;
    const statusColor = offer.status === 'accepted' ? 'text-accent' : 
                        offer.status === 'declined' ? 'text-destructive' : 
                        'text-muted-foreground';
    
    return (
      <div key={offer.id} className="p-4 border border-border/50 rounded-lg bg-card/60 transition-all hover:shadow-md">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium text-primary">
              {isSender ? 'You offered:' : `${offer.sender_username} offered:`}
            </h3>
            <div className="mt-2 flex flex-col sm:flex-row gap-6">
              <div className="bg-secondary/20 p-3 rounded-md flex-1">
                <p className="text-sm text-muted-foreground">Sending:</p>
                <p className="text-foreground">{offer.sender_card_name}</p>
                <p className="text-xs text-muted-foreground mt-1">From: {offer.sender_username}</p>
              </div>
              <div className="bg-secondary/20 p-3 rounded-md flex-1">
                <p className="text-sm text-muted-foreground">Requesting:</p>
                <p className="text-foreground">{offer.recipient_card_name}</p>
                <p className="text-xs text-muted-foreground mt-1">From: {offer.recipient_username}</p>
              </div>
            </div>
          </div>
          
          {offer.status === 'pending' ? (
            <div className="flex flex-col gap-2 min-w-[120px]">
              {isSender ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                  onClick={() => handleTradeAction(offer.id, 'cancel')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              ) : (
                <>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => handleTradeAction(offer.id, 'accept')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                    onClick={() => handleTradeAction(offer.id, 'decline')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="min-w-[120px] flex items-center">
              <div className={`capitalize font-medium ${statusColor}`}>
                {offer.status === 'accepted' && <CheckCircle2 className="h-4 w-4 inline mr-2" />}
                {offer.status === 'declined' && <XCircle className="h-4 w-4 inline mr-2" />}
                {offer.status === 'canceled' && <Clock8 className="h-4 w-4 inline mr-2" />}
                {offer.status}
              </div>
            </div>
          )}
        </div>
        <div className="mt-3 text-xs text-muted-foreground">
          Created: {new Date(offer.created_at).toLocaleString()}
          {offer.status !== 'pending' && 
            ` • Updated: ${new Date(offer.updated_at).toLocaleString()}`}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Trade Offers</h2>
          <p className="text-muted-foreground">Manage your pending and completed trades</p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={fetchTradeOffers} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received">
            Received Offers ({receivedOffers.length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent Offers ({sentOffers.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedOffers.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="received" className="pt-4">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading trade offers...
            </div>
          ) : receivedOffers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              You don't have any pending trade offers received from other trainers.
            </div>
          ) : (
            <div className="space-y-4">
              {receivedOffers.map(renderTradeOffer)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="sent" className="pt-4">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading trade offers...
            </div>
          ) : sentOffers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              You haven't sent any trade offers that are pending.
            </div>
          ) : (
            <div className="space-y-4">
              {sentOffers.map(renderTradeOffer)}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="pt-4">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading trade offers...
            </div>
          ) : completedOffers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              You don't have any completed trades.
            </div>
          ) : (
            <div className="space-y-4">
              {completedOffers.map(renderTradeOffer)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}