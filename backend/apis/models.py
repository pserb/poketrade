from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    account_balance = models.IntegerField(default=0)

    def __str__(self):
        return self.username


# Create your models here.
class TestModel(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()

    def __str__(self):
        return self.title


class Card(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="cards")

    # -1 denotes it's not for sale
    price = models.IntegerField()
    
    def transfer_to(self, new_owner):
        """
        Transfer card ownership to a new user
        
        Args:
            new_owner (CustomUser): The user who will receive the card
        
        Returns:
            bool: True if transfer was successful
        """
        self.owner = new_owner
        self.save()
        return True

    def __str__(self):
        return self.name


class TradeOffer(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('canceled', 'Canceled'),
    ]
    
    # The user who initiated the trade offer
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="sent_offers")
    
    # The user who receives the trade offer
    recipient = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="received_offers")
    
    # The card the sender is offering
    sender_card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="offered_in")
    
    # The card the sender wants in return
    recipient_card = models.ForeignKey(Card, on_delete=models.CASCADE, related_name="requested_in")
    
    # Status of the trade offer
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Trade: {self.sender.username}'s {self.sender_card.name} for {self.recipient.username}'s {self.recipient_card.name}"
    
    def accept(self):
        """Execute the trade by swapping card ownership"""
        if self.status != 'pending':
            return False
        
        # Store references to avoid confusion during the swap
        sender = self.sender
        recipient = self.recipient
        sender_card = self.sender_card
        recipient_card = self.recipient_card
        
        # Check if the cards are still owned by the original users
        if sender_card.owner != sender or recipient_card.owner != recipient:
            self.status = 'canceled'
            self.save()
            return False
            
        # Execute the swap
        sender_card.owner = recipient
        recipient_card.owner = sender
        
        # Cards coming from a trade should not be for sale
        sender_card.price = -1
        recipient_card.price = -1
        
        # Save the changes
        sender_card.save()
        recipient_card.save()
        
        # Update trade status
        self.status = 'accepted'
        self.save()
        
        return True
    
    def decline(self):
        """Decline the trade offer"""
        if self.status != 'pending':
            return False
            
        self.status = 'declined'
        self.save()
        return True
    
    def cancel(self):
        """Cancel the trade offer (by the sender)"""
        if self.status != 'pending':
            return False
            
        self.status = 'canceled'
        self.save()
        return True