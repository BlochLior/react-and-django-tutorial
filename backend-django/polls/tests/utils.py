from datetime import timedelta
from django.utils import timezone
from django.test import Client
from django.contrib.auth.models import User
from polls.models import Question, Choice, UserProfile, UserVote
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

def make_json_post_request(client: Client, url: str, data: dict):
    """
    Makes a POST request to the given URL with the given data as JSON.
    """
    response = client.post(url, json.dumps(data), content_type='application/json')
    try:
        response.data = json.loads(response.content)
    except json.JSONDecodeError:
        response.data = {}
    
    return response

def make_json_put_request(client: Client, url: str, data: dict):
    """
    Makes a PUT request to the given URL with the given data as JSON.
    """
    response = client.put(url, json.dumps(data), content_type='application/json')
    try:
        response.data = json.loads(response.content)
    except json.JSONDecodeError:
        response.data = {}
    
    return response


def create_test_user(username: str = "testuser", email: str = "test@example.com", password: str = "testpass123") -> User:
    """
    Create a test user with the given username, email, and password.
    """
    return User.objects.create_user(username=username, email=email, password=password)


def create_user_profile(user: User, google_email: str, google_name: str = "", is_admin: bool = False) -> UserProfile:
    """
    Create a UserProfile for the given user with Google OAuth data.
    """
    return UserProfile.objects.create(
        user=user,
        google_email=google_email,
        google_name=google_name,
        is_admin=is_admin
    )


def create_test_user_with_profile(
    username: str = "testuser", 
    email: str = "test@example.com", 
    google_email: str = "test@gmail.com",
    google_name: str = "Test User",
    is_admin: bool = False
) -> tuple[User, UserProfile]:
    """
    Create a test user with a UserProfile in one call.
    Returns both the User and UserProfile objects.
    Note: UserProfile is created automatically by signals, so we just update it.
    """
    user = create_test_user(username=username, email=email)
    
    # Get the profile created by the signal and update it
    # Use update_or_create to ensure we get the right values
    profile, created = UserProfile.objects.update_or_create(
        user=user,
        defaults={
            'google_email': google_email,
            'google_name': google_name,
            'is_admin': is_admin
        }
    )
    
    return user, profile


def create_user_vote(user: User, question: Question, choice: Choice) -> UserVote:
    """
    Create a UserVote record for the given user, question, and choice.
    """
    return UserVote.objects.create(user=user, question=question, choice=choice)


def create_complete_voting_scenario() -> dict:
    """
    Create a complete voting scenario with a user, question, choices, and vote.
    Useful for integration tests.
    Returns a dictionary with all created objects.
    """
    # Create user and profile
    user, profile = create_test_user_with_profile()
    
    # Create question with choices
    question = create_question_with_choices(
        question_text="Test question for voting",
        days=-1,  # Published in the past
        choice_texts=["Choice 1", "Choice 2", "Choice 3"]
    )
    
    # Get the first choice
    choice = question.choice_set.first()
    
    # Create vote
    vote = create_user_vote(user=user, question=question, choice=choice)
    
    return {
        'user': user,
        'profile': profile,
        'question': question,
        'choice': choice,
        'vote': vote,
        'all_choices': list(question.choice_set.all())
    }
    