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
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    # -1 denotes it's not for sale
    price = models.IntegerField()

    def __str__(self):
        return self.name
