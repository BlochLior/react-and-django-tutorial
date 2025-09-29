"""
Tests for authentication business logic and user flow
"""
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from polls.models import UserProfile, UserVote, Question, Choice
from django.utils import timezone
from .utils import (
    create_test_user_with_profile, 
    create_question_with_choices, 
    create_user_vote,
    make_json_post_request
)
import json

class AuthenticationBusinessLogicTests(TestCase):
    """Test authentication business logic and user flow"""
    
    def setUp(self):
        """Set up test data using centralized helpers"""
        # Create test user with profile using helper
        self.user, self.profile = create_test_user_with_profile(
            username='testuser',
            email='test@gmail.com',
            google_email='test@gmail.com',
            google_name='Test User',
            is_admin=False
        )
        
        # Create admin user with profile using helper
        self.admin_user, self.admin_profile = create_test_user_with_profile(
            username='admin',
            email='admin@gmail.com',
            google_email='admin@gmail.com',
            google_name='Admin User',
            is_admin=True
        )
        
        # Ensure profiles exist and are properly configured
        self.profile.refresh_from_db()
        self.admin_profile.refresh_from_db()
        
        # Create test question with choices using helper
        self.question = create_question_with_choices(
            question_text="Test Question?",
            days=0,  # Published now
            choice_texts=["Choice 1", "Choice 2"]
        )
        
        # Get choices for easy access
        self.choice1 = self.question.choice_set.first()
        self.choice2 = self.question.choice_set.last()
        
        self.client = Client()
    
    def test_user_info_unauthenticated(self):
        """Test user_info endpoint for unauthenticated user"""
        response = self.client.get('/auth/user-info/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertFalse(data['authenticated'])
        self.assertNotIn('email', data)
        self.assertNotIn('name', data)
    
    def test_user_info_authenticated_client(self):
        """Test user_info endpoint for authenticated client user"""
        # Delete and recreate profile to avoid signal interference
        self.profile.delete()
        profile = UserProfile.objects.create(
            user=self.user,
            google_email='test@gmail.com',
            google_name='Test User',
            is_admin=False
        )
        
        self.client.force_login(self.user)
        response = self.client.get('/auth/user-info/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['authenticated'])
        self.assertEqual(data['email'], 'test@gmail.com')
        self.assertEqual(data['name'], 'Test User')
        self.assertFalse(data['is_admin'])
        self.assertFalse(data['has_voted'])
    
    def test_user_info_authenticated_admin(self):
        """Test user_info endpoint for authenticated admin user"""
        # Delete and recreate profile to avoid signal interference
        self.admin_profile.delete()
        profile = UserProfile.objects.create(
            user=self.admin_user,
            google_email='admin@gmail.com',
            google_name='Admin User',
            is_admin=True
        )
        
        self.client.force_login(self.admin_user)
        response = self.client.get('/auth/user-info/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertTrue(data['authenticated'])
        self.assertEqual(data['email'], 'admin@gmail.com')
        self.assertEqual(data['name'], 'Admin User')
        self.assertTrue(data['is_admin'])
        self.assertFalse(data['has_voted'])
    
    def test_user_voting_status(self):
        """Test that has_voted reflects actual voting status"""
        # Initially no votes
        self.client.force_login(self.user)
        response = self.client.get('/auth/user-info/')
        data = response.json()
        self.assertFalse(data['has_voted'])
        
        # User votes using helper
        create_user_vote(
            user=self.user,
            question=self.question,
            choice=self.choice1
        )
        
        # Now should show as voted
        response = self.client.get('/auth/user-info/')
        data = response.json()
        self.assertTrue(data['has_voted'])
    
    def test_admin_stats_access(self):
        """Test admin_stats endpoint access control"""
        # Unauthenticated user
        response = self.client.get('/auth/admin-stats/')
        self.assertEqual(response.status_code, 403)
        
        # Regular user (not admin)
        self.client.force_login(self.user)
        response = self.client.get('/auth/admin-stats/')
        self.assertEqual(response.status_code, 403)
        
        # Admin user - ensure profile is properly configured
        self.admin_profile.delete()
        profile = UserProfile.objects.create(
            user=self.admin_user,
            google_email='admin@gmail.com',
            google_name='Admin User',
            is_admin=True
        )
        
        self.client.force_login(self.admin_user)
        response = self.client.get('/auth/admin-stats/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('total_voters', data)
        self.assertIn('total_votes', data)
        self.assertIn('total_questions', data)
        self.assertIn('hidden_questions', data)
    
    def test_vote_submission_authentication(self):
        """Test that vote submission requires authentication"""
        # Unauthenticated vote submission
        vote_data = {
            'votes': {
                str(self.question.id): self.choice1.id
            }
        }
        response = make_json_post_request(self.client, '/polls/vote/', vote_data)
        self.assertEqual(response.status_code, 403)
        
        # Authenticated vote submission
        self.client.force_login(self.user)
        response = make_json_post_request(self.client, '/polls/vote/', vote_data)
        self.assertEqual(response.status_code, 200)
        
        # Verify vote was recorded
        self.assertTrue(UserVote.objects.filter(user=self.user, question=self.question).exists())
    
    def test_user_profile_creation_signal(self):
        """Test that UserProfile is created automatically for new users"""
        # Create new user
        new_user = User.objects.create_user(
            username='newuser',
            email='new@example.com',
            password='newpass123'
        )
        
        # Check if profile was created
        self.assertTrue(UserProfile.objects.filter(user=new_user).exists())
        profile = UserProfile.objects.get(user=new_user)
        self.assertEqual(profile.google_email, 'new@example.com')
        self.assertEqual(profile.google_name, 'newuser')
        self.assertFalse(profile.is_admin)
    
    def test_business_logic_user_roles(self):
        """Test business logic for different user roles"""
        # Test client user capabilities
        self.client.force_login(self.user)
        
        # Can access polls
        response = self.client.get('/polls/')
        self.assertEqual(response.status_code, 200)
        
        # Cannot access admin endpoints
        response = self.client.get('/auth/admin-stats/')
        self.assertEqual(response.status_code, 403)
        
        # Test admin user capabilities
        self.client.force_login(self.admin_user)
        
        # Can access polls
        response = self.client.get('/polls/')
        self.assertEqual(response.status_code, 200)
        
        # Can access admin endpoints
        response = self.client.get('/admin/')
        self.assertEqual(response.status_code, 200)
    
    def test_vote_tracking_business_logic(self):
        """Test vote tracking business logic"""
        self.client.force_login(self.user)
        
        # User votes on question
        vote_data = {
            'votes': {
                str(self.question.id): self.choice1.id
            }
        }
        response = make_json_post_request(self.client, '/polls/vote/', vote_data)
        self.assertEqual(response.status_code, 200)
        
        # Check that vote is tracked
        vote = UserVote.objects.get(user=self.user, question=self.question)
        self.assertEqual(vote.choice, self.choice1)
        
        # Check that choice vote count increased
        self.choice1.refresh_from_db()
        self.assertEqual(self.choice1.votes, 1)
        
        # User changes vote
        vote_data = {
            'votes': {
                str(self.question.id): self.choice2.id
            }
        }
        response = make_json_post_request(self.client, '/polls/vote/', vote_data)
        self.assertEqual(response.status_code, 200)
        
        # Check that old vote was removed and new vote was created
        self.assertEqual(UserVote.objects.filter(user=self.user, question=self.question).count(), 1)
        vote = UserVote.objects.get(user=self.user, question=self.question)
        self.assertEqual(vote.choice, self.choice2)
        
        # Check vote counts
        self.choice1.refresh_from_db()
        self.choice2.refresh_from_db()
        self.assertEqual(self.choice1.votes, 0)  # Old vote removed
        self.assertEqual(self.choice2.votes, 1)  # New vote added
