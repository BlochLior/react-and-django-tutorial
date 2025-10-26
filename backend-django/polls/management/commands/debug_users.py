"""
Management command to debug user and profile data.
Shows what's actually stored in the database.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from polls.models import UserProfile
import os


class Command(BaseCommand):
    help = 'Debug user and profile data to understand OAuth issues'

    def handle(self, *args, **options):
        """Show user and profile data"""
        
        self.stdout.write(self.style.SUCCESS('🔍 Debugging user data...'))
        
        # Show all users
        self.stdout.write('\n👥 All Users:')
        for user in User.objects.all():
            self.stdout.write(f'  ID: {user.id}')
            self.stdout.write(f'  Username: {user.username}')
            self.stdout.write(f'  Email: {user.email}')
            self.stdout.write(f'  First Name: {user.first_name}')
            self.stdout.write(f'  Last Name: {user.last_name}')
            self.stdout.write(f'  Is Superuser: {user.is_superuser}')
            self.stdout.write(f'  Is Staff: {user.is_staff}')
            self.stdout.write('  ---')
        
        # Show all profiles
        self.stdout.write('\n👤 All UserProfiles:')
        for profile in UserProfile.objects.all():
            self.stdout.write(f'  User ID: {profile.user.id}')
            self.stdout.write(f'  User Username: {profile.user.username}')
            self.stdout.write(f'  Google Email: {profile.google_email}')
            self.stdout.write(f'  Google Name: {profile.google_name}')
            self.stdout.write(f'  Is Admin: {profile.is_admin}')
            self.stdout.write('  ---')
        
        # Show environment variables
        self.stdout.write('\n🌍 Environment Variables:')
        self.stdout.write(f'  MAIN_ADMIN_EMAIL: {os.getenv("MAIN_ADMIN_EMAIL", "NOT SET")}')
        self.stdout.write(f'  SUPERUSER_EMAIL: {os.getenv("SUPERUSER_EMAIL", "NOT SET")}')
        
        # Check for mismatches
        self.stdout.write('\n⚠️  Potential Issues:')
        for profile in UserProfile.objects.all():
            if profile.google_email != profile.user.email:
                self.stdout.write(f'  MISMATCH: User.email ({profile.user.email}) != Profile.google_email ({profile.google_email})')
