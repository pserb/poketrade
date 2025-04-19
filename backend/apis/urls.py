from django.urls import path, include

from rest_framework import routers
from .views import (
    CardViewSet, 
    TestModelViewSet, 
    UserCreateView, 
    UserDestroyView, 
    CardTransferView, 
    CardPurchaseView, 
    CardMarketplaceView,
    CardTradeViewSet,
    TradeOfferActionView,
    GetUserCardsView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


router = routers.DefaultRouter()

router.register(r"testmodel", TestModelViewSet)
router.register(r"card", CardViewSet)
router.register(r"trades", CardTradeViewSet, basename="trade-offers")

# URL patterns using the router
urlpatterns = [
    # Include the router URLs first
    path("", include(router.urls)),
    
    # Auth endpoints
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # User management endpoints
    path("user/create/", UserCreateView.as_view(), name="user-create"),
    path("user/destroy/", UserDestroyView.as_view(), name="user-destroy"),
    
    # Card management endpoints - explicitly define these outside the router
    path("cards/transfer/", CardTransferView.as_view(), name="card-transfer"),
    path("cards/purchase/", CardPurchaseView.as_view(), name="card-purchase"),
    path("cards/marketplace/", CardMarketplaceView.as_view(), name="card-marketplace"),
    path("cards/by-user/", GetUserCardsView.as_view(), name="cards-by-user"),
    
    # Trade endpoints
    path("trades/action/", TradeOfferActionView.as_view(), name="trade-action"),
]