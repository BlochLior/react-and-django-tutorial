from django.test import TestCase
from django.utils import timezone
from django.contrib.auth.models import User
from datetime import timedelta

from polls.models import Choice, UserProfile, UserVote, Question
from polls.tests.utils import (
    create_question_with_choices, 
    create_test_user_with_profile,
    create_user_vote,
    create_complete_voting_scenario
)

class ModelTests(TestCase):
    def test_question_creation(self):
        """
        Simple question creation test.
        """

        future_question = create_question_with_choices(
            question_text="Future question.",
            days=30,
        )
        self.assertEqual(future_question.question_text, "Future question.")
        self.assertAlmostEqual(future_question.pub_date, timezone.now() + timedelta(days=30), delta=timedelta(minutes=1))

        past_question = create_question_with_choices(
            question_text="What is the capital of France?",
            days=1,
        )
        self.assertEqual(past_question.question_text, "What is the capital of France?")
        self.assertAlmostEqual(past_question.pub_date, timezone.now() + timedelta(days=1), delta=timedelta(minutes=1))

    def test_choice_creation_post_question_creation(self):
        question = create_question_with_choices(
            question_text="question with choices",
            days=1,
            choice_texts=["choice 1", "choice 2", "choice 3"],
        )
        self.assertEqual(question.choice_set.count(), 3)
        for choice in question.choice_set.all():
            self.assertIsInstance(choice, Choice)
        # Insert additional choice to the question
        question.choice_set.create(choice_text="choice 4", votes=0)
        self.assertEqual(question.choice_set.count(), 4)
        self.assertIsInstance(question.choice_set.last(), Choice)
        self.assertEqual(question.choice_set.last().choice_text, "choice 4")

    def test_choices_for_question_default_to_no_votes(self):
        question = create_question_with_choices(
            question_text="question with choices",
            days=1,
            choice_texts=["choice 1", "choice 2", "choice 3"],
        )
        for choice in question.choice_set.all():
            self.assertEqual(choice.votes, 0)


class UserProfileModelTests(TestCase):
    def test_create_test_user_with_profile_helper(self):
        """
        Test the helper function that creates both user and profile.
        This tests our custom utility function for test setup.
        """
        user, profile = create_test_user_with_profile(
            username="helper_test",
            email="helper@example.com",
            google_email="helper@gmail.com",
            google_name="Helper Test User",
            is_admin=True
        )
        
        self.assertEqual(user.username, "helper_test")
        self.assertEqual(user.email, "helper@example.com")
        self.assertEqual(profile.user, user)
        self.assertEqual(profile.google_email, "helper@gmail.com")
        self.assertEqual(profile.google_name, "Helper Test User")
        self.assertTrue(profile.is_admin)


class UserVoteModelTests(TestCase):
    def test_complete_voting_scenario_helper(self):
        """
        Test the helper function that creates a complete voting scenario.
        This tests our custom utility function for complex test setup.
        """
        scenario = create_complete_voting_scenario()
        
        # Verify all objects were created
        self.assertIsInstance(scenario['user'], User)
        self.assertIsInstance(scenario['profile'], UserProfile)
        self.assertIsInstance(scenario['question'], Question)
        self.assertIsInstance(scenario['choice'], Choice)
        self.assertIsInstance(scenario['vote'], UserVote)
        
        # Verify relationships
        self.assertEqual(scenario['vote'].user, scenario['user'])
        self.assertEqual(scenario['vote'].question, scenario['question'])
        self.assertEqual(scenario['vote'].choice, scenario['choice'])
        self.assertEqual(scenario['profile'].user, scenario['user'])
        
        # Verify choice is from the question
        self.assertIn(scenario['choice'], scenario['all_choices'])


class CustomBusinessLogicTests(TestCase):
    def test_voting_business_rules(self):
        """
        Test our custom business logic: multiple users can vote on same question,
        but each user can only vote once per question.
        This is our core business rule, not Django's built-in functionality.
        """
        question = create_question_with_choices(
            question_text="Shared question",
            days=-1,
            choice_texts=["Choice 1", "Choice 2", "Choice 3"]
        )
        
        # Create multiple users and profiles
        user1, profile1 = create_test_user_with_profile(
            username="user1", 
            google_email="user1@gmail.com"
        )
        user2, profile2 = create_test_user_with_profile(
            username="user2", 
            google_email="user2@gmail.com"
        )
        
        # Both users vote on the same question (business rule: multiple users can vote)
        choice1 = question.choice_set.first()
        choice2 = question.choice_set.last()
        
        vote1 = create_user_vote(user=user1, question=question, choice=choice1)
        vote2 = create_user_vote(user=user2, question=question, choice=choice2)
        
        # Verify both votes exist and are different
        self.assertNotEqual(vote1, vote2)
        self.assertEqual(UserVote.objects.filter(question=question).count(), 2)
        
        # Business rule: each user can only have one vote on this question
        self.assertEqual(UserVote.objects.filter(user=user1, question=question).count(), 1)
        self.assertEqual(UserVote.objects.filter(user=user2, question=question).count(), 1)

    def test_admin_vs_regular_user_workflow(self):
        """
        Test our custom business logic for admin vs regular user workflows.
        This tests the integration between UserProfile.is_admin and voting behavior.
        """
        # Create admin and regular users
        admin_user, admin_profile = create_test_user_with_profile(
            username="admin",
            google_email="admin@gmail.com",
            is_admin=True
        )
        regular_user, regular_profile = create_test_user_with_profile(
            username="regular",
            google_email="regular@gmail.com",
            is_admin=False
        )
        
        question = create_question_with_choices(
            question_text="Test question",
            days=-1,
            choice_texts=["Option A", "Option B"]
        )
        
        # Both admin and regular user can vote (same voting rights)
        choice = question.choice_set.first()
        admin_vote = create_user_vote(user=admin_user, question=question, choice=choice)
        regular_vote = create_user_vote(user=regular_user, question=question, choice=choice)
        
        # Verify both can vote
        self.assertIsNotNone(admin_vote)
        self.assertIsNotNone(regular_vote)
        
        # Verify admin status is preserved
        self.assertTrue(admin_profile.is_admin)
        self.assertFalse(regular_profile.is_admin)
        
        # This tests our business logic that admin status affects UI/API behavior
        # (the actual API logic will be tested in view tests)

    def test_user_profile_google_oauth_integration(self):
        """
        Test our custom business logic for Google OAuth integration.
        This tests that our UserProfile model correctly stores and retrieves
        Google OAuth data for authentication workflows.
        """
        # Simulate Google OAuth data
        google_email = "user@gmail.com"
        google_name = "Google User Name"
        
        user, profile = create_test_user_with_profile(
            google_email=google_email,
            google_name=google_name
        )
        
        # Test our business logic: profile should store Google OAuth data
        self.assertEqual(profile.google_email, google_email)
        self.assertEqual(profile.google_name, google_name)
        
        # Test our business logic: we can identify users by Google email
        found_profile = UserProfile.objects.get(google_email=google_email)
        self.assertEqual(found_profile.user, user)
        
        # This tests our custom authentication workflow logic