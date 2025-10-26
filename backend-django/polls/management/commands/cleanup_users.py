"""
Management command to clean up conflicting users for OAuth.
Run this to remove users that are preventing OAuth from working properly.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os


class Command(BaseCommand):
    help = 'Clean up conflicting users to allow OAuth to work properly'

    def handle(self, *args, **options):
        """Clean up users"""
        
        self.stdout.write(self.style.WARNING('🧹 Starting user cleanup...'))
        
        # Show current users
        self.stdout.write('\n📋 Current users:')
        for user in User.objects.all():
            self.stdout.write(f'  - {user.username} ({user.email}) - Superuser: {user.is_superuser}')
        
        # Remove users with wrong emails
        wrong_email_users = User.objects.exclude(email__in=[
            'blochlior@gmail.com',  # Your actual email
            os.getenv('SUPERUSER_EMAIL', ''),  # Keep superuser email
        ]).exclude(email='')
        
        if wrong_email_users.exists():
            self.stdout.write(f'\n🗑️  Removing {wrong_email_users.count()} users with wrong emails:')
            for user in wrong_email_users:
                self.stdout.write(f'  - Removing: {user.username} ({user.email})')
                user.delete()
            self.stdout.write(self.style.SUCCESS('✅ Cleanup complete!'))
        else:
            self.stdout.write(self.style.SUCCESS('✅ No cleanup needed'))
        
        # Show remaining users
        self.stdout.write('\n📋 Remaining users:')
        for user in User.objects.all():
            self.stdout.write(f'  - {user.username} ({user.email}) - Superuser: {user.is_superuser}')
        
        self.stdout.write('\n🎯 Next steps:')
        self.stdout.write('1. Clear browser cookies completely')
        self.stdout.write('2. Try Google OAuth login')
        self.stdout.write('3. Should create new user with blochlior@gmail.com')
