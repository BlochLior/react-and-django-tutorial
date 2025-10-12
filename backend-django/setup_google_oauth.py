#!/usr/bin/env python
"""
Script to set up Google OAuth app in Django allauth
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
django.setup()

from allauth.socialaccount.models import SocialApp  # noqa: E402
from django.contrib.sites.models import Site  # noqa: E402

# Get or create the default site
site, created = Site.objects.get_or_create(
    id=1,
    defaults={
        'domain': '127.0.0.1:8000',
        'name': 'localhost'
    }
)

# Create Google OAuth app (you'll need to replace these with real values)
google_app, created = SocialApp.objects.get_or_create(
    provider='google',
    defaults={
        'name': 'Google OAuth',
        'client_id': 'your-google-client-id-here',
        'secret': 'your-google-client-secret-here',
    }
)

# Add the site to the app
google_app.sites.add(site)

print(f"Google OAuth app {'created' if created else 'already exists'}")
print(f"App ID: {google_app.id}")
print(f"Client ID: {google_app.client_id}")
print(f"Sites: {list(google_app.sites.all())}")

print("\nNext steps:")
print("1. Go to Google Cloud Console")
print("2. Create OAuth 2.0 credentials")
print("3. Update the client_id and secret in Django admin")
print("4. Or run: python manage.py shell and update the values")
