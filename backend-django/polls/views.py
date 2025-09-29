from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from pydantic import ValidationError

from polls.models import Question, Choice, UserProfile, UserVote
from polls.schemas import (
    NewQuestionSchema, 
    PollSubmissionSchema, 
    QuestionAdminSchema, 
    QuestionUpdateSchema,
    ResultsSummarySchema
)
from polls.serializers import serialize_question_with_choices, serialize_question_with_choices_admin


QUESTIONS_PER_PAGE = 5
ADMIN_QUESTIONS_PER_PAGE = 10

# --- Client Views ---
@api_view(["GET"])
def client_poll_list(request: Request):
    """
    Returns a paginated list of published questions with choices.
    """
    # Filter to only questions published and with choices
    questions_queryset = Question.objects.filter(
        pub_date__lte=timezone.now(),
        choice__isnull=False
    ).distinct().order_by('-pub_date')

    # Check for the 'page_size=all' parameter
    page_size = request.query_params.get('page_size')
    if page_size == 'all':
        serialized_questions = [
            serialize_question_with_choices(q).model_dump()
            for q in questions_queryset
        ]
        response_data = {
            'count': questions_queryset.count(),
            'next': None,
            'previous': None,
            'page': 1,
            'total_pages': 1,
            'results': serialized_questions
        }
        return Response(response_data, status=status.HTTP_200_OK)

    # Normal pagination logic
    paginator = Paginator(questions_queryset, QUESTIONS_PER_PAGE)
    page_number = request.query_params.get('page', 1)

    try: 
        page_obj = paginator.page(page_number)
    except PageNotAnInteger:
        page_obj = paginator.page(1)
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages)

    serialized_questions = [
        serialize_question_with_choices(q).model_dump()
        for q in page_obj
    ]

    response_data = {
        'count': paginator.count,
        'next': page_obj.next_page_number() if page_obj.has_next() else None,
        'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
        'page': page_obj.number,
        'total_pages': paginator.num_pages,
        'results': serialized_questions
    }

    return Response(response_data, status=status.HTTP_200_OK)

@api_view(["GET"])
def client_poll_detail(_request: Request, pk):
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
    return Response(serialized_question, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def vote(request: Request):
    """
    Handles a POST request to update vote counts for a poll.
    Now tracks user votes to prevent duplicate voting and enable user-specific features.
    """
    # Debug authentication
    print(f"Vote request - User: {request.user}, Authenticated: {request.user.is_authenticated}")
    print(f"Session key: {request.session.session_key}")
    print(f"Session data: {dict(request.session)}")
    
    if not request.user.is_authenticated:
        print("User not authenticated for vote")
        return Response({"error": "Authentication required"}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Print the raw data for debugging
        print("Received data:", request.data)
        submission = PollSubmissionSchema.model_validate(request.data)
    except ValidationError as e:
        # Print the validation error's JSON to the console
        print("Pydantic ValidationError:", e.json())
        return Response({"error": e.json()}, status=status.HTTP_400_BAD_REQUEST)

    votes_dict = submission.votes

    if not votes_dict:
        return Response({"error": "No votes provided"}, status=status.HTTP_400_BAD_REQUEST)

    for question_id, choice_id in votes_dict.items():
        try:
            choice = Choice.objects.select_related("question").get(pk=choice_id)
        except ObjectDoesNotExist:
            return Response({"error": "Choice with this ID was not found"}, status=status.HTTP_404_NOT_FOUND)

        if choice.question_id != question_id:
            return Response({"error": "Choice does not belong to this question"}, status=status.HTTP_400_BAD_REQUEST)

        # Remove existing vote if user already voted on this question
        existing_vote = UserVote.objects.filter(user=request.user, question=choice.question).first()
        if existing_vote:
            # Decrement the old choice's vote count
            old_choice = existing_vote.choice
            old_choice.votes -= 1
            old_choice.save()
            # Remove the old vote record
            existing_vote.delete()
        
        # Record new vote
        UserVote.objects.create(user=request.user, question=choice.question, choice=choice)
        
        # Update vote count
        choice.votes += 1
        choice.save()

    return Response({"message": "Votes submitted successfully"}, status=status.HTTP_200_OK)
    
# --- Admin Views ---
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_create_question(request: Request):
    """
    Creates a new question with choices.
    """
    try:
        validated_data = NewQuestionSchema.model_validate(request.data)
    except ValidationError as e:
        return Response({"errors": e.errors()}, status=status.HTTP_400_BAD_REQUEST)
    
    # DEBUG
    print("Validated Data:", validated_data)

    # Create the question
    question = Question.objects.create(
        question_text=validated_data.question_text,
        pub_date=validated_data.pub_date
    )
    
    # DEBUG
    print("Created Question:", question)
    print("Question ID:", question.id)
    
    # Create choices for the question
    for choice in validated_data.choices:
        Choice.objects.create(
            question=question,
            choice_text=choice.choice_text,
            votes=choice.votes
        )
    
    return Response({"message": "Question created successfully"}, status=status.HTTP_201_CREATED)
    
@api_view(['GET'])
def admin_dashboard(request: Request):
    """
    Returns a paginated list of questions with choices.
    """
    # Retrieve all questions
    questions_queryset = Question.objects.prefetch_related("choice_set").order_by('-pub_date')

    try:
        page_size = int(request.query_params.get('page_size', ADMIN_QUESTIONS_PER_PAGE))
        if page_size <= 0:
            page_size = ADMIN_QUESTIONS_PER_PAGE
    except ValueError: 
        page_size = ADMIN_QUESTIONS_PER_PAGE
    
    paginator = Paginator(questions_queryset, page_size)
    page_number = request.query_params.get('page', 1)

    try: 
        page_obj = paginator.page(page_number)
    except PageNotAnInteger: 
        # if a page is not an integer, deliver first page.
        page_obj = paginator.page(1)
    except EmptyPage: 
        # if a page is out of range, deliver last page of results.
        page_obj = paginator.page(paginator.num_pages)
    
    serialized_questions = [
        serialize_question_with_choices_admin(q).model_dump()
        for q in page_obj
    ]

    # Build the response metadata and data
    response_data = {
        'count': paginator.count,
        'next': page_obj.next_page_number() if page_obj.has_next() else None,
        'previous': page_obj.previous_page_number() if page_obj.has_previous() else None,
        'page': page_obj.number,
        'total_pages': paginator.num_pages,
        'page_size': page_size,
        'results': serialized_questions
    }

    return Response(response_data, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_question_detail(request: Request, pk):
    """
    Handles read, update and delete operations for a single question.
    """
    question = get_object_or_404(
        Question.objects.prefetch_related("choice_set").distinct(), 
        pk=pk,
        )

    if request.method == 'GET':
        serialized_question = QuestionAdminSchema.model_validate(question).model_dump()
        return Response(serialized_question, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        try:
            # Use the update schema for validation
            validated_data = QuestionUpdateSchema.model_validate(request.data)
        except ValidationError as e:
            return Response({"errors": e.errors()}, status=status.HTTP_400_BAD_REQUEST)

        # Update the question's text and publication date
        question.question_text = validated_data.question_text
        question.pub_date = validated_data.pub_date
        question.save()

        # Get existing choice IDs for deletion check
        existing_choice_ids = set(question.choice_set.values_list('id', flat=True))
        incoming_choice_ids = {c.id for c in validated_data.choices if c.id is not None}
        
        # Delete choices that are not in the new data
        choices_to_delete_ids = existing_choice_ids - incoming_choice_ids
        Choice.objects.filter(id__in=choices_to_delete_ids).delete()

        # Update or create choices
        for choice_data in validated_data.choices:
            if choice_data.id is not None:
                # Update existing choice
                Choice.objects.filter(id=choice_data.id).update(
                    choice_text=choice_data.choice_text,
                    votes=choice_data.votes
                )
            else:
                # Create new choice
                Choice.objects.create(
                    question=question,
                    choice_text=choice_data.choice_text,
                    votes=choice_data.votes
                )

        return Response({"message": "Question updated successfully"}, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        # Debug authentication
        print(f"Delete request - User: {request.user}, Authenticated: {request.user.is_authenticated}")
        print(f"Session key: {request.session.session_key}")
        print(f"Session data: {dict(request.session)}")
        
        if not request.user.is_authenticated:
            print("User not authenticated for delete")
            return Response({"error": "Authentication required"}, status=status.HTTP_403_FORBIDDEN)
        
        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def admin_results_summary(request: Request):
    """
    Returns a summary of all questions with their results, including vote counts and percentages.
    """
    questions = Question.objects.prefetch_related("choice_set").all().order_by('-pub_date')
    
    serialized_summary = ResultsSummarySchema.model_validate(list(questions))
    
    return Response(serialized_summary.model_dump(), status=status.HTTP_200_OK)


# --- Authentication Views ---
@api_view(['GET'])
def user_info(request: Request):
    """
    Get current user information for the home page.
    Returns user details, admin status, and voting status.
    """
    # Debug logging
    print(f"User info request - User: {request.user}, Authenticated: {request.user.is_authenticated}")
    print(f"Session key: {request.session.session_key}")
    print(f"Session data: {dict(request.session)}")
    
    if request.user.is_authenticated:
        try:
            profile = request.user.userprofile
            print(f"User profile found: {profile.google_email}")
            return Response({
                'authenticated': True,
                'email': profile.google_email,
                'name': profile.google_name,
                'is_admin': profile.is_admin,
                'has_voted': has_user_voted(request.user)
            })
        except UserProfile.DoesNotExist:
            print(f"UserProfile not found for user: {request.user.username}")
            # Fallback for users without profiles (shouldn't happen in OAuth flow)
            return Response({
                'authenticated': True,
                'email': request.user.email,
                'name': request.user.username,
                'is_admin': False,
                'has_voted': False
            })
    print("User not authenticated")
    return Response({'authenticated': False})


def has_user_voted(user):
    """
    Check if user has voted on any poll.
    This is used by the user_info endpoint and home page logic.
    """
    return UserVote.objects.filter(user=user).exists()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_stats(request: Request):
    """
    Get admin statistics for the admin dashboard.
    Returns comprehensive statistics including voter counts and hidden questions.
    """
    try:
        profile = request.user.userprofile
        if not profile.is_admin:
            return Response({'error': 'Admin access required'}, status=403)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Admin access required'}, status=403)
    
    # Calculate statistics
    total_voters = UserVote.objects.values('user').distinct().count()
    total_votes = UserVote.objects.count()
    total_questions = Question.objects.count()
    
    # Hidden questions breakdown
    unpublished_questions = Question.objects.filter(pub_date__gt=timezone.now()).count()
    choiceless_questions = Question.objects.filter(choice__isnull=True).distinct().count()
    unpublished_choiceless = Question.objects.filter(
        pub_date__gt=timezone.now(),
        choice__isnull=True
    ).distinct().count()
    
    return Response({
        'total_voters': total_voters,
        'total_votes': total_votes,
        'total_questions': total_questions,
        'hidden_questions': {
            'unpublished': unpublished_questions,
            'choiceless': choiceless_questions,
            'unpublished_choiceless': unpublished_choiceless,
            'total': unpublished_questions + choiceless_questions + unpublished_choiceless
        }
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request: Request):
    """
    Handle user logout.
    This endpoint is called by the frontend before redirecting to Django's logout URL.
    """
    # Django's session-based logout will be handled by the frontend redirect
    # This endpoint just confirms the logout request
    return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
    
    
    

