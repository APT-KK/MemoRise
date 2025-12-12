from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

# creating a custom user manager as we are using custom user model
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email) # normalizing email = to_lowercase();
        user = self.model(email=email, **extra_fields) # similar to **kwargs in functions
        user.set_password(password)
        user.save(using=self._db) # saves to manager's database
        return user
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'Admin')
        return self.create_user(email, password, **extra_fields)
    
# custom user model
class CustomUser(AbstractUser):

    username = None # removing username field as we are using email as pk
    
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Coordinator', 'Event Coordinator'),
        ('Photographer', 'Photographer'),
        ('Member', 'Club Member'),
        ('Guest', 'Guest'),
    )

    full_name = models.CharField(max_length=255, blank=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Guest')
    is_verified = models.BooleanField(default=False)
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pic/', blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []  # email & password are required by default no need to add here

    objects = CustomUserManager() # linking custom user manager to custom user model
    # by defualt Django runs User.objects to create users so we need to override it

    def __str__(self):
        return self.email

