from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create UserProfile when a new user is created.
    This handles OAuth users who don't have profiles yet.
    """
    if created:
        UserProfile.objects.get_or_create(
            user=instance,
            defaults={
                'google_email': instance.email or '',
                'google_name': instance.username or '',
                'is_admin': False  # Default to non-admin, can be changed manually
            }
        )
        print(f"✅ Created UserProfile for user: {instance.username}")

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, created, **kwargs):
    """
    Ensure UserProfile exists for the user.
    Don't save existing profiles to avoid overwriting changes.
    """
    if created:
        # Profile was already created by create_user_profile signal
        return
    
    # For existing users, ensure they have a profile but don't overwrite it
    try:
        UserProfile.objects.get(user=instance)
    except UserProfile.DoesNotExist:
        # Create profile if it doesn't exist (for existing users)
        UserProfile.objects.create(
            user=instance,
            google_email=instance.email or '',
            google_name=instance.username or '',
            is_admin=False
        )
        print(f"✅ Created missing UserProfile for user: {instance.username}")
