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
import { Loader2 } from "lucide-react";

interface ListCardDialogProps {
  card: CardType;
  onSave: (cardId: number, price: number) => Promise<void>;
  onCancel: () => void;
}

export default function ListCardDialog({ card, onSave, onCancel }: ListCardDialogProps) {
  const [price, setPrice] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate price
    const priceNum = parseInt(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError("Please enter a valid price greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(card.id, priceNum);
    } catch (error) {
      console.error("Failed to list card:", error);
      setError("Failed to list card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-primary">List Card for Sale</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set a price for your card "{card.name}" to list it on the marketplace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-foreground">
                Price (credits)
              </Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price in credits"
                className="bg-background border-border text-foreground"
                required
              />
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
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
                  Listing...
                </>
              ) : (
                "List for Sale"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}