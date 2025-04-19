from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import TestModel, CustomUser, Card, TradeOffer


# Register your models here.
admin.site.register(TestModel)
admin.site.register(Card)
admin.site.register(CustomUser, UserAdmin)
admin.site.register(TradeOffer)

# Add account_balance to the fieldsets of UserAdmin
UserAdmin.fieldsets += (
    ('PokéTrade Info', {'fields': ('account_balance',)}),
)