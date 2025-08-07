from datetime import timedelta
from django.utils import timezone

from polls.models import Question, Choice


def create_question(question_text: str, days: int) -> Question:
    """
    Create a question with the given 'question_text' and published the given number of 'days' offset to now (negative for questions published in the past, positive for questions that have yet to be published).
    This is for tests in the future that i'll create, to assist with creating tests.
    """
    time = timezone.now() + timedelta(days=days)
    return Question.objects.create(question_text=question_text, pub_date=time)

def create_question_with_choices(question_text: str, days: int, choice_texts: list[str] | None = None) -> Question:
    """
    Creates a Question with a given question_text and pub_date,
    and also creates a list of Choices for that question.
    If choice_texts is not provided, no choices are created.
    This uses the create_question function to create the question,
    and then creates the choices.
    """
    question = create_question(question_text=question_text, days=days)
    if choice_texts:
        for choice_text in choice_texts:
            Choice.objects.create(question=question, choice_text=choice_text, votes=0)
    return question