import datetime
from django.utils import timezone
from django.urls import reverse
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APITestCase

from pydantic import ValidationError

from .models import Question, Choice
from .schemas import QuestionSchema, ChoiceSchema, VoteSchema

def create_question(question_text, days):
    """
    Create a question with the given 'question_text' and published the given number of 'days' offset to now (negative for questions published in the past, positive for questions that have yet to be published).
    This is for tests in the future that i'll create, to assist with creating tests.
    """
    time = timezone.now() + datetime.timedelta(days=days)
    return Question.objects.create(question_text=question_text, pub_date=time)

def create_question_with_choices(question_text, days, choice_texts):
    """
    Creates a Question with a given question_text and pub_date,
    and also creates a list of Choices for that question.
    """
    question = create_question(question_text=question_text, days=days)
    for choice_text in choice_texts:
        Choice.objects.create(question=question, choice_text=choice_text, votes=0)
    return question

class ModelTests(TestCase):
    # Model-level tests
    def test_question_creation(self):
        # Create a Question using Question.objects.create(), and assert that its' fields
        # match what we pass to them.
        now = timezone.now()
        question = Question.objects.create(question_text="Test question 1", pub_date=now)
        time_difference = timezone.now() - question.pub_date
        self.assertTrue(abs(time_difference) < datetime.timedelta(seconds=1))
        self.assertEqual(question.question_text, "Test question 1")

    def test_votes_default_to_zero(self):
        # Create a Choice and assert that its votes are 0.
        question = create_question_with_choices(
            question_text="Test question 1",
            days=0,
            choice_texts=["Choice"]
        )
        self.assertEqual(question.choice_set.first().votes, 0)

class SchemaTests(TestCase):
    # Schema-level tests
    def test_question_schema_validation(self):
        """
        Create a dictionary with valid data (including a list of choices)
        and assert that QuestionSchema.model_validate(data) doesn't raise a ValidationError.
        """
        data = {
            "id": 1,
            "question_text": "Is this schema valid?",
            "pub_date": timezone.now().isoformat(),
            "choices": [
                {"id": 101, "choice_text": "Choice 1a", "votes": 0}, 
                {"id": 102, "choice_text": "Choice 2b", "votes": 0}
                ]
        }
        QuestionSchema.model_validate(data)

    def test_choice_schema_validation(self):
        # Tests that a valid Choice dictionary can be validated by ChoiceSchema.
        valid_choice_data = {
            "id": 1,
            "choice_text": "A valid choice",
            "votes": 10
        }
        try:
            ChoiceSchema.model_validate(valid_choice_data)
        except ValidationError as e:
            self.fail(f"ChoiceSchema validation failed: {e}")

    def test_vote_schema_validation(self):
        """
        Tests that a valid Vote dictionary can be validated by VoteSchema.
        """
        valid_vote_data = {
            "choice_id": 1
        }
        try:
            VoteSchema.model_validate(valid_vote_data)
        except ValidationError as e:
            self.fail(f"VoteSchema validation failed: {e}")

    def test_question_schema_fails_on_missing_question_text(self):
        # Tests that a QuestionSchema fails validation when question_text is missing.
        invalid_question_data = {
            "pub_date": timezone.now().isoformat(),
            "choices": [{"choice_text": "Choice 1a"}, {"choice_text": "Choice 2b"}]
        }
        with self.assertRaises(ValidationError):
            QuestionSchema.model_validate(invalid_question_data)

    def test_question_schema_fails_with_invalid_pub_date_format(self):
        # Tests that a QuestionSchema fails validation when pub_date is in an invalid format.
        invalid_question_data = {
            "question_text": "Test question 1",
            "pub_date": "invalid date",
            "choices": [{"choice_text": "Choice 1a"}, {"choice_text": "Choice 2b"}]
        }
        with self.assertRaises(ValidationError):
            QuestionSchema.model_validate(invalid_question_data)

    def test_choice_schema_invalid_data(self):
        # Tests that an invalid Choice dictionary fails validation.
        invalid_choice_data = {
            "id": 1,
            "choice_text": "A valid choice",
            "votes": "not an integer"
        }
        with self.assertRaises(ValidationError):
            ChoiceSchema.model_validate(invalid_choice_data)

    def test_vote_schema_invalid_data(self):
        # Tests that an invalid Vote dictionary fails validation.
        invalid_vote_data = {
            "choice_id": "not an integer"
        }
        with self.assertRaises(ValidationError):
            VoteSchema.model_validate(invalid_vote_data)

class QuestionAPITests(APITestCase):
    # API-level tests
    def setUp(self):
        # Questions that should be returned by the public API
        self.live_question = create_question_with_choices(
            question_text="Live question",
            days=0,
            choice_texts=["A", "B"]
        )
        self.old_question = create_question_with_choices(
            question_text="Old question",
            days=-30,
            choice_texts=["A", "B"]
        )
        # Questions that should be hidden from the public API
        self.future_question = create_question_with_choices(
            question_text="Future question",
            days=30,
            choice_texts=["A", "B"]
        )
        self.choiceless_question = create_question(
            question_text="Choiceless question",
            days=0,
        )

    def test_list_questions_api_api_public_view(self):
        """
        Ensure the question list API endpoint only shows live, complete questions.
        """
        url = reverse('polls:question_list_api')
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['question_text'], self.live_question.question_text)
        self.assertEqual(response.data[1]['question_text'], self.old_question.question_text)

    def test_list_questions_api_show_all(self):
        """
        Ensure the API returns all questions when queried with the correct flags.
        """
        url = reverse('polls:question_list_api')
        response = self.client.get(url, format='json', data={'show_future': 'true', 'show_choiceless': 'true'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)
        self.assertEqual(response.data[0]['question_text'], self.live_question.question_text)
        self.assertEqual(response.data[1]['question_text'], self.old_question.question_text)
        self.assertEqual(response.data[2]['question_text'], self.future_question.question_text)
        self.assertEqual(response.data[3]['question_text'], self.choiceless_question.question_text)

    def test_detail_question_api(self):
        """
        Ensure the question detail API endpoint works and returns a single question.
        """
        url = reverse('polls:question_detail_api', args=[self.live_question.id])
        response = self.client.get(url, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['question_text'], self.live_question.question_text)

    def test_404_for_nonexistent_question(self):
        """
        Ensure the question detail API endpoint returns a 404 for a nonexistent question.
        """
        non_existent_question_id = 999
        url = reverse('polls:question_detail_api', args=[non_existent_question_id])
        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class VoteAPITests(APITestCase):
    # API-level tests
    def setUp(self):
        self.question = create_question_with_choices(
            question_text="Test question 1",
            days=0,
            choice_texts=["Choice 1a", "Choice 2b"]
        )

    def test_successful_vote(self):
        # Ensure succesful vote returns 200 and updates vote count
        url = reverse('polls:vote_api', args=[self.question.id])
        response = self.client.post(url, format='json', data={'choice_id': self.question.choice_set.first().id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['question_text'], self.question.question_text)

    def test_invalid_choice_id(self):
        # Ensure the vote API endpoint returns a 400 for an invalid choice_id.
        url = reverse('polls:vote_api', args=[self.question.id])
        response = self.client.post(url, format='json', data={'choice_id': 999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(self.question.choice_set.first().votes, 0)
        self.assertEqual(self.question.choice_set.last().votes, 0)

    def test_nonexistent_question(self):
        """
        Ensure the vote API endpoint returns a 404 for a nonexistent question.
        """
        non_existent_question_id = 999
        url = reverse('polls:vote_api', args=[non_existent_question_id])
        response = self.client.post(url, format='json', data={'choice_id': self.question.choice_set.first().id})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        