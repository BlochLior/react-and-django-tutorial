"""
Custom management command to set up production environment.
This runs automatically during Render deployment via the build command.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site
from polls.models import UserProfile
import os


class Command(BaseCommand):
    help = 'Set up production environment (superuser, site configuration)'

    def handle(self, *args, **options):
        """Run production setup tasks"""
        
        # Only run in production
        if os.getenv('ENVIRONMENT') != 'production':
            self.stdout.write(self.style.WARNING('⚠️  Skipping - not in production environment'))
            return
        
        # 1. Create superuser if it doesn't exist
        superuser_email = os.getenv('SUPERUSER_EMAIL')
        superuser_password = os.getenv('SUPERUSER_PASSWORD')
        
        if not superuser_email or not superuser_password:
            self.stdout.write(self.style.WARNING(
                '⚠️  SUPERUSER_EMAIL or SUPERUSER_PASSWORD not set. Skipping superuser creation.'
            ))
            self.stdout.write('   Set these env vars if you need a Django admin superuser.')
        else:
            if not User.objects.filter(username='admin').exists():
                User.objects.create_superuser('admin', superuser_email, superuser_password)
                self.stdout.write(self.style.SUCCESS('✅ Superuser created'))
            else:
                # Update existing superuser email and password
                admin_user = User.objects.get(username='admin')
                admin_user.email = superuser_email
                admin_user.set_password(superuser_password)
                admin_user.save()
                self.stdout.write(self.style.SUCCESS('✅ Superuser updated with new email/password'))
                
                # Also update the UserProfile if it exists
                try:
                    profile = admin_user.userprofile
                    profile.google_email = superuser_email
                    profile.save()
                    self.stdout.write(self.style.SUCCESS('✅ UserProfile email updated'))
                except UserProfile.DoesNotExist:
                    self.stdout.write(self.style.WARNING('⚠️  No UserProfile found for admin user'))
        
        # 2. Update site configuration
        site_domain = 'react-and-django-tutorial.onrender.com'  # Your actual domain
        try:
            site = Site.objects.get(id=1)
            # Use the actual Render domain
            site.domain = site_domain
            site.name = 'Production Site'
            site.save()
            self.stdout.write(self.style.SUCCESS(f'✅ Site updated: {site_domain}'))
        except Site.DoesNotExist:
            self.stdout.write(self.style.ERROR('❌ Site with ID=1 not found'))
        
        # 3. Check OAuth configuration
        oauth_configured = SocialApp.objects.filter(provider='google').exists()
        if oauth_configured:
            self.stdout.write(self.style.SUCCESS('✅ Google OAuth app exists'))
            google_app = SocialApp.objects.get(provider='google')
            if google_app.client_id == 'your-google-client-id-here':
                self.stdout.write(self.style.WARNING(
                    '⚠️  OAuth still has placeholder credentials!'
                ))
                self.stdout.write(f'   Update via: https://{site_domain}/django-admin/socialaccount/socialapp/')
        else:
            self.stdout.write(self.style.WARNING('⚠️  No Google OAuth app found'))
            self.stdout.write(f'   Create one via: https://{site_domain}/django-admin/socialaccount/socialapp/')
        
        # 4. Summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('Production setup complete!'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('\nNext steps:')
        self.stdout.write('1. Access Django admin at: /django-admin/')
        self.stdout.write('2. Update Google OAuth credentials if needed')
        self.stdout.write('3. Test OAuth login flow\n')

