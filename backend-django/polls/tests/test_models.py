from django.test import TestCase
from django.utils import timezone
from datetime import timedelta

from polls.models import Choice
from polls.tests.utils import create_question_with_choices

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