import api from "@/utils/api";
import { CardType } from "@/components/Card";

// Trade offer types
export interface TradeOfferType {
  id: number;
  sender: number;
  recipient: number;
  sender_card: number;
  recipient_card: number;
  status: 'pending' | 'accepted' | 'declined' | 'canceled';
  created_at: string;
  updated_at: string;
  sender_username: string;
  recipient_username: string;
  sender_card_name: string;
  recipient_card_name: string;
}

// Get current user's cards
export const getUserCards = async (): Promise<CardType[]> => {
  try {
    // Get the current username from cookies to filter cards
    const username = document.cookie
      .split('; ')
      .find(row => row.startsWith('username='))
      ?.split('=')[1];
      
    if (!username) {
      throw new Error("User not authenticated");
    }
    
    // Filter cards by the current user's username
    const response = await api.get(`/api/card/?owner=${encodeURIComponent(username)}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user cards:", error);
    throw error;
  }
};

// Get cards by owner username
export const getCardsByOwner = async (username: string): Promise<CardType[]> => {
  try {
    const response = await api.get(`/api/card/?owner=${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cards for owner ${username}:`, error);
    throw error;
  }
};

// Get tradable cards by username (cards not for sale)
export const getTradableCardsByUsername = async (username: string): Promise<CardType[]> => {
  try {
    const response = await api.get(`/api/cards/by-user/?username=${encodeURIComponent(username)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tradable cards for ${username}:`, error);
    throw error;
  }
};

// Get marketplace listings
export const getMarketplaceCards = async (nameFilter?: string): Promise<CardType[]> => {
  try {
    const url = nameFilter 
      ? `/api/cards/marketplace/?name=${encodeURIComponent(nameFilter)}` 
      : "/api/cards/marketplace/";
    const response = await api.get(url);
    return response.data.cards;
  } catch (error) {
    console.error("Error fetching marketplace cards:", error);
    throw error;
  }
};

// Put card up for sale
export const listCardForSale = async (cardId: number, price: number): Promise<CardType> => {
  try {
    const response = await api.post("/api/cards/marketplace/", {
      card_id: cardId,
      price: price
    });
    return response.data.card;
  } catch (error) {
    console.error("Error listing card for sale:", error);
    throw error;
  }
};

// Remove card from marketplace
export const removeCardFromSale = async (cardId: number): Promise<CardType> => {
  try {
    const response = await api.post("/api/cards/marketplace/", {
      card_id: cardId,
      price: -1
    });
    return response.data.card;
  } catch (error) {
    console.error("Error removing card from sale:", error);
    throw error;
  }
};

// Purchase a card
export const purchaseCard = async (cardId: number): Promise<{
  card: CardType;
  message: string;
  new_balance: number;
}> => {
  try {
    const response = await api.post("/api/cards/purchase/", {
      card_id: cardId
    });
    return response.data;
  } catch (error) {
    console.error("Error purchasing card:", error);
    throw error;
  }
};

// Create a trade offer
export const createTradeOffer = async (
  recipientUsername: string,
  senderCardId: number,
  recipientCardId: number
): Promise<TradeOfferType> => {
  try {
    // We need to use the recipient's username directly
    // First, let's verify the recipient has the card
    const recipientCards = await getTradableCardsByUsername(recipientUsername);
    const validCard = recipientCards.find(card => card.id === recipientCardId);
    
    if (!validCard) {
      throw new Error("The selected card doesn't belong to the recipient or isn't available for trading");
    }
    
    // Create the trade offer with recipient username instead of ID
    const response = await api.post("/api/trades/", {
      recipient_username: recipientUsername,
      sender_card: senderCardId,
      recipient_card: recipientCardId
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating trade offer:", error);
    throw error;
  }
};

// Get user's trade offers
export const getUserTradeOffers = async (status?: string): Promise<TradeOfferType[]> => {
  try {
    const url = status ? `/api/trades/?status=${status}` : "/api/trades/";
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching trade offers:", error);
    throw error;
  }
};

// Take action on a trade offer (accept, decline, cancel)
export const tradeOfferAction = async (
  tradeId: number,
  action: 'accept' | 'decline' | 'cancel'
): Promise<{
  message: string;
  trade: TradeOfferType;
}> => {
  try {
    const response = await api.post("/api/trades/action/", {
      trade_id: tradeId,
      action: action
    });
    return response.data;
  } catch (error) {
    console.error(`Error ${action}ing trade offer:`, error);
    throw error;
  }
};