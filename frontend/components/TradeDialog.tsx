"use client";

import { useState } from "react";
import { CardType } from "@/components/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TradeDialogProps {
  card: CardType;
  onTrade: (card: CardType, recipientUsername: string) => Promise<void>;
  onCancel: () => void;
}

export default function TradeDialog({ card, onTrade, onCancel }: TradeDialogProps) {
  const [recipientUsername, setRecipientUsername] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!recipientUsername.trim()) {
      setError("Please enter a recipient username");
      return;
    }

    // Don't allow trading with yourself
    if (recipientUsername.trim() === user?.username) {
      setError("You cannot trade with yourself");
      return;
    }

    setIsSubmitting(true);
    try {
      await onTrade(card, recipientUsername.trim());
    } catch (error) {
      console.error("Failed to trade card:", error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-primary">Trade Card</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the username of the trainer you want to trade your "{card.name}" card with.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipientUsername" className="text-foreground">
                Recipient Username
              </Label>
              <Input
                id="recipientUsername"
                value={recipientUsername}
                onChange={(e) => setRecipientUsername(e.target.value)}
                placeholder="Enter username"
                className="bg-background border-border text-foreground"
                required
              />
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            </div>

            <div className="bg-secondary/20 p-3 rounded-md border border-border/30 flex gap-2">
              <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                This will transfer your card directly to the other player. Make sure you trust them
                or have arranged for them to send a card back in return.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-muted text-muted-foreground"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Trading...
                </>
              ) : (
                "Confirm Trade"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}