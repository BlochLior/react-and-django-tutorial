from django.test import TestCase
from django.utils import timezone
from polls.tests.utils import create_question_with_choices
from polls.serializers import serialize_question_with_choices, serialize_question_with_choices_admin
from polls.schemas import QuestionSchema, QuestionAdminSchema, ChoiceSchema

class TestSerializers(TestCase):
    def test_serialize_question_with_choices(self):
        question = create_question_with_choices(
            question_text="question with choices",
            days=-1,
            choice_texts=[
                "choice 1",
                "choice 2",
                "choice 3",
            ],
        )
        
        serialized_question = serialize_question_with_choices(question)

        self.assertIsInstance(serialized_question, QuestionSchema)
        self.assertEqual(serialized_question.question_text, "question with choices")
        self.assertEqual(len(serialized_question.choices), 3)
        self.assertIsInstance(serialized_question.choices[0], ChoiceSchema)
        self.assertEqual(serialized_question.choices[0].choice_text, "choice 1")
        self.assertEqual(serialized_question.choices[0].votes, 0)

    def test_serialize_question_with_choices_admin(self):
        question = create_question_with_choices(
            question_text="question with choices",
            days=-1,
            choice_texts=[
                "choice 1",
                "choice 2",
                "choice 3",
            ],
        )
        
        serialized_question = serialize_question_with_choices_admin(question)

        self.assertIsInstance(serialized_question, QuestionAdminSchema)
        self.assertEqual(serialized_question.question_text, "question with choices")
        self.assertEqual(len(serialized_question.choices), 3)
        self.assertIsInstance(serialized_question.choices[0], ChoiceSchema)
        self.assertEqual(serialized_question.choices[0].choice_text, "choice 1")
        self.assertEqual(serialized_question.choices[0].votes, 0)
        self.assertEqual(serialized_question.note_future_date, "")
        self.assertEqual(serialized_question.note_choiceless, "")

    def test_serialize_question_with_choices_admin_future_date(self):
        future_question = create_question_with_choices(
            question_text="question with choices",
            days=1,
            choice_texts=[
                "choice 1",
                "choice 2",
                "choice 3",
            ],
        )
        
        serialized_question = serialize_question_with_choices_admin(future_question)

        self.assertIsInstance(serialized_question, QuestionAdminSchema)
        self.assertEqual(serialized_question.question_text, "question with choices")
        self.assertEqual(len(serialized_question.choices), 3)
        self.assertIsInstance(serialized_question.choices[0], ChoiceSchema)
        self.assertEqual(serialized_question.choices[0].choice_text, "choice 1")
        self.assertEqual(serialized_question.choices[0].votes, 0)
        self.assertEqual(serialized_question.note_future_date, "This question is in the future")
        self.assertEqual(serialized_question.note_choiceless, "")
    
    def test_serialize_question_with_choices_admin_choiceless(self):
        choiceless_question = create_question_with_choices(
            question_text="question with no choices",
            days=-1,
            choice_texts=[],
        )
        
        serialized_question = serialize_question_with_choices_admin(choiceless_question)

        self.assertIsInstance(serialized_question, QuestionAdminSchema)
        self.assertEqual(serialized_question.question_text, "question with no choices")
        self.assertEqual(len(serialized_question.choices), 0)
        self.assertEqual(serialized_question.note_future_date, "")
        self.assertEqual(serialized_question.note_choiceless, "This question has no choices")
        