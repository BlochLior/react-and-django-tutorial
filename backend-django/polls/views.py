from django.http import JsonResponse, HttpRequest, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.utils import timezone

from pydantic import ValidationError
import json
from datetime import datetime

from polls.models import Question, Choice
from polls.schemas import QuestionSchema, ChoiceSchema, PollSubmissionSchema # and so on maybe
from polls.serializers import serialize_question_with_choices

# hereon are older imports
from django.shortcuts import get_object_or_404
# csrf exemption only for develelopment, in production should be removed
from django.views.decorators.csrf import csrf_exempt 
from django.utils import timezone
from django.db.models import Q, Count

from pydantic import ValidationError

from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

from .models import Question, Choice
from .schemas import QuestionSchema, ChoiceSchema # VoteSchema

QUESTIONS_PER_PAGE = 5

@require_http_methods(["GET"])
def client_poll_list(request):
    """
    Returns a paginated list of published questions with choices.
    """
    # Filter to only questions published and with choices
    questions_queryset = Question.objects.filter(
        pub_date__lte=timezone.now(),
        choice__isnull=False
    ).distinct().order_by('-pub_date')

    paginator = Paginator(questions_queryset, QUESTIONS_PER_PAGE)
    page_number = request.GET.get('page', 1)
    try: 
        page_obj = paginator.page(page_number)
    except PageNotAnInteger:
        # if a page is not an integer, deliver first page.
        page_obj = paginator.page(1)
    except EmptyPage:
        # if a page is out of range, deliver last page of results.
        page_obj = paginator.page(paginator.num_pages)
    
    serialized_questions = [
        serialize_question_with_choices(q).model_dump()
        for q in page_obj
    ]

    # Build the response metadata and data
    response_data = {
        'count': paginator.count,
        'next': page_obj.next_page_number() if page_obj.has_next() else None,
        'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
        'results': serialized_questions
    }

    return JsonResponse(response_data)

@require_http_methods(["GET"])
def client_poll_detail(_request, pk):
    """
    Returns a single question with choices.
    """
    question = get_object_or_404(
        Question.objects.prefetch_related("choice_set").distinct(), 
        pk=pk,
        pub_date__lte=timezone.now(),
        choice__isnull=False
        )
    serialized_question = serialize_question_with_choices(question).model_dump()
    return JsonResponse(serialized_question)

@csrf_exempt
@require_http_methods(["POST"])
def vote(request):
    """
    Handles a POST request to update vote counts for a poll
    """
    try:
        data = json.loads(request.body)
        submission = PollSubmissionSchema.model_validate(data)
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON")
    except ValidationError as e:
        return HttpResponseBadRequest(e.json())

    votes_dict = submission.votes

    for question_id, choice_id in votes_dict.items():
        try:
            choice = Choice.objects.select_related("question").get(pk=choice_id)
        except ObjectDoesNotExist:
            return HttpResponseNotFound("Choice with this ID was not found")

        if choice.question_id != question_id:
            return HttpResponseBadRequest("Choice does not belong to this question")

        choice.votes += 1
        choice.save()

    return JsonResponse({"message": "Votes submitted successfully"}, status=200)
    
    

@api_view(['GET'])
def question_list_api(request):
    # Starts with all questions
    questions = Question.objects.all()

    # Check for query parameters from the client
    show_future_questions = request.query_params.get('show_future', 'false').lower() == 'true'
    show_choiceless_questions = request.query_params.get('show_choiceless', 'false').lower() == 'true'

    # Conditionally apply filters based on the parameters
    if not show_future_questions:
        questions = questions.filter(pub_date__lte=timezone.now())
    if not show_choiceless_questions:
        questions = questions.annotate(choice_count=Count('choice')).filter(choice_count__gte=1)

    # Build the response data
    question_data = []
    for q in questions:
        # Get choices for each question
        choices_data = [
            ChoiceSchema.model_validate(c).model_dump() # TODO: validate here less relevant if at all - i control this data
            for c in q.choice_set.all()
        ]
        # Build a dictionary to pass to the QuestionSchema
        # TODO: this should be done with the pydantic schema simply.
        # TODO: client needn't know about the things, pydantic can handle that.
        question_dict = {
            "id": q.id,
            "question_text": q.question_text,
            "pub_date": q.pub_date,
            "choices": choices_data,
        }
        # Validate and dump the data
        question_data.append(QuestionSchema.model_validate(question_dict).model_dump())
    
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
        pass
        # DRF automatically parses the req body with requset.data
        # vote_data = VoteSchema(**request.data)
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