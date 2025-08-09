from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
import json
from datetime import timedelta

from polls.models import Question, Choice
from polls.schemas import QuestionSchema, ChoiceSchema # and so on maybe
from polls.tests.utils import make_json_post_request, create_question_with_choices

# --- Client Views ---

# --- client_poll_list ---
class TestClientPollList(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('polls:client_poll_list')

        # Create questions that should be visible
        self.question_1 = create_question_with_choices(
            question_text="First published question.",
            days=-10,
            choice_texts=["A", "B"]
        )
        self.question_2 = create_question_with_choices(
            question_text="Second published question.",
            days=-5,
            choice_texts=["C", "D"]
        )

        # Create more questions to test pagination (assuming 5 per page)
        for i in range(3, 8):
            create_question_with_choices(
                question_text=f"Past question {i}.",
                days=-(20 - i),
                choice_texts=[f"E{i}", f"F{i}"]
            )

        # Create questions that should NOT be visible
        self.future_question = create_question_with_choices(
            question_text="A question from the future.",
            days=5,
            choice_texts=["G", "H"]
        )
        self.choiceless_question = create_question_with_choices(
            question_text="A question with no choices.",
            days=-1,
            choice_texts=[]
        )

    def test_client_poll_list_returns_200_ok(self):
        """
        Tests that the poll list view returns a 200 OK status code.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    def test_client_poll_list_excludes_future_and_choiceless_questions(self):
        """
        Tests that the poll list view excludes future and choiceless questions.
        """
        response = self.client.get(self.url)
        response_data = response.json()

        question_texts = [q['question_text'] for q in response_data['results']]

        self.assertNotIn("A question from the future.", question_texts)
        self.assertNotIn("A question with no choices.", question_texts)

        self.assertIn("First published question.", question_texts)
        self.assertIn("Second published question.", question_texts)

    def test_client_poll_list_returns_paginated_data_and_metadata(self):
        """
        Tests that the poll list view returns paginated data and metadata.
        """
        response = self.client.get(self.url)
        response_data = response.json()

        self.assertIn("count", response_data)
        self.assertEqual(response_data['count'], 7)
        self.assertIn("next", response_data)
        self.assertIsNotNone(response_data['next'])
        self.assertIn("previous", response_data)
        self.assertIsNone(response_data['previous'])
        self.assertIn("results", response_data)
        self.assertEqual(len(response_data['results']), 5)
        
    def test_client_poll_list_paginates_to_second_page(self):
        """
        Tests that the poll list view paginates to the second page with correct questions.
        """
        response = self.client.get(self.url + "?page=2")
        response_data = response.json()

        self.assertEqual(len(response_data['results']), 2)
        self.assertIsNotNone(response_data['previous'])
        self.assertIsNone(response_data['next'])
        

# --- client_poll_detail ---
class TestClientPollDetail(TestCase):
    def setUp(self):
        self.client = Client()
        self.question = create_question_with_choices(
            question_text="Test question",
            days=-1,
            choice_texts=["A", "B"]
        )
        self.question_id = self.question.id

    def test_client_poll_detail_returns_200_ok(self):
        """
        Tests that the poll detail view returns a 200 OK status code.
        """
        url = reverse('polls:client_poll_detail', args=[self.question_id])
        response = self.client.get(url)
        response_data = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response_data['question_text'], "Test question")
        self.assertEqual(len(response_data['choices']), 2)

    def test_client_poll_detail_returns_404_for_nonexistent_question(self):
        """
        Tests that the poll detail view returns a 404 Not Found status code for a nonexistent question.
        """
        url = reverse('polls:client_poll_detail', args=[9999])
        response = self.client.get(url)
        self.assertEqual(response.status_code, 404)
    
# --- vote ---
class TestVoteView(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('polls:vote')
        
        # Create a question with two choices for testing
        self.question = create_question_with_choices(
            question_text="Favorite color?",
            days=-1,
            choice_texts=["Blue", "Green"]
        )
        self.choice_blue = self.question.choice_set.get(choice_text="Blue")
        self.choice_green = self.question.choice_set.get(choice_text="Green")

    def test_vote_successfully_increments_votes(self):
        """
        Tests that a valid vote submission increments the correct choice's vote count.
        """
        initial_votes_blue = self.choice_blue.votes
        
        # Data that mimics a client submission
        vote_data = {
            "votes": {
                self.question.id: self.choice_blue.id
            }
        }
        
        response = make_json_post_request(self.client, self.url, vote_data)
        
        # Refresh the object from the database to get the new vote count
        self.choice_blue.refresh_from_db()
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.choice_blue.votes, initial_votes_blue + 1)
        self.assertEqual(self.choice_green.votes, 0) # Should be unchanged

    def test_vote_returns_400_for_invalid_json(self):
        """
        Tests that the view returns a 400 Bad Request for malformed data.
        """
        invalid_data = "This is not JSON"
        response = make_json_post_request(self.client, self.url, invalid_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"dictionary", response.content)

    def test_vote_returns_400_for_invalid_pydantic_schema(self):
        """
        Tests that the view returns a 400 for data that doesn't match the schema.
        """
        invalid_data = {
            "votes": {
                "not_an_int": self.choice_blue.id # key is not an integer
            }
        }
        response = make_json_post_request(self.client, self.url, invalid_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"int_parsing", response.content)

    def test_vote_returns_404_for_nonexistent_choice(self):
        """
        Tests that a vote for a non-existent choice returns a 404.
        """
        vote_data = {
            "votes": {
                self.question.id: 9999 # Non-existent choice ID
            }
        }
        response = make_json_post_request(self.client, self.url, vote_data)
        self.assertEqual(response.status_code, 404)
        self.assertIn(b"Choice with this ID was not found", response.content)

    def test_vote_returns_400_if_choice_does_not_belong_to_question(self):
        """
        Tests that the view prevents voting for a choice that doesn't belong to the question.
        """
        other_question = create_question_with_choices(
            question_text="Another question?",
            days=-1,
            choice_texts=["X"]
        )
        vote_data = {
            "votes": {
                self.question.id: other_question.choice_set.first().id # Invalid choice for the question
            }
        }
        response = make_json_post_request(self.client, self.url, vote_data)
        self.assertEqual(response.status_code, 400)
        self.assertIn(b"Choice does not belong to this question", response.content)


# class TestAdminViews(TestCase):
    # --- admin_dashboard ---

    # --- admin_question_detail ---

    # --- admin_create_question ---

    # --- admin_results_summary ---

    