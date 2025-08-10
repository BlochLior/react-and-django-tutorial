from datetime import timedelta
from django.utils import timezone
from django.test import Client
from django.http import HttpResponse
from polls.models import Question, Choice
import json

def create_question(question_text: str, days: int=0) -> Question:
    """
    Create a question with the given 'question_text' and published the given number of 'days' offset to now (negative for questions published in the past, positive for questions that have yet to be published).
    This is for tests in the future that i'll create, to assist with creating tests.
    """
    time = timezone.now() + timedelta(days=days)
    return Question.objects.create(question_text=question_text, pub_date=time)

def create_question_with_choices(question_text: str, days: int=0, choice_texts: list[str] | None = None) -> Question:
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

def prepare_question_results_for_validation(question):
    """
    Prepares a question and its choices for validation by the ResultsSchema.
    """
    # This dictionary must contain all the fields required by ResultsSchema
    # It must also include the related choices, which Pydantic will validate.
    return {
        "id": question.id,
        "question_text": question.question_text,
        "pub_date": question.pub_date,
        "choice_set": list(question.choice_set.all())
    }

def make_json_post_request(client: Client, url: str, data: dict) -> HttpResponse:
    """
    Makes a POST request to the given URL with the given data as JSON.
    """
    response = client.post(url, json.dumps(data), content_type='application/json')
    try:
        response.data = json.loads(response.content)
    except json.JSONDecodeError:
        response.data = {}
    
    return response

def make_json_put_request(client: Client, url: str, data: dict) -> HttpResponse:
    """
    Makes a PUT request to the given URL with the given data as JSON.
    """
    response = client.put(url, json.dumps(data), content_type='application/json')
    try:
        response.data = json.loads(response.content)
    except json.JSONDecodeError:
        response.data = {}
    
    return response
    