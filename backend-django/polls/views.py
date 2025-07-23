from django.shortcuts import get_object_or_404
# csrf exemption only for develelopment, in production should be removed
from django.views.decorators.csrf import csrf_exempt 
from django.utils import timezone
from django.db.models import Count


from pydantic import ValidationError

from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from .models import Question, Choice
from .schemas import QuestionSchema, ChoiceSchema, VoteSchema


@api_view(['GET'])
def question_list_api(request):
    print("\n--- API Request Debug ---")

    print(f"Full request.query_params dictionary: {request.query_params}")
    print(f"Raw value for 'show_future' key: {request.query_params.get('show_future', 'KEY_NOT_FOUND')}")
    # Starts with all questions
    questions = Question.objects.all()
    print(f"Initial total questions: {questions.count()}")

    # Check for query parameters from the client
    show_future_questions = request.query_params.get('show_future', 'false').lower() == 'true'
    show_choiceless_questions = request.query_params.get('show_choiceless', 'false').lower() == 'true'

    print(f"show_future_questions: {show_future_questions}")
    print(f"show_choiceless_questions: {show_choiceless_questions}")


    # Conditionally apply filters based on the parameters
    if not show_future_questions:
        print("Applying filter: pub_date <= now()")
        questions = questions.filter(pub_date__lte=timezone.now())
        print(f"Questions after pub_date filter: {questions.count()}")
    if not show_choiceless_questions:
        print("Applying filter: choice_count >= 1")
        questions = questions.annotate(choice_count=Count('choice')).filter(choice_count__gte=1)
        print(f"Questions after choiceless filter: {questions.count()}")

    # Build the response data
    question_data = []
    for q in questions:
        # Get choices for each question
        choices_data = [
            ChoiceSchema.model_validate(c).model_dump()
            for c in q.choice_set.all()
        ]
        # Build a dictionary to pass to the QuestionSchema
        question_dict = {
            "id": q.id,
            "question_text": q.question_text,
            "pub_date": q.pub_date,
            "choices": choices_data,
        }
        # Validate and dump the data
        question_data.append(QuestionSchema.model_validate(question_dict).model_dump())
    
    print("--- End API Request Debug ---\n")
    return Response(question_data, status=status.HTTP_200_OK)

@api_view(['GET'])
def question_detail_api(_request, pk):
    """
    Retrieves a specific question by its primary key.
    """
    question = get_object_or_404(Question, pk=pk)

    # Manually prepare the data for the single question
    choices_data = [
        ChoiceSchema.model_validate(c).model_dump()
        for c in question.choice_set.all()
    ]

    question_dict = {
        "id": question.id,
        "question_text": question.question_text,
        "pub_date": question.pub_date,
        "choices": choices_data,
    }

    try:
        question_data = QuestionSchema.model_validate(question_dict).model_dump()
        return Response(question_data, status=status.HTTP_200_OK)
    except ValidationError as e:
            return Response({'error':str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@csrf_exempt # csrf exemption only for develelopment, in production should be removed
def vote_api(request, pk):
    """
    Handles voting for a specific choice in a question.
    """
    try:
        question = Question.objects.get(pk=pk)
    except Question.DoesNotExist:
        return Response({'error': 'Question not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        # DRF automatically parses the req body with requset.data
        vote_data = VoteSchema(**request.data)
    except ValidationError:
        return Response({'error': "Invalid request body"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        selected_choice = question.choice_set.get(pk=vote_data.choice_id)
        selected_choice.votes += 1
        selected_choice.save()
        # return updated data or just a success message
        choices_data = [
            ChoiceSchema.model_validate(c).model_dump()
            for c in question.choice_set.all()
        ]
        updated_question_data = {
            "id": question.id,
            "question_text": question.question_text,
            "pub_date": question.pub_date,
            "choices": choices_data,
        }
        return Response(updated_question_data, status=status.HTTP_200_OK)
    except Choice.DoesNotExist:
        return Response({'error': 'Choice not found for this question'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)