"""
Custom management command to set up production environment.
This runs automatically during Render deployment via the build command.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from allauth.socialaccount.models import SocialApp
from django.contrib.sites.models import Site
import os


class Command(BaseCommand):
    help = 'Set up production environment (superuser, site configuration)'

    def handle(self, *args, **options):
        """Run production setup tasks"""
        
        # Only run in production
        if os.getenv('ENVIRONMENT') != 'production':
            self.stdout.write(self.style.WARNING('⚠️  Skipping - not in production environment'))
            return
        
        # 1. Ensure admin user exists (fallback for Django admin access)
        superuser_email = os.getenv('SUPERUSER_EMAIL')
        superuser_password = os.getenv('SUPERUSER_PASSWORD')
        main_admin_email = os.getenv('MAIN_ADMIN_EMAIL')
        
        # Create/update admin user for Django admin access
        if superuser_email and superuser_password:
            if not User.objects.filter(username='admin').exists():
                User.objects.create_superuser('admin', superuser_email, superuser_password)
                self.stdout.write(self.style.SUCCESS('✅ Admin user created for Django admin access'))
            else:
                admin_user = User.objects.get(username='admin')
                admin_user.email = superuser_email
                admin_user.set_password(superuser_password)
                admin_user.save()
                self.stdout.write(self.style.SUCCESS('✅ Admin user updated'))
        else:
            self.stdout.write(self.style.WARNING('⚠️  No admin credentials - Django admin access limited'))
        
        # 2. Handle OAuth admin user (for app access)
        if main_admin_email and User.objects.filter(email=main_admin_email).exists():
            oauth_admin_user = User.objects.get(email=main_admin_email)
            # Make sure OAuth user is also a superuser
            if not oauth_admin_user.is_superuser:
                oauth_admin_user.is_superuser = True
                oauth_admin_user.is_staff = True
                oauth_admin_user.save()
                self.stdout.write(self.style.SUCCESS('✅ OAuth user made superuser'))
            else:
                self.stdout.write(self.style.SUCCESS('✅ OAuth admin user ready'))
        else:
            self.stdout.write(self.style.WARNING('⚠️  OAuth admin user not found - will be created on first login'))
        
        # 3. Update site configuration
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
        
        # 4. Check OAuth configuration
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
        
        # 5. Summary
        self.stdout.write(self.style.SUCCESS('\n' + '='*60))
        self.stdout.write(self.style.SUCCESS('Production setup complete!'))
        self.stdout.write(self.style.SUCCESS('='*60))
        self.stdout.write('\nNext steps:')
        self.stdout.write('1. Access Django admin at: /django-admin/')
        self.stdout.write('2. Update Google OAuth credentials if needed')
        self.stdout.write('3. Test OAuth login flow\n')

