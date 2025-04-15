from django.urls import path, include

from rest_framework import routers
from .views import CardViewSet, TestModelViewSet, UserCreateView, UserDestroyView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


router = routers.DefaultRouter()

router.register(r"testmodel", TestModelViewSet)
router.register(r"card", CardViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("user/create/", UserCreateView.as_view(), name="user-create"),
    path("user/destroy/", UserDestroyView.as_view(), name="user-destroy"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

