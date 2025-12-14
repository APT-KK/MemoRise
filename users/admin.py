from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser

    list_display = ['email', 'full_name', 'role', 'is_verified', 'is_staff']
    list_filter = ['role', 'is_verified', 'is_staff', 'is_superuser']
    # fieldsets means what admin can change in the user form
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'profile_picture', 'bio')}),
        ('Permissions', {'fields': ('role', 'is_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # after add user what happens 
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'confirm_password'), 
        }),
    )

    search_fields = ['email', 'full_name']
    ordering = ['email']

admin.site.register(CustomUser, CustomUserAdmin)
