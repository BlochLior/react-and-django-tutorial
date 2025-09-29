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
def save_user_profile(sender, instance, **kwargs):
    """
    Automatically save UserProfile when User is saved.
    Only create if it doesn't exist, don't override existing data.
    """
    try:
        # Only save if profile exists, don't create new one
        if hasattr(instance, 'userprofile'):
            instance.userprofile.save()
    except UserProfile.DoesNotExist:
        # Create profile if it doesn't exist (for existing users)
        UserProfile.objects.get_or_create(
            user=instance,
            defaults={
                'google_email': instance.email or '',
                'google_name': instance.username or '',
                'is_admin': False
            }
        )
        print(f"✅ Created missing UserProfile for user: {instance.username}")
