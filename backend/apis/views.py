from django.shortcuts import render

from rest_framework import viewsets, generics
from rest_framework.generics import RetrieveDestroyAPIView

from .serializers import TestModelSerializer, UserSerializer
from .models import TestModel

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny


# Create your views here.
class UserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    permission_classes = [AllowAny]
    
class UserDestroyView(APIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def delete(self, request, *args, **kwargs):
        user=self.request.user
        user.delete()

        return Response({"result":"user delete"})
    
    permission_classes = [IsAuthenticated]

class TestModelViewSet(viewsets.ModelViewSet):
    queryset = TestModel.objects.all()
    serializer_class = TestModelSerializer
    
    permission_classes = [IsAuthenticatedOrReadOnly]
