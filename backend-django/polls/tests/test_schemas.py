from django.test import TestCase
from polls.schemas import (
    NewChoiceSchema, 
    NewQuestionSchema, 
    PollSubmissionSchema, 
    ResultsSchema, 
    ResultsChoiceSchema,
    QuestionAdminSchema,
    QuestionUpdateSchema,
    ChoiceUpdateSchema
    )
from polls.models import Question, Choice
from django.utils import timezone
from datetime import timedelta
from polls.tests.utils import create_question_with_choices
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

        validated_results = ResultsSchema.model_validate(question)
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

        validated_results = ResultsSchema.model_validate(question_1)
        self.assertIsInstance(validated_results, ResultsSchema)
        self.assertEqual(validated_results.choices[0].percentage, 50.0)
        self.assertEqual(validated_results.choices[1].percentage, 50.0)

        question_2 = create_question_with_choices(
            question_text="Question 2", 
            days=1,
            choice_texts=["Choice 1", "Choice 2", "Choice 3"]
        )

        validated_results = ResultsSchema.model_validate(question_2)
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

        validated_results = ResultsSchema.model_validate(question_3)
        self.assertIsInstance(validated_results, ResultsSchema)
        self.assertEqual(validated_results.choices[0].percentage, 0.0)
        self.assertEqual(validated_results.choices[1].percentage, 0.0)
        self.assertEqual(validated_results.choices[2].percentage, 0.0)
        self.assertEqual(validated_results.choices[3].percentage, 0.0)

class TestMoreAdminSchemas(TestCase):
    def setUp(self):
        self.question = Question.objects.create(question_text="Old question", pub_date=timezone.now())
        self.question.choice_set.create(choice_text="Choice A", votes=0)
        self.question.choice_set.create(choice_text="Choice B", votes=0)
        self.choice_a = self.question.choice_set.first()
        self.choice_b = self.question.choice_set.last()

    ## QuestionAdminSchema Tests ##
    
    def test_question_admin_schema_from_django_model(self):
        """
        Tests that QuestionAdminSchema can be created from a Django model instance.
        """
        validated_schema = QuestionAdminSchema.model_validate(self.question)
        self.assertEqual(validated_schema.id, self.question.id)
        self.assertEqual(validated_schema.question_text, "Old question")
        self.assertIsInstance(validated_schema.choices, list)
        self.assertEqual(len(validated_schema.choices), 2)
        self.assertEqual(validated_schema.note_future_date, "")
        self.assertEqual(validated_schema.note_choiceless, "")

    def test_question_admin_schema_future_date_note(self):
        """
        Tests that the note_future_date computed field works correctly.
        """
        future_question = Question.objects.create(question_text="Future question", pub_date=timezone.now() + timedelta(days=1))
        validated_schema = QuestionAdminSchema.model_validate(future_question)
        self.assertNotEqual(validated_schema.note_future_date, "")

    def test_question_admin_schema_choiceless_note(self):
        """
        Tests that the note_choiceless computed field works correctly.
        """
        choiceless_question = Question.objects.create(question_text="Choiceless question", pub_date=timezone.now())
        validated_schema = QuestionAdminSchema.model_validate(choiceless_question)
        self.assertNotEqual(validated_schema.note_choiceless, "")

    ## NewChoiceSchema Tests ##

    def test_new_choice_schema_with_default_votes(self):
        """
        Tests that NewChoiceSchema validates a payload without a votes field.
        """
        data = {"choice_text": "New choice"}
        validated_choice = NewChoiceSchema.model_validate(data)
        self.assertEqual(validated_choice.choice_text, "New choice")
        self.assertEqual(validated_choice.votes, 0)
    
    ## ChoiceUpdateSchema Tests ##

    def test_choice_update_schema_with_id(self):
        """
        Tests that ChoiceUpdateSchema validates a payload for an existing choice.
        """
        data = {"id": self.choice_a.id, "choice_text": "Updated choice A", "votes": 10}
        validated_choice = ChoiceUpdateSchema.model_validate(data)
        self.assertEqual(validated_choice.id, self.choice_a.id)
        self.assertEqual(validated_choice.choice_text, "Updated choice A")
        self.assertEqual(validated_choice.votes, 10)

    def test_choice_update_schema_without_id(self):
        """
        Tests that ChoiceUpdateSchema validates a payload for a new choice.
        """
        data = {"choice_text": "New choice C", "votes": 0}
        validated_choice = ChoiceUpdateSchema.model_validate(data)
        self.assertIsNone(validated_choice.id)
        self.assertEqual(validated_choice.choice_text, "New choice C")
        self.assertEqual(validated_choice.votes, 0)

    ## QuestionUpdateSchema Tests ##

    def test_question_update_schema_with_updated_text_and_choices(self):
        """
        Tests that QuestionUpdateSchema validates a payload with updated question text and choices.
        """
        data = {
            "question_text": "Updated question text",
            "pub_date": timezone.now(),
            "choices": [
                {"id": self.choice_a.id, "choice_text": "Updated choice A", "votes": 1},
                {"id": self.choice_b.id, "choice_text": "Updated choice B", "votes": 2},
            ]
        }
        validated_question = QuestionUpdateSchema.model_validate(data)
        self.assertEqual(validated_question.question_text, "Updated question text")
        self.assertEqual(len(validated_question.choices), 2)
        self.assertEqual(validated_question.choices[0].choice_text, "Updated choice A")
        self.assertEqual(validated_question.choices[1].votes, 2)

    def test_question_update_schema_with_new_choice(self):
        """
        Tests that QuestionUpdateSchema validates a payload that adds a new choice.
        """
        data = {
            "question_text": "Question with new choice",
            "pub_date": timezone.now(),
            "choices": [
                {"id": self.choice_a.id, "choice_text": "Choice A", "votes": 0},
                {"id": self.choice_b.id, "choice_text": "Choice B", "votes": 0},
                {"choice_text": "New choice C", "votes": 0} # No ID here
            ]
        }
        validated_question = QuestionUpdateSchema.model_validate(data)
        self.assertEqual(len(validated_question.choices), 3)
        self.assertIsNone(validated_question.choices[2].id)
        self.assertEqual(validated_question.choices[2].choice_text, "New choice C")
    
    def test_question_update_schema_raises_error_for_invalid_data(self):
        """
        Tests that QuestionUpdateSchema raises a ValidationError for invalid input.
        """
        invalid_data = {
            "question_text": "Valid text",
            "pub_date": "invalid-date", # Bad date format
            "choices": []
        }
        with self.assertRaises(ValidationError):
            QuestionUpdateSchema.model_validate(invalid_data)



        
        
        
