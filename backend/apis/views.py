from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import (
    IsAuthenticated,
    IsAuthenticatedOrReadOnly,
    AllowAny,
)
from django.db import transaction
from django.db.models import Q

from .serializers import CardSerializer, TestModelSerializer, UserSerializer, TradeOfferSerializer
from .models import Card, TestModel, CustomUser, TradeOffer


# Create your views here.
class UserCreateView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    permission_classes = [AllowAny]


class UserDestroyView(APIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def delete(self, request, *args, **kwargs):
        user = self.request.user
        user.delete()

        return Response({"result": "user delete"})

    permission_classes = [IsAuthenticated]


class TestModelViewSet(viewsets.ModelViewSet):
    queryset = TestModel.objects.all()
    serializer_class = TestModelSerializer

    permission_classes = [IsAuthenticatedOrReadOnly]


class CardViewSet(viewsets.ModelViewSet):
    queryset = Card.objects.all()
    serializer_class = CardSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Optionally restricts the returned cards to a given user,
        by filtering against the 'owner' query parameter.
        """
        queryset = Card.objects.all()
        owner_username = self.request.query_params.get("owner")

        if owner_username:
            try:
                owner = CustomUser.objects.get(username=owner_username)
                queryset = queryset.filter(owner=owner)
            except CustomUser.DoesNotExist:
                # If user doesn't exist, return empty queryset
                queryset = Card.objects.none()

        return queryset


class CardTransferView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Get required parameters from request
        card_id = request.data.get("card_id")
        recipient_username = request.data.get("recipient_username")

        # Validate parameters
        if not card_id or not recipient_username:
            return Response(
                {"error": "Both card_id and recipient_username are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if card exists and user owns it
        try:
            card = Card.objects.get(id=card_id)
        except Card.DoesNotExist:
            return Response(
                {"error": "Card not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Verify current user owns the card
        if card.owner != request.user:
            return Response(
                {"error": "You do not own this card"}, status=status.HTTP_403_FORBIDDEN
            )

        # Check if recipient exists
        try:
            recipient = CustomUser.objects.get(username=recipient_username)
        except CustomUser.DoesNotExist:
            return Response(
                {"error": f"User '{recipient_username}' not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Don't allow transfers to self
        if recipient == request.user:
            return Response(
                {"error": "Cannot transfer card to yourself"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Perform the transfer
        card.owner = recipient
        card.save()

        # Return success response with updated card info
        serializer = CardSerializer(card)
        return Response(
            {
                "message": f"Card '{card.name}' successfully transferred to {recipient.username}",
                "card": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class CardPurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        # Get required parameters from request
        card_id = request.data.get("card_id")

        # Validate parameters
        if not card_id:
            return Response(
                {"error": "Card ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if card exists
        try:
            card = Card.objects.get(id=card_id)
        except Card.DoesNotExist:
            return Response(
                {"error": "Card not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if card is for sale
        if card.price < 0:
            return Response(
                {"error": "This card is not for sale"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if user is trying to buy their own card
        if card.owner == request.user:
            return Response(
                {"error": "You already own this card"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if user has enough balance
        buyer = request.user
        if buyer.account_balance < card.price:
            return Response(
                {
                    "error": f"Insufficient funds. Card costs {card.price} but your balance is {buyer.account_balance}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Perform the transaction
        try:
            seller = card.owner
            price = card.price

            # Update balances
            buyer.account_balance -= price
            seller.account_balance += price

            # Update card ownership
            card.owner = buyer
            # Set card as not for sale after purchase
            card.price = -1

            # Save all changes
            buyer.save()
            seller.save()
            card.save()

            # Return success response
            serializer = CardSerializer(card)
            return Response(
                {
                    "message": f"Successfully purchased card '{card.name}' for {price} credits",
                    "card": serializer.data,
                    "new_balance": buyer.account_balance,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            # Roll back transaction if anything fails
            return Response(
                {"error": f"Transaction failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CardMarketplaceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """Get all cards that are currently for sale"""
        # Get all cards with price >= 0 (for sale)
        cards_for_sale = Card.objects.filter(price__gte=0)

        # Optionally filter by name if provided
        name_filter = request.query_params.get("name")
        if name_filter:
            cards_for_sale = cards_for_sale.filter(name__icontains=name_filter)

        # Serialize and return the data
        serializer = CardSerializer(cards_for_sale, many=True)
        return Response(
            {"count": cards_for_sale.count(), "cards": serializer.data},
            status=status.HTTP_200_OK,
        )

    def post(self, request, *args, **kwargs):
        """Put a card up for sale or remove it from sale"""
        # Get required parameters from request
        card_id = request.data.get("card_id")
        price = request.data.get("price")

        # Validate parameters
        if not card_id or price is None:
            return Response(
                {"error": "Both card_id and price are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            price = int(price)
        except ValueError:
            return Response(
                {"error": "Price must be a valid integer"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # For removing from marketplace, price should be -1
        # Otherwise, price should be positive
        if price != -1 and price <= 0:
            return Response(
                {"error": "Price must be a positive number or -1 to remove from sale"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if card exists and user owns it
        try:
            card = Card.objects.get(id=card_id)
        except Card.DoesNotExist:
            return Response(
                {"error": "Card not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Verify current user owns the card
        if card.owner != request.user:
            return Response(
                {"error": "You do not own this card"}, status=status.HTTP_403_FORBIDDEN
            )

        # Update the card price
        card.price = price
        card.save()

        # Return success response
        serializer = CardSerializer(card)

        if price == -1:
            message = f"Card '{card.name}' removed from marketplace"
        else:
            message = f"Card '{card.name}' is now for sale at {price} credits"

        return Response(
            {"message": message, "card": serializer.data}, status=status.HTTP_200_OK
        )

class CardTradeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for creating and managing trade offers
    """
    serializer_class = TradeOfferSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        This view returns:
        - All pending trade offers where the user is either sender or recipient
        - All completed trades (accepted/declined/canceled) from the last 30 days
        """
        user = self.request.user
        
        # Get the 'status' query parameter if provided
        status_filter = self.request.query_params.get('status')
        
        # Base queryset - trades where user is sender or recipient
        queryset = TradeOffer.objects.filter(
            Q(sender=user) | Q(recipient=user)
        )
        
        # Apply status filter if provided
        if status_filter:
            queryset = queryset.filter(status=status_filter)
            
        return queryset.order_by('-created_at')
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class TradeOfferActionView(APIView):
    """
    View for accepting, declining, or canceling a trade offer
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Get required parameters
        trade_id = request.data.get('trade_id')
        action = request.data.get('action')
        
        # Validate parameters
        if not trade_id or not action:
            return Response(
                {"error": "Both trade_id and action are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Validate action
        if action not in ['accept', 'decline', 'cancel']:
            return Response(
                {"error": "Action must be one of: accept, decline, cancel"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Get the trade offer
        try:
            trade_offer = TradeOffer.objects.get(id=trade_id)
        except TradeOffer.DoesNotExist:
            return Response(
                {"error": "Trade offer not found"},
                status=status.HTTP_404_NOT_FOUND
            )
            
        # Check permissions:
        # - Only recipient can accept/decline
        # - Only sender can cancel
        user = request.user
        
        if action in ['accept', 'decline'] and trade_offer.recipient != user:
            return Response(
                {"error": "Only the recipient can accept or decline a trade offer"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if action == 'cancel' and trade_offer.sender != user:
            return Response(
                {"error": "Only the sender can cancel a trade offer"},
                status=status.HTTP_403_FORBIDDEN
            )
            
        # Check if trade is still pending
        if trade_offer.status != 'pending':
            return Response(
                {"error": f"Cannot {action} a trade that is already {trade_offer.status}"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Perform the action
        with transaction.atomic():
            if action == 'accept':
                success = trade_offer.accept()
                if not success:
                    return Response(
                        {"error": "Trade could not be completed. Cards may no longer be available."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            elif action == 'decline':
                trade_offer.decline()
            elif action == 'cancel':
                trade_offer.cancel()
                
            # Return the updated trade offer
            serializer = TradeOfferSerializer(trade_offer)
            
            return Response({
                "message": f"Trade {action}ed successfully",
                "trade": serializer.data
            }, status=status.HTTP_200_OK)


class GetUserCardsView(APIView):
    """
    View for getting cards of a specific user by username
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, *args, **kwargs):
        username = request.query_params.get('username')
        
        if not username:
            return Response(
                {"error": "Username parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            user = CustomUser.objects.get(username=username)
            
            # Get cards not for sale (price < 0)
            cards = Card.objects.filter(owner=user, price__lt=0)
            
            serializer = CardSerializer(cards, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except CustomUser.DoesNotExist:
            return Response(
                {"error": f"User '{username}' not found"},
                status=status.HTTP_404_NOT_FOUND
            )