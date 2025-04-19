from rest_framework import serializers
from django.db import transaction

from .models import Card, TestModel, TradeOffer
from django.contrib.auth.models import User

from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "password", "email", "account_balance"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)
        return user


class TestModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestModel
        fields = "__all__"


class CardSerializer(serializers.ModelSerializer):
    owner_username = serializers.SerializerMethodField()
    
    class Meta:
        model = Card
        fields = "__all__"
        
    def get_owner_username(self, obj):
        return obj.owner.username
    
    @transaction.atomic
    def market_transaction(self, card, buyer):
        """
        Handle a marketplace transaction between the card owner (seller) and buyer
        
        Args:
            card (Card): The card being bought/sold
            buyer (CustomUser): The user purchasing the card
            
        Returns:
            bool: True if the transaction was successful
            
        Raises:
            serializers.ValidationError: If the transaction cannot be completed
        """
        # Check if card is for sale
        if card.price < 0:
            raise serializers.ValidationError("This card is not for sale")
            
        # Check if buyer has enough balance
        if buyer.account_balance < card.price:
            raise serializers.ValidationError("Insufficient funds")
            
        # Check that buyer isn't the owner
        if buyer == card.owner:
            raise serializers.ValidationError("You already own this card")
            
        # Perform the transaction
        seller = card.owner
        price = card.price
        
        # Update balances
        buyer.account_balance -= price
        seller.account_balance += price
        
        # Update card ownership
        card.owner = buyer
        
        # Save all changes
        buyer.save()
        seller.save()
        card.save()
        
        return True


class TradeOfferSerializer(serializers.ModelSerializer):
    sender_username = serializers.ReadOnlyField(source='sender.username')
    recipient_username = serializers.CharField(write_only=True, required=False)
    sender_card_name = serializers.ReadOnlyField(source='sender_card.name')
    recipient_card_name = serializers.ReadOnlyField(source='recipient_card.name')
    
    class Meta:
        model = TradeOffer
        fields = [
            'id', 'sender', 'recipient', 'sender_card', 'recipient_card', 
            'status', 'created_at', 'updated_at', 'sender_username', 
            'recipient_username', 'sender_card_name', 'recipient_card_name'
        ]
        read_only_fields = ['status', 'created_at', 'updated_at', 'sender']
        extra_kwargs = {
            'recipient': {'required': False}
        }
    
    def validate(self, data):
        # If recipient_username is provided, get the recipient user
        if 'recipient_username' in data:
            try:
                username = data.pop('recipient_username')
                data['recipient'] = CustomUser.objects.get(username=username)
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError(f"User '{username}' not found")
        
        # Validate that the sender owns the sender_card
        sender = self.context['request'].user
        if data['sender_card'].owner != sender:
            raise serializers.ValidationError("You don't own the card you're offering")
        
        # Validate that the recipient owns the recipient_card
        if data['recipient_card'].owner != data['recipient']:
            raise serializers.ValidationError("The recipient doesn't own the card you're requesting")
        
        # Validate that neither card is for sale
        if data['sender_card'].price >= 0:
            raise serializers.ValidationError("You cannot trade a card that is for sale")
        
        if data['recipient_card'].price >= 0:
            raise serializers.ValidationError("You cannot request a card that is for sale")
        
        # Validate that sender and recipient are different users
        if sender == data['recipient']:
            raise serializers.ValidationError("You cannot trade with yourself")
            
        return data
    
    def create(self, validated_data):
        # Set the sender to the current user
        validated_data['sender'] = self.context['request'].user
        
        # Create a new trade offer
        trade_offer = TradeOffer.objects.create(**validated_data)
        return trade_offer