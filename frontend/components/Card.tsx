"use client";

import { useState } from "react";
import { Card as CardUI, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export interface CardType {
  id: number;
  name: string;
  owner: number;
  owner_username: string;
  price: number;
}

interface CardProps {
  card: CardType;
  onAction?: (card: CardType) => Promise<void>;
  actionLabel?: string;
  actionVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  showOwner?: boolean;
  disabled?: boolean;
}

export default function Card({ 
  card, 
  onAction, 
  actionLabel, 
  actionVariant = "default",
  showOwner = true,
  disabled = false
}: CardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    if (!onAction) return;
    
    setIsLoading(true);
    try {
      await onAction(card);
    } catch (error) {
      console.error("Error performing card action:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardUI className="w-full max-w-[250px] h-[320px] overflow-hidden bg-card border-border/50 shadow-md hover:shadow-lg transition-all duration-200">
      <div className="p-3 h-[220px] bg-secondary/20 flex items-center justify-center">
        <div className="text-6xl text-primary">🃏</div>
      </div>
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-medium text-lg text-primary truncate">{card.name}</h3>
            {showOwner && (
              <p className="text-sm text-muted-foreground">Owner: {card.owner_username}</p>
            )}
          </div>
          {card.price >= 0 && (
            <Badge variant="outline" className="bg-secondary/30 text-accent">
              {card.price} credits
            </Badge>
          )}
        </div>
      </CardContent>
      {onAction && actionLabel && (
        <CardFooter className="p-3 pt-0">
          <Button
            variant={actionVariant}
            size="sm"
            className="w-full"
            onClick={handleAction}
            disabled={isLoading || disabled}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              actionLabel
            )}
          </Button>
        </CardFooter>
      )}
    </CardUI>
  );
}