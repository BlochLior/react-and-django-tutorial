from django.test import TestCase
from polls.schemas import NewChoiceSchema, NewQuestionSchema, PollSubmissionSchema, ResultsSchema, ResultsChoiceSchema
from polls.models import Question, Choice
from django.utils import timezone
from datetime import timedelta
from polls.tests.utils import prepare_question_results_for_validation, create_question_with_choices
from pydantic import ValidationError

class TestNewChoiceAndQuestionSchema(TestCase):
    # --- NewQuestionSchema and NewChoiceSchema ---
    def test_new_question_with_required_fields_only(self):
        """
        Tests that NewQuestionSchema validates a dictionary with only required fields.
        """
        data = {"question_text": "A new question"}
        validated_question = NewQuestionSchema.model_validate(data)
        self.assertEqual(validated_question.question_text, "A new question")
        self.assertAlmostEqual(validated_question.pub_date, timezone.now(), delta=timedelta(minutes=1))
        self.assertEqual(validated_question.choices, [])

    def test_new_question_with_custom_pub_date(self):
        """
        Tests that NewQuestionSchema validates a dictionary with a custom pub_date.
        """
        custom_date = timezone.now() + timedelta(days=10)
        data = {
            "question_text": "A new question",
            "pub_date": custom_date
        }
        validated_question = NewQuestionSchema.model_validate(data)
        self.assertEqual(validated_question.pub_date, custom_date)

    def test_new_question_with_choices_and_custom_votes(self):
        """
        Tests that NewQuestionSchema validates a dictionary with nested choices and votes.
        """
        data = {
            "question_text": "A new question",
            "choices": [
                {"choice_text": "Choice 1", "votes": 10},
                {"choice_text": "Choice 2"},  # votes defaults to 0
            ]
        }
        validated_question = NewQuestionSchema.model_validate(data)
        self.assertEqual(validated_question.question_text, "A new question")
        self.assertEqual(len(validated_question.choices), 2)
        self.assertEqual(validated_question.choices[0].votes, 10)
        self.assertEqual(validated_question.choices[1].votes, 0)
        
        choice_1 = NewChoiceSchema.model_validate(validated_question.choices[0])
        self.assertEqual(choice_1.choice_text, "Choice 1")
        self.assertEqual(choice_1.votes, 10)
    
    def test_new_question_raises_error_for_invalid_data(self):
        """
        Tests that NewQuestionSchema raises a ValidationError for invalid input.
        """
        data = {"question_text": 123}  # Invalid data type for question_text
        with self.assertRaises(ValidationError):
            NewQuestionSchema.model_validate(data)
    
    # --- PollSubmissionSchema ---
    def test_poll_submission_with_required_fields_only(self):
        """
        Tests that PollSubmissionSchema validates a dictionary with only required fields.
        """
        data = {"votes": {1: 1, 2: 2}}
        validated_submission = PollSubmissionSchema.model_validate(data)
        self.assertEqual(validated_submission.votes, {1: 1, 2: 2})

    def test_poll_submission_invalid_data(self):
        """
        Tests that PollSubmissionSchema raises a ValidationError for invalid input.
        """
        data_1 = {"votes": {1: "a", 2: 2}}  # Invalid data type for votes 
        with self.assertRaises(ValidationError):
            PollSubmissionSchema.model_validate(data_1)

        data_2 = {}  # Missing required field 'votes'
        with self.assertRaises(ValidationError):
            PollSubmissionSchema.model_validate(data_2)

        data_3 = {"1": 2, "invalid_field2": 3}  # Invalid field name
        with self.assertRaises(ValidationError):
            PollSubmissionSchema.model_validate(data_3)

        data_4 = {"votes": {"invalid_field1": 1, "invalid_field2": 2}}  # Invalid field name in nested dictionary
        with self.assertRaises(ValidationError):
            PollSubmissionSchema.model_validate(data_4)
        
    # --- ResultsSchema and ResultsChoiceSchema ---
    def test_results_schema_correct_serialization(self):
        """
        Tests that ResultsSchema correctly serializes a dictionary with only required fields.
        """
        question = Question.objects.create(question_text="Question 1", pub_date=timezone.now())
        question.save()
        choice_1 = Choice.objects.create(question=question, choice_text="Choice 1", votes=0)
        choice_1.save()
        choice_2 = Choice.objects.create(question=question, choice_text="Choice 2", votes=2)
        choice_2.save()
        
        # Data prep for Pydantic

        validated_results = prepare_question_results_for_validation(question)
        self.assertIsInstance(validated_results, ResultsSchema)
        self.assertEqual(validated_results.question_text, "Question 1")
        self.assertEqual(validated_results.total_votes, 2)
        
        self.assertEqual(len(validated_results.choices), 2)
        self.assertIsInstance(validated_results.choices[0], ResultsChoiceSchema)
        self.assertEqual(validated_results.choices[0].choice_text, "Choice 1")
        self.assertEqual(validated_results.choices[0].votes, 0)
        self.assertEqual(validated_results.choices[0].percentage, 0.0)
        self.assertIsInstance(validated_results.choices[1], ResultsChoiceSchema)
        self.assertEqual(validated_results.choices[1].choice_text, "Choice 2")
        self.assertEqual(validated_results.choices[1].votes, 2)
        self.assertEqual(validated_results.choices[1].percentage, 100.0)
        
    def test_results_schema_percentage_calculation(self):
        """
        Tests that ResultsSchema correctly calculates the percentage of votes for each choice.
        """
        question_1 = create_question_with_choices(
            question_text="Question 1", 
            days=1,
            choice_texts=["Choice 1", "Choice 2"]
        )
        choice_1 = question_1.choice_set.first()
        choice_2 = question_1.choice_set.last()
        choice_1.votes = 5
        choice_2.votes = 5
        choice_1.save()
        choice_2.save()

        validated_results = prepare_question_results_for_validation(question_1)
        self.assertIsInstance(validated_results, ResultsSchema)
        self.assertEqual(validated_results.choices[0].percentage, 50.0)
        self.assertEqual(validated_results.choices[1].percentage, 50.0)

        question_2 = create_question_with_choices(
            question_text="Question 2", 
            days=1,
            choice_texts=["Choice 1", "Choice 2", "Choice 3"]
        )

        validated_results = prepare_question_results_for_validation(question_2)
        self.assertIsInstance(validated_results, ResultsSchema)
        self.assertEqual(validated_results.choices[0].percentage, 0.0)
        self.assertEqual(validated_results.choices[1].percentage, 0.0)
        self.assertEqual(validated_results.choices[2].percentage, 0.0)

        question_3 = create_question_with_choices(
            question_text="Question 3", 
            days=1,
            choice_texts=["Choice 1", "Choice 2", "Choice 3", "Choice 4"]
        )

        c1, c2, c3, c4 = question_3.choice_set.all()
        c1.votes = 0
        c2.votes = 0
        c3.votes = 0
        c4.votes = 0
        c1.save()
        c2.save()
        c3.save()
        c4.save()

        validated_results = prepare_question_results_for_validation(question_3)
        self.assertIsInstance(validated_results, ResultsSchema)
        self.assertEqual(validated_results.choices[0].percentage, 0.0)
        self.assertEqual(validated_results.choices[1].percentage, 0.0)
        self.assertEqual(validated_results.choices[2].percentage, 0.0)
        self.assertEqual(validated_results.choices[3].percentage, 0.0)
        
        
        
        
        
