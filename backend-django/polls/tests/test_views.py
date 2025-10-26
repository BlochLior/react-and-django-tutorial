from django.test import TestCase, Client
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient
from datetime import timedelta

from polls.models import Question, UserVote, UserProfile
from polls.tests.utils import (
    make_json_post_request, 
    create_question_with_choices, 
    make_json_put_request,
    create_test_user_with_profile,
    create_user_vote
)
from polls.views import ADMIN_QUESTIONS_PER_PAGE

# --- Client Views ---

# --- client_poll_list ---
class TestClientPollList(TestCase):
    def setUp(self):
        self.client = Client()
        self.url = reverse('polls:client_poll_list')

        # Create questions that should be visible
        # Note: Questions ordered old to new, so question_1 should be oldest to appear on page 1
        self.question_1 = create_question_with_choices(
            question_text="First published question.",
            days=-20,  # Oldest question
            choice_texts=["A", "B"]
        )
        self.question_2 = create_question_with_choices(
            question_text="Second published question.",
            days=-19,  # Second oldest
            choice_texts=["C", "D"]
        )

        # Create more questions to test pagination (assuming 5 per page)
        for i in range(3, 8):
            create_question_with_choices(
                question_text=f"Past question {i}.",
                days=-(18 - i),  # Days -15, -14, -13, -12, -11 (newer than question 1 and 2)
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
        self.total_pages = 2

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

    def test_client_poll_list_wrong_query_params_for_page(self):
        """
        Tests that the poll list view returns appropriate page for wrong query params for page.
        """
        response_not_int = self.client.get(self.url + "?page=not_an_int")
        response_data = response_not_int.json()
        self.assertEqual(1, response_data['page'])

        response_page_out_of_range = self.client.get(self.url + "?page=100")
        response_data = response_page_out_of_range.json()
        self.assertEqual(2, response_data['page'])

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
    
# Note: TestVoteView has been replaced by TestVoteWithAuthentication
# which provides comprehensive testing of the authenticated voting system


# --- Admin Views ---

# --- admin_create_question ---
class TestAdminCreateQuestion(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('admin_create_question')
        # Create admin user and authenticate
        self.admin_user, self.admin_profile = create_test_user_with_profile(
            username='admin',
            email='admin@example.com',
            google_email='admin@gmail.com',
            is_admin=True
        )
        self.client.force_authenticate(user=self.admin_user)

    def test_admin_create_question_returns_201_created(self):
        """
        Tests that the admin create question view returns a 201 Created status code.
        """
        response_data = {
            "question_text": "Test question",
            "pub_date": timezone.now().isoformat(),
            "choices": [
                {"choice_text": "Choice 1", "votes": 0},
                {"choice_text": "Choice 2", "votes": 0}
            ]
        }
        response = make_json_post_request(self.client, self.url, response_data)
        self.assertEqual(response.status_code, 201)

    def test_admin_create_question_saves_correct_data(self):
        """
        Tests that the admin create question view saves the correct data.
        """
        now = timezone.now()
        response_data = {
            "question_text": "Test question",
            "pub_date": now.isoformat(),
            "choices": [
                {"choice_text": "Choice 1", "votes": 0},
                {"choice_text": "Choice 2", "votes": 0}
            ]
        }
        make_json_post_request(self.client, self.url, response_data)
        
        self.assertEqual(Question.objects.count(), 1)
        question = Question.objects.first()
        assert question is not None  # Type assertion for linter
        self.assertEqual(question.question_text, "Test question")
        self.assertEqual(question.pub_date, now)
        self.assertEqual(question.choice_set.count(), 2)
        self.assertEqual(question.choice_set.first().choice_text, "Choice 1")
        self.assertEqual(question.choice_set.first().votes, 0)
        self.assertEqual(question.choice_set.last().choice_text, "Choice 2")
        self.assertEqual(question.choice_set.last().votes, 0)

    def test_admin_create_question_returns_400_for_invalid_json(self):
        """
        Tests that the admin create question view returns a 400 Bad Request for malformed data.
        """
        # Test with actual invalid JSON string
        response_1 = self.client.post(self.url, "This is not JSON", content_type='application/json')
        self.assertEqual(response_1.status_code, 400)
        self.assertIn(b"JSON parse error", response_1.content)

        invalid_data_2 = {
            "pub_date": timezone.now().isoformat(),
            "choices": [
                {"choice_text": "Choice 1", "votes": 0},
                {"choice_text": "Choice 2", "votes": 0}
            ]
        }
        response_2 = make_json_post_request(self.client, self.url, invalid_data_2)
        self.assertEqual(response_2.status_code, 400)

        invalid_data_3 = {
            "question_text": "Test question",
            "pub_date": timezone.now().isoformat(),
            "choices": 5
        }
        response_3 = make_json_post_request(self.client, self.url, invalid_data_3)
        self.assertEqual(response_3.status_code, 400)

    def test_admin_create_question_returns_405_for_non_post_requests(self):
        """
        Tests that the admin create question view returns a 405 Method Not Allowed for non-POST requests.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 405)

    def test_admin_create_question_can_create_future_question(self):
        """
        Tests that the admin create question view can create a future question.
        """
        future_pub_date = timezone.now() + timedelta(days=5)
        response_data = {
            "question_text": "Test future question",
            "pub_date": future_pub_date.isoformat(),
            "choices": [
                {"choice_text": "Choice 1", "votes": 0},
                {"choice_text": "Choice 2", "votes": 0}
            ]
        }
        response = make_json_post_request(self.client, self.url, response_data)
        
        self.assertEqual(response.status_code, 201)
        question = Question.objects.first()
        assert question is not None  # Type assertion for linter
        self.assertEqual(question.question_text, "Test future question")
        self.assertEqual(question.pub_date, future_pub_date)

    def test_admin_create_question_can_create_choiceless_question(self):
        """
        Tests that the admin create question view can create a question without choices.
        """
        response_data = {
            "question_text": "Test choiceless question",
            "pub_date": timezone.now().isoformat(),
            "choices": []
        }
        response = make_json_post_request(self.client, self.url, response_data)
        
        self.assertEqual(response.status_code, 201)
        question = Question.objects.first()
        assert question is not None  # Type assertion for linter
        self.assertEqual(question.question_text, "Test choiceless question")
        self.assertEqual(question.choice_set.count(), 0)
    
# --- admin_dashboard ---
class TestAdminDashboard(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('admin_dashboard')
        # Create admin user and authenticate
        self.admin_user, self.admin_profile = create_test_user_with_profile(
            username='admin',
            email='admin@example.com',
            google_email='admin@gmail.com',
            is_admin=True
        )
        self.client.force_authenticate(user=self.admin_user)

        if self._testMethodName == "test_admin_dashboard_empty_database":
            return

        # Create a total of 19 questions for comprehensive testing
        self.question_1_current = create_question_with_choices(
            question_text="Test question 1 current",
            days=0,
            choice_texts=["Choice 1", "Choice 2"]
        )
        self.question_2_past = create_question_with_choices(
            question_text="Test question 2 past",
            days=-5,
            choice_texts=["Choice 3", "Choice 4"]
        )
        self.question_3_choiceless = create_question_with_choices(
            question_text="Test choiceless question",
            days=-10,
            choice_texts=[]
        )
        self.question_4_future = create_question_with_choices(
            question_text="Test future question",
            days=15,
            choice_texts=["Choice 5", "Choice 6"]
        )
        # Create 15 additional questions for a total of 19
        for i in range(5, 20):
            setattr(self, f"question_{i}", create_question_with_choices(
                question_text=f"Test question {i}",
                days=-(20 - i),
                choice_texts=[f"Choice {i}"]
            ))


    def test_admin_dashboard_returns_200_ok(self):
        """
        Tests that the admin dashboard view returns a 200 OK status code.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    def test_admin_dashboard_returns_all_existing_questions_and_data(self):
        """
        Tests that the admin dashboard view returns all existing questions and their data.
        """
        response = self.client.get(self.url, {'page_size': 20})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 19)
        self.assertEqual(response.data["count"], 19)

        q_texts_in_response = [q["question_text"] for q in response.data["results"]]
        self.assertIn("Test question 1 current", q_texts_in_response)
        self.assertIn("Test choiceless question", q_texts_in_response)
        self.assertIn("Test future question", q_texts_in_response)
        
    def test_admin_dashboard_empty_database(self):
        """
        Tests that the admin dashboard view returns an empty list when the database is empty.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 0)
        self.assertEqual(response.data["count"], 0)

    def test_admin_dashboard_paginates_questions(self):
        """
        Tests that the admin dashboard view paginates questions.
        """
        # Test first page
        response_page_1 = self.client.get(self.url)
        self.assertEqual(len(response_page_1.data["results"]), 10)
        self.assertEqual(response_page_1.data["count"], 19)
        self.assertIsNotNone(response_page_1.data["next"])
        self.assertIsNone(response_page_1.data["previous"])

        # Test second page
        response_page_2 = self.client.get(self.url, {"page": 2})
        self.assertEqual(len(response_page_2.data["results"]), 9)
        self.assertIsNone(response_page_2.data["next"])
        self.assertIsNotNone(response_page_2.data["previous"])

    def test_admin_dashboard_wrong_query_params_for_page(self):
        """
        Tests that the admin dashboard view returns appropriate pages for wrong query params for page.
        """
        response_invalid_page_type = self.client.get(self.url, {"page": "invalid"})
        response_invalid_page_type_data = response_invalid_page_type.json()
        self.assertEqual(response_invalid_page_type_data["page"], 1)

        response_invalid_page_number = self.client.get(self.url, {"page": 100})
        response_invalid_page_number_data = response_invalid_page_number.json()
        self.assertEqual(response_invalid_page_number_data["page"], 2)

    def test_admin_dashboard_wrong_query_params_for_page_size(self):
        """
        Tests that the admin dashboard view returns appropriate page sizes for wrong query params for page size.
        """
        response_invalid_page_size_type = self.client.get(self.url, {"page_size": "invalid"})
        response_invalid_page_size_type_data = response_invalid_page_size_type.json()
        self.assertEqual(response_invalid_page_size_type_data["page_size"], ADMIN_QUESTIONS_PER_PAGE)

        response_invalid_page_size_number = self.client.get(self.url, {"page_size": -100})
        response_invalid_page_size_number_data = response_invalid_page_size_number.json()
        self.assertEqual(response_invalid_page_size_number_data["page_size"], ADMIN_QUESTIONS_PER_PAGE)

# --- admin_question_detail ---
class TestAdminQuestionDetail(TestCase):
    def setUp(self):
        self.client = APIClient()
        # Create admin user and authenticate
        self.admin_user, self.admin_profile = create_test_user_with_profile(
            username='admin',
            email='admin@example.com',
            google_email='admin@gmail.com',
            is_admin=True
        )
        self.client.force_authenticate(user=self.admin_user)
        
        self.question = create_question_with_choices(
            question_text="Detail test question",
            days=0,
            choice_texts=["Choice A", "Choice B"]
        )
        self.url = reverse('admin_question_detail', args=[self.question.id])
        self.non_existent_url = reverse('admin_question_detail', args=[999])

    def test_get_existing_question_returns_200_ok(self):
        """
        Tests that a GET request for a valid question ID returns a 200 OK and correct data.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['question_text'], "Detail test question")
        self.assertEqual(len(response.data['choices']), 2)

    def test_get_nonexistent_question_returns_404_not_found(self):
        """
        Tests that a GET request for a non-existent question ID returns a 404 Not Found.
        """
        response = self.client.get(self.non_existent_url)
        self.assertEqual(response.status_code, 404)

    def test_put_update_question_text_returns_200_ok(self):
        """
        Tests that a PUT request can update a question's text.
        """
        valid_pub_date = timezone.now().isoformat()
        new_data = {
            "question_text": "Updated question text",
            "pub_date": valid_pub_date,
            "choices": [
                {"id": self.question.choice_set.first().id, "choice_text": "Choice A", "votes": 0},
                {"id": self.question.choice_set.last().id, "choice_text": "Choice B", "votes": 0},
            ]
        }
        response = make_json_put_request(self.client, self.url, new_data)
        self.assertEqual(response.status_code, 200)
        self.question.refresh_from_db()
        self.assertEqual(self.question.question_text, "Updated question text")

    def test_put_add_new_choice_returns_200_ok(self):
        """
        Tests that a PUT request can add a new choice to a question.
        """
        new_data = {
            "question_text": self.question.question_text,
            "pub_date": timezone.now().isoformat(),
            "choices": [
                {"id": self.question.choice_set.first().id, "choice_text": "Choice A", "votes": 0},
                {"id": self.question.choice_set.last().id, "choice_text": "Choice B", "votes": 0},
                {"choice_text": "New Choice", "votes": 0}
            ]
        }
        response = make_json_put_request(self.client, self.url, new_data)
        self.assertEqual(response.status_code, 200)
        self.question.refresh_from_db()
        self.assertEqual(self.question.choice_set.count(), 3)
        self.assertTrue(self.question.choice_set.filter(choice_text="New Choice").exists())

    def test_put_invalid_data_returns_400_bad_request(self):
        """
        Tests that a PUT request with invalid data returns a 400 Bad Request.
        """
        invalid_data = {
            "question_text": "This is a test",
            "pub_date": "not-a-valid-date"
        }
        response = make_json_put_request(self.client, self.url, invalid_data)
        self.assertEqual(response.status_code, 400)
        self.question.refresh_from_db()
        self.assertEqual(self.question.question_text, "Detail test question")

    def test_delete_existing_question_returns_204_no_content(self):
        """
        Tests that a DELETE request for a valid question ID returns a 204 No Content.
        """
        response = self.client.delete(self.url)
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Question.objects.filter(pk=self.question.id).exists())

    def test_delete_nonexistent_question_returns_404_not_found(self):
        """
        Tests that a DELETE request for a non-existent question ID returns a 404 Not Found.
        """
        response = self.client.delete(self.non_existent_url)
        self.assertEqual(response.status_code, 404)

# --- admin_results_summary ---
class TestAdminResultsSummary(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('summary')
        # Create admin user and authenticate
        self.admin_user, self.admin_profile = create_test_user_with_profile(
            username='admin',
            email='admin@example.com',
            google_email='admin@gmail.com',
            is_admin=True
        )
        # Verify admin status is set correctly
        self.admin_profile.refresh_from_db()
        self.client.force_authenticate(user=self.admin_user)
        
        self.q1 = Question.objects.create(question_text="Question 1", pub_date=timezone.now())
        self.c1_1 = self.q1.choice_set.create(choice_text="C1", votes=5)
        self.c1_2 = self.q1.choice_set.create(choice_text="C2", votes=5)
        
        self.q2 = Question.objects.create(question_text="Question 2", pub_date=timezone.now() - timedelta(days=1))
        self.c2_1 = self.q2.choice_set.create(choice_text="C1", votes=10)
        self.c2_2 = self.q2.choice_set.create(choice_text="C2", votes=0)
        self.c2_3 = self.q2.choice_set.create(choice_text="C3", votes=10)
        
        self.q3_choiceless = Question.objects.create(question_text="Question 3", pub_date=timezone.now() - timedelta(days=2))

    def test_get_results_summary_returns_200_ok(self):
        """
        Tests that the results summary view returns a 200 OK status.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    def test_get_results_summary_correct_structure(self):
        """
        Tests that the results summary view returns the expected data structure.
        """
        response = self.client.get(self.url)
        self.assertEqual(len(response.data['questions_results']), 3)
        self.assertIn('total_questions', response.data)
        self.assertIn('total_votes_all_questions', response.data)
        self.assertIn('questions_results', response.data)
    
    def test_get_results_summary_correct_aggregation(self):
        """
        Tests that the results summary view correctly aggregates data for all questions.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.data['total_questions'], 3)
        self.assertEqual(response.data['total_votes_all_questions'], 30) # 10 + 20 + 0
    
    def test_get_results_summary_per_question_data(self):
        """
        Tests that the results summary view correctly returns per-question data,
        including votes and percentages.
        """
        response = self.client.get(self.url)
        
        # Find questions by ID (order may vary based on pub_date)
        questions_by_id = {q['id']: q for q in response.data['questions_results']}
        
        q1_data = questions_by_id[self.q1.id]
        self.assertEqual(q1_data['question_text'], "Question 1")
        self.assertEqual(q1_data['total_votes'], 10)
        self.assertEqual(q1_data['choices'][0]['percentage'], 50.0)
        self.assertEqual(q1_data['choices'][1]['percentage'], 50.0)

        q2_data = questions_by_id[self.q2.id]
        self.assertEqual(q2_data['total_votes'], 20)
        self.assertEqual(q2_data['choices'][0]['percentage'], 50.0)
        self.assertEqual(q2_data['choices'][1]['percentage'], 0.0)
        self.assertEqual(q2_data['choices'][2]['percentage'], 50.0)

    def test_results_summary_choiceless_question(self):
        """
        Tests that a question with no choices is handled correctly.
        """
        response = self.client.get(self.url)
        
        # Find choiceless question by ID (order may vary)
        questions_by_id = {q['id']: q for q in response.data['questions_results']}
        self.assertIn(self.q3_choiceless.id, questions_by_id, 
                     f"Choiceless question {self.q3_choiceless.id} not found in results. "
                     f"Got IDs: {list(questions_by_id.keys())}")
        q3_data = questions_by_id[self.q3_choiceless.id]
        self.assertEqual(q3_data['total_votes'], 0)
        self.assertEqual(len(q3_data['choices']), 0)


# --- Authentication Views ---

# --- user_info ---
class TestUserInfo(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('user_info')

    def test_user_info_unauthenticated_returns_false(self):
        """
        Test that unauthenticated users get authenticated: false.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['authenticated'], False)

    def test_user_info_authenticated_regular_user(self):
        """
        Test that authenticated regular users get correct user info.
        """
        user, profile = create_test_user_with_profile(
            username="testuser",
            google_email="test@gmail.com",
            google_name="Test User",
            is_admin=False
        )
        
        # Delete and recreate profile to avoid signal interference
        profile.delete()
        profile = UserProfile.objects.create(
            user=user,
            google_email="test@gmail.com",
            google_name="Test User",
            is_admin=False
        )
        
        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['authenticated'], True)
        self.assertEqual(response.data['email'], "test@gmail.com")
        self.assertEqual(response.data['name'], "Test User")
        self.assertEqual(response.data['is_admin'], False)
        self.assertEqual(response.data['has_voted'], False)

    def test_user_info_authenticated_admin_user(self):
        """
        Test that authenticated admin users get correct user info.
        """
        user, profile = create_test_user_with_profile(
            username="admin",
            google_email="admin@gmail.com",
            google_name="Admin User",
            is_admin=True
        )
        
        # Delete and recreate profile to avoid signal interference
        profile.delete()
        profile = UserProfile.objects.create(
            user=user,
            google_email="admin@gmail.com",
            google_name="Admin User",
            is_admin=True
        )
        
        self.client.force_authenticate(user=user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['authenticated'], True)
        self.assertEqual(response.data['email'], "admin@gmail.com")
        self.assertEqual(response.data['name'], "Admin User")
        self.assertEqual(response.data['is_admin'], True)
        self.assertEqual(response.data['has_voted'], False)

    def test_user_info_has_voted_status(self):
        """
        Test that has_voted correctly reflects user's voting status.
        """
        user, profile = create_test_user_with_profile()
        question = create_question_with_choices(
            question_text="Test question",
            days=-1,
            choice_texts=["Choice 1", "Choice 2"]
        )
        
        self.client.force_authenticate(user=user)
        
        # Initially has not voted
        response = self.client.get(self.url)
        self.assertEqual(response.data['has_voted'], False)
        
        # After voting, has voted
        create_user_vote(user=user, question=question, choice=question.choice_set.first())
        response = self.client.get(self.url)
        self.assertEqual(response.data['has_voted'], True)


# --- admin_stats ---
class TestAdminStats(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('admin_stats')

    def test_admin_stats_unauthenticated_returns_403(self):
        """
        Test that unauthenticated users get 403.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 403)

    def test_admin_stats_regular_user_returns_403(self):
        """
        Test that regular users get 403.
        """
        user, profile = create_test_user_with_profile(is_admin=False)
        self.client.force_authenticate(user=user)
        
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 403)

    def test_admin_stats_admin_user_returns_stats(self):
        """
        Test that admin users get comprehensive statistics.
        """
        # Create admin user
        admin_user, admin_profile = create_test_user_with_profile(
            username="admin",
            google_email="admin@gmail.com",
            is_admin=True
        )
        
        # Delete and recreate profile to avoid signal interference
        admin_profile.delete()
        admin_profile = UserProfile.objects.create(
            user=admin_user,
            google_email="admin@gmail.com",
            google_name="Admin User",
            is_admin=True
        )
        
        # Create regular users and votes
        user1, profile1 = create_test_user_with_profile(
            username="user1",
            google_email="user1@gmail.com"
        )
        user2, profile2 = create_test_user_with_profile(
            username="user2", 
            google_email="user2@gmail.com"
        )
        
        # Create questions
        question1 = create_question_with_choices(
            question_text="Question 1",
            days=-1,
            choice_texts=["A", "B"]
        )
        question2 = create_question_with_choices(
            question_text="Question 2",
            days=-1,
            choice_texts=["C", "D"]
        )
        # Create future and choiceless questions (not used in tests but needed for stats)
        create_question_with_choices(
            question_text="Future Question",
            days=5,
            choice_texts=["E", "F"]
        )
        create_question_with_choices(
            question_text="Choiceless Question",
            days=-1,
            choice_texts=[]
        )
        
        # Create votes
        create_user_vote(user=user1, question=question1, choice=question1.choice_set.first())
        create_user_vote(user=user2, question=question1, choice=question1.choice_set.last())
        create_user_vote(user=user1, question=question2, choice=question2.choice_set.first())
        
        self.client.force_authenticate(user=admin_user)
        response = self.client.get(self.url)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_voters'], 2)  # user1 and user2
        self.assertEqual(response.data['total_votes'], 3)   # 3 votes total
        self.assertEqual(response.data['total_questions'], 4)  # All questions
        
        # Test hidden questions breakdown
        hidden = response.data['hidden_questions']
        self.assertEqual(hidden['unpublished'], 1)  # future_question
        self.assertEqual(hidden['choiceless'], 1)    # choiceless_question
        self.assertEqual(hidden['unpublished_choiceless'], 0)  # None
        self.assertEqual(hidden['total'], 2)  # 1 + 1 + 0


# --- logout ---
class TestLogout(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('logout')

    def test_logout_unauthenticated_returns_401(self):
        """
        Test that unauthenticated users get 401 Unauthorized.
        """
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 401)

    def test_logout_authenticated_returns_success(self):
        """
        Test that authenticated users can logout.
        """
        user, profile = create_test_user_with_profile()
        self.client.force_authenticate(user=user)
        
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['message'], "Logout successful")


# --- vote (updated with authentication) ---
class TestVoteWithAuthentication(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('polls:vote')
        
        # Create a question with choices for testing
        self.question = create_question_with_choices(
            question_text="Favorite color?",
            days=-1,
            choice_texts=["Blue", "Green"]
        )
        self.choice_blue = self.question.choice_set.get(choice_text="Blue")
        self.choice_green = self.question.choice_set.get(choice_text="Green")

    def test_vote_unauthenticated_returns_403(self):
        """
        Test that unauthenticated users cannot vote.
        """
        vote_data = {
            "votes": {
                self.question.id: self.choice_blue.id
            }
        }
        response = make_json_post_request(self.client, self.url, vote_data)
        self.assertEqual(response.status_code, 403)

    def test_vote_authenticated_user_tracks_vote(self):
        """
        Test that authenticated users can vote and vote is tracked.
        """
        user, profile = create_test_user_with_profile()
        self.client.force_authenticate(user=user)
        
        vote_data = {
            "votes": {
                self.question.id: self.choice_blue.id
            }
        }
        response = make_json_post_request(self.client, self.url, vote_data)
        
        self.assertEqual(response.status_code, 200)
        self.choice_blue.refresh_from_db()
        self.assertEqual(self.choice_blue.votes, 1)
        
        # Check that UserVote was created
        self.assertTrue(UserVote.objects.filter(user=user, question=self.question).exists())
        vote = UserVote.objects.get(user=user, question=self.question)
        self.assertEqual(vote.choice, self.choice_blue)

    def test_vote_change_vote_updates_correctly(self):
        """
        Test that changing a vote properly updates the vote counts.
        """
        user, profile = create_test_user_with_profile()
        self.client.force_authenticate(user=user)
        
        # Initial vote for blue
        vote_data = {
            "votes": {
                self.question.id: self.choice_blue.id
            }
        }
        response = make_json_post_request(self.client, self.url, vote_data)
        self.assertEqual(response.status_code, 200)
        
        # Change vote to green
        vote_data = {
            "votes": {
                self.question.id: self.choice_green.id
            }
        }
        response = make_json_post_request(self.client, self.url, vote_data)
        self.assertEqual(response.status_code, 200)
        
        # Check vote counts
        self.choice_blue.refresh_from_db()
        self.choice_green.refresh_from_db()
        self.assertEqual(self.choice_blue.votes, 0)  # Should be decremented
        self.assertEqual(self.choice_green.votes, 1)  # Should be incremented
        
        # Check that UserVote was updated
        vote = UserVote.objects.get(user=user, question=self.question)
        self.assertEqual(vote.choice, self.choice_green)

    def test_vote_multiple_questions(self):
        """
        Test that users can vote on multiple questions.
        """
        user, profile = create_test_user_with_profile()
        self.client.force_authenticate(user=user)
        
        # Create second question
        question2 = create_question_with_choices(
            question_text="Second question",
            days=-1,
            choice_texts=["X", "Y"]
        )
        
        # Vote on both questions
        vote_data = {
            "votes": {
                self.question.id: self.choice_blue.id,
                question2.id: question2.choice_set.first().id
            }
        }
        response = make_json_post_request(self.client, self.url, vote_data)
        self.assertEqual(response.status_code, 200)
        
        # Check that both votes were recorded
        self.assertEqual(UserVote.objects.filter(user=user).count(), 2)
        self.assertTrue(UserVote.objects.filter(user=user, question=self.question).exists())
        self.assertTrue(UserVote.objects.filter(user=user, question=question2).exists())

    def test_vote_business_rule_one_vote_per_question(self):
        """
        Test that users can only vote once per question (business rule).
        """
        user, profile = create_test_user_with_profile()
        self.client.force_authenticate(user=user)
        
        # Vote on question
        vote_data = {
            "votes": {
                self.question.id: self.choice_blue.id
            }
        }
        response = make_json_post_request(self.client, self.url, vote_data)
        self.assertEqual(response.status_code, 200)
        
        # Try to vote again on same question (should replace previous vote)
        vote_data = {
            "votes": {
                self.question.id: self.choice_green.id
            }
        }
        response = make_json_post_request(self.client, self.url, vote_data)
        self.assertEqual(response.status_code, 200)
        
        # Should still only have one vote per question
        self.assertEqual(UserVote.objects.filter(user=user, question=self.question).count(), 1)
        vote = UserVote.objects.get(user=user, question=self.question)
        self.assertEqual(vote.choice, self.choice_green)  # Should be the new choice