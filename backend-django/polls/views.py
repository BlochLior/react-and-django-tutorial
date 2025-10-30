from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator, PageNotAnInteger, EmptyPage
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth import logout as django_logout
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
import os

from pydantic import ValidationError

from polls.models import Question, Choice, UserProfile, UserVote, AdminUserManagement, PollStatus
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

class CsrfExemptSessionAuthentication(SessionAuthentication):
    """DRF SessionAuthentication that skips CSRF checks for unsafe methods."""
    def enforce_csrf(self, request):
        return

def get_ordered_questions_for_admin():
    """Get questions ordered by admin dashboard requirements"""
    now = timezone.now()
    
    # Published questions (old to new)
    published = Question.objects.filter(
        pub_date__lte=now,
        choice__isnull=False
    ).distinct().order_by('pub_date', 'id')
    
    # Future questions with choices (by pub_date, fallback to id)
    future_with_choices = Question.objects.filter(
        pub_date__gt=now,
        choice__isnull=False
    ).distinct().order_by('pub_date', 'id')
    
    # Get all question IDs that have choices
    questions_with_choices = Question.objects.filter(
        choice__isnull=False
    ).values_list('id', flat=True).distinct()
    
    # Choiceless questions - published (by pub_date, fallback to id)
    choiceless = Question.objects.filter(
        pub_date__lte=now
    ).exclude(
        id__in=questions_with_choices
    ).order_by('pub_date', 'id')
    
    # Future choiceless questions
    future_choiceless = Question.objects.filter(
        pub_date__gt=now
    ).exclude(
        id__in=questions_with_choices
    ).order_by('pub_date', 'id')
    
    return {
        'published': published,
        'future_with_choices': future_with_choices,
        'choiceless': choiceless,
        'future_choiceless': future_choiceless
    }

def get_ordered_questions_for_client():
    """Get questions ordered for client view (published only)"""
    return Question.objects.filter(
        pub_date__lte=timezone.now(),
        choice__isnull=False
    ).distinct().order_by('pub_date', 'id')

# --- Client Views ---
@api_view(["GET"])
def client_poll_list(request: Request):
    """
    Returns a paginated list of published questions with standardized ordering.
    """
    # Use standardized ordering for client view
    questions_queryset = get_ordered_questions_for_client()

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
@csrf_exempt
@authentication_classes([CsrfExemptSessionAuthentication])
def vote(request: Request):
    """
    Handles a POST request to replace user's votes completely.
    This endpoint supports:
    - Initial vote submission
    - Vote modification (re-answering)
    - Vote removal (by sending empty votes dict)
    
    The endpoint removes ALL existing votes for the user, then adds the new votes.
    This ensures atomic vote updates and allows users to change or remove their votes.
    """
    # Debug authentication
    print(f"Vote request - User: {request.user}, Authenticated: {request.user.is_authenticated}")
    print(f"Session key: {request.session.session_key}")
    print(f"Session data: {dict(request.session)}")
    
    if not request.user.is_authenticated:
        print("User not authenticated for vote")
        return Response({"error": "Authentication required"}, status=status.HTTP_403_FORBIDDEN)
    
    # Check if poll is closed
    if PollStatus.is_poll_closed():
        return Response({"error": "Poll is closed. No further votes accepted."}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        # Print the raw data for debugging
        print("Received data:", request.data)
        submission = PollSubmissionSchema.model_validate(request.data)
    except ValidationError as e:
        # Print the validation error's JSON to the console
        print("Pydantic ValidationError:", e.json())
        return Response({"error": e.json()}, status=status.HTTP_400_BAD_REQUEST)

    votes_dict = submission.votes

    # Step 1: Remove ALL existing votes for this user
    existing_votes = UserVote.objects.filter(user=request.user).select_related('choice')
    for existing_vote in existing_votes:
        # Decrement vote count for each existing choice
        existing_vote.choice.votes -= 1
        existing_vote.choice.save()
    
    # Delete all existing user votes
    existing_votes.delete()
    
    # Step 2: Add new votes (if any provided)
    if votes_dict:
        for question_id, choice_id in votes_dict.items():
            try:
                choice = Choice.objects.select_related("question").get(pk=choice_id)
            except ObjectDoesNotExist:
                return Response({"error": "Choice with this ID was not found"}, status=status.HTTP_404_NOT_FOUND)

            if choice.question_id != question_id:
                return Response({"error": "Choice does not belong to this question"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Record new vote
            UserVote.objects.create(user=request.user, question=choice.question, choice=choice)
            
            # Increment vote count
            choice.votes += 1
            choice.save()

    return Response({"message": "Votes updated successfully"}, status=status.HTTP_200_OK)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_votes(request: Request):
    """
    Get user's submitted votes with question and choice details.
    Returns a list of all questions with their choices and the user's selected choice (if any).
    """
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_403_FORBIDDEN)
    
    # Get questions using standardized ordering
    questions_queryset = get_ordered_questions_for_client().prefetch_related("choice_set")
    
    # Get user's votes
    user_votes = UserVote.objects.filter(user=request.user).select_related('question', 'choice')
    user_votes_dict = {vote.question_id: vote.choice_id for vote in user_votes}
    
    # Build response with questions and user's selections
    results = []
    for question in questions_queryset:
        question_data = serialize_question_with_choices(question).model_dump()
        # Add user's selected choice ID if they voted on this question
        question_data['user_selected_choice_id'] = user_votes_dict.get(question.id)
        results.append(question_data)
    
    return Response({
        'count': len(results),
        'results': results
    }, status=status.HTTP_200_OK)
    
# --- Admin Views ---
@api_view(["POST"])
@permission_classes([IsAuthenticated])
@csrf_exempt
@authentication_classes([CsrfExemptSessionAuthentication])
def admin_create_question(request: Request):
    """
    Creates a new question with choices.
    """
    # Check if user is admin
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if not user_profile.is_admin:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({"error": "User profile not found"}, status=status.HTTP_403_FORBIDDEN)
    
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
@permission_classes([IsAuthenticated])
def admin_dashboard(request: Request):
    """
    Returns a paginated list of questions with standardized ordering.
    """
    # Check if user is admin
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if not user_profile.is_admin:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({"error": "User profile not found"}, status=status.HTTP_403_FORBIDDEN)
    
    # Use standardized ordering for admin dashboard
    ordered_questions = get_ordered_questions_for_admin()
    
    # Combine all question types in the desired order
    questions_queryset = (
        list(ordered_questions['published']) +
        list(ordered_questions['future_with_choices']) +
        list(ordered_questions['choiceless']) +
        list(ordered_questions['future_choiceless'])
    )

    try:
        page_size = int(request.query_params.get('page_size', ADMIN_QUESTIONS_PER_PAGE))
        if page_size <= 0:
            page_size = ADMIN_QUESTIONS_PER_PAGE
    except ValueError: 
        page_size = ADMIN_QUESTIONS_PER_PAGE
    
    # Manual pagination for the list
    total_count = len(questions_queryset)
    total_pages = (total_count + page_size - 1) // page_size  # Ceiling division
    
    try:
        page_number = int(request.query_params.get('page', 1))
        if page_number < 1:
            page_number = 1
        elif page_number > total_pages and total_pages > 0:
            page_number = total_pages
    except ValueError:
        page_number = 1
    
    # Calculate slice indices
    start_index = (page_number - 1) * page_size
    end_index = start_index + page_size
    
    # Get the page slice
    page_questions = questions_queryset[start_index:end_index]
    
    serialized_questions = [
        serialize_question_with_choices_admin(q).model_dump()
        for q in page_questions
    ]

    # Build the response metadata and data
    response_data = {
        'count': total_count,
        'next': page_number + 1 if page_number < total_pages else None,
        'previous': page_number - 1 if page_number > 1 else None,
        'page': page_number,
        'total_pages': total_pages,
        'page_size': page_size,
        'results': serialized_questions
    }

    return Response(response_data, status=status.HTTP_200_OK)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
@csrf_exempt
@authentication_classes([CsrfExemptSessionAuthentication])
def admin_question_detail(request: Request, pk):
    """
    Handles read, update and delete operations for a single question.
    """
    # Check if user is admin
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        if not user_profile.is_admin:
            return Response({"error": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
    except UserProfile.DoesNotExist:
        return Response({"error": "User profile not found"}, status=status.HTTP_403_FORBIDDEN)
    
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
    Returns a summary of questions with their results, including vote counts and percentages.
    
    Access control:
    - Guests/unauthenticated: Only published questions with choices
    - Authenticated users: Only published questions with choices
    - Admins: All questions (including unpublished and choiceless)
    """
    # Check if user is admin
    is_admin = False
    if request.user.is_authenticated:
        try:
            # Query profile from DB to get latest values (avoid stale cache)
            profile = UserProfile.objects.get(user=request.user)
            is_admin = profile.is_admin
        except UserProfile.DoesNotExist:
            # User is authenticated but has no profile - treat as regular user
            is_admin = False
    
    if is_admin:
        # Admins see everything with standardized ordering
        ordered_questions = get_ordered_questions_for_admin()
        questions = (
            list(ordered_questions['published']) +
            list(ordered_questions['future_with_choices']) +
            list(ordered_questions['choiceless']) +
            list(ordered_questions['future_choiceless'])
        )
    else:
        # Guests and regular users only see published questions with standardized ordering
        questions = list(get_ordered_questions_for_client())
    
    serialized_summary = ResultsSummarySchema.model_validate(list(questions))
    
    return Response(serialized_summary.model_dump(), status=status.HTTP_200_OK)


@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
@csrf_exempt
@authentication_classes([CsrfExemptSessionAuthentication])
def admin_user_management(request: Request):
    """Manage admin users - only main admin can add/remove admins"""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    try:
        profile = request.user.userprofile
        if not profile.is_admin:
            return Response({'error': 'Admin access required'}, status=403)
        
        # Check if user is main admin
        main_admin_email = AdminUserManagement.get_main_admin_email()
        if profile.google_email != main_admin_email:
            return Response({'error': 'Main admin access required'}, status=403)
            
    except UserProfile.DoesNotExist:
        return Response({'error': 'Admin access required'}, status=403)
    
    if request.method == 'GET':
        # Get all admin users
        admin_users = UserProfile.objects.filter(is_admin=True).values(
            'google_email', 'google_name', 'created_at'
        )
        return Response(list(admin_users))
    
    elif request.method == 'POST':
        # Add new admin user
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email required'}, status=400)
        
        try:
            user = User.objects.get(email=email)
            profile, created = UserProfile.objects.get_or_create(user=user)
            profile.is_admin = True
            profile.save()
            return Response({'message': 'Admin user added successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
    
    elif request.method == 'DELETE':
        # Remove admin user
        email = request.data.get('email')
        if email == main_admin_email:
            return Response({'error': 'Cannot remove main admin'}, status=400)
        
        # Additional check: prevent main admin from removing themselves
        if email == profile.google_email:
            return Response({'error': 'Main admin cannot remove their own privileges'}, status=400)
        
        try:
            user = User.objects.get(email=email)
            profile = user.userprofile
            profile.is_admin = False
            profile.save()
            return Response({'message': 'Admin user removed successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


@api_view(['GET', 'POST', 'DELETE'])
@csrf_exempt
@authentication_classes([CsrfExemptSessionAuthentication])
def poll_closure(request: Request):
    """Manage poll closure - GET is public, POST/DELETE require main admin"""
    
    if request.method == 'GET':
        # Get current poll status - publicly accessible
        is_closed = PollStatus.is_poll_closed()
        status = PollStatus.objects.first()
        
        return Response({
            'is_closed': is_closed,
            'closed_at': status.closed_at if status else None,
            'closed_by': status.closed_by.email if status and status.closed_by else None
        })
    
    # For POST and DELETE, require authentication and main admin access
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    try:
        profile = request.user.userprofile
        if not profile.is_admin:
            return Response({'error': 'Admin access required'}, status=403)
        
        # Check if user is main admin
        main_admin_email = AdminUserManagement.get_main_admin_email()
        if profile.google_email != main_admin_email:
            return Response({'error': 'Main admin access required'}, status=403)
            
    except UserProfile.DoesNotExist:
        return Response({'error': 'Admin access required'}, status=403)
    
    if request.method == 'POST':
        # Close the poll
        status = PollStatus.close_poll(request.user)
        return Response({
            'message': 'Poll closed successfully',
            'closed_at': status.closed_at,
            'closed_by': request.user.email
        })
    
    elif request.method == 'DELETE':
        # Reopen the poll
        status = PollStatus.reopen_poll(request.user)
        return Response({
            'message': 'Poll reopened successfully',
            'reopened_at': timezone.now(),
            'reopened_by': request.user.email
        })


# --- Authentication Views ---
@api_view(['GET'])
def debug_users(request: Request):
    """
    Debug endpoint to see what users and profiles exist in the database.
    Access via: https://your-app.onrender.com/polls/debug-users/
    """
    debug_info = {
        'users': [],
        'profiles': [],
        'env_vars': {
            'MAIN_ADMIN_EMAIL': os.getenv('MAIN_ADMIN_EMAIL', 'NOT SET'),
            'SUPERUSER_EMAIL': os.getenv('SUPERUSER_EMAIL', 'NOT SET'),
        },
        'current_user': {
            'username': request.user.username if request.user.is_authenticated else 'Anonymous',
            'email': request.user.email if request.user.is_authenticated else 'N/A',
            'is_authenticated': request.user.is_authenticated,
        }
    }
    
    # Get all users
    for user in User.objects.all():
        debug_info['users'].append({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_superuser': user.is_superuser,
            'is_staff': user.is_staff,
        })
    
    # Get all profiles
    for profile in UserProfile.objects.all():
        debug_info['profiles'].append({
            'user_id': profile.user.id,
            'user_username': profile.user.username,
            'google_email': profile.google_email,
            'google_name': profile.google_name,
            'is_admin': profile.is_admin,
        })
    
    return Response(debug_info, status=status.HTTP_200_OK)


@api_view(['GET'])
def test_logout(request: Request):
    """
    Test endpoint to check logout functionality.
    Returns current session info.
    """
    return Response({
        'authenticated': request.user.is_authenticated,
        'username': request.user.username if request.user.is_authenticated else 'Anonymous',
        'session_key': request.session.session_key,
        'session_data': dict(request.session),
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
def cookie_debug(request: Request):
    """
    Debug endpoint to check cookie settings and session state.
    """
    response_data = {
        'authenticated': request.user.is_authenticated,
        'session_key': request.session.session_key,
        'session_data': dict(request.session),
        'cookies_received': dict(request.COOKIES),
        'request_domain': request.get_host(),
        'request_scheme': request.scheme,
        'is_secure': request.is_secure(),
    }
    
    # Create response and set a test cookie
    response = Response(response_data, status=status.HTTP_200_OK)
    response.set_cookie('test_cookie', 'test_value', max_age=3600)
    
    return response


@api_view(['POST'])
def simple_logout(request: Request):
    """
    Simple logout test endpoint - clears everything aggressively.
    """
    try:
        print("Simple logout called")
        
        # Clear everything
        request.session.flush()
        
        # Force logout
        django_logout(request._request)
        
        # Clear any remaining data
        for key in list(request.session.keys()):
            del request.session[key]
        
        print("Simple logout completed")
        return Response({"message": "Simple logout successful"}, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Simple logout error: {str(e)}")
        return Response({"error": f"Simple logout failed: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def fix_user_profile(request: Request):
    """
    Fix endpoint to correct UserProfile data.
    Call this to fix the admin user profile with correct Google data.
    """
    try:
        # Get the admin user
        admin_user = User.objects.get(username='admin')
        profile = admin_user.userprofile
        
        # Update with correct data
        profile.google_email = 'blochlior@gmail.com'
        profile.google_name = 'Lior'  # Update with your actual name
        profile.is_admin = True
        profile.save()
        
        # Also update the user email
        admin_user.email = 'blochlior@gmail.com'
        admin_user.first_name = 'Lior'
        admin_user.save()
        
        return Response({
            'success': True,
            'message': 'UserProfile fixed successfully',
            'updated_profile': {
                'google_email': profile.google_email,
                'google_name': profile.google_name,
                'is_admin': profile.is_admin,
            }
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Admin user not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except UserProfile.DoesNotExist:
        return Response({
            'success': False,
            'message': 'UserProfile not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@ensure_csrf_cookie
def user_info(request: Request):
    """
    Get current user information for the home page.
    Returns user details, admin status, and voting status.
    Also ensures CSRF cookie is sent for subsequent POST requests.
    """
    # Debug logging
    print(f"User info request - User: {request.user}, Authenticated: {request.user.is_authenticated}")
    print(f"Session key: {request.session.session_key}")
    print(f"Session data: {dict(request.session)}")
    
    if request.user.is_authenticated:
        try:
            profile = request.user.userprofile
            main_admin_email = AdminUserManagement.get_main_admin_email()
            print(f"User profile found: {profile.google_email}")
            print(f"User is_admin flag: {profile.is_admin}")
            print(f"Main admin email from env: {main_admin_email}")
            print(f"Match: {profile.google_email == main_admin_email}")
            
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
    now = timezone.now()
    total_voters = UserVote.objects.values('user').distinct().count()
    total_votes = UserVote.objects.count()
    total_questions = Question.objects.count()

    # Hidden questions breakdown (avoid double-counting overlaps)
    unpublished_questions = Question.objects.filter(pub_date__gt=now).count()
    choiceless_questions = Question.objects.filter(choice__isnull=True).distinct().count()
    unpublished_choiceless = Question.objects.filter(
        pub_date__gt=now,
        choice__isnull=True
    ).distinct().count()

    # Union size: |A ∪ B| = |A| + |B| - |A ∩ B|
    hidden_total = unpublished_questions + choiceless_questions - unpublished_choiceless
    hidden_total = max(hidden_total, 0)

    # Visible to clients = published with choices
    visible_to_clients = Question.objects.filter(pub_date__lte=now, choice__isnull=False).distinct().count()

    return Response({
        'total_voters': total_voters,
        'total_votes': total_votes,
        'total_questions': total_questions,
        'visible_to_clients': visible_to_clients,
        'hidden_questions': {
            'unpublished': unpublished_questions,
            'choiceless': choiceless_questions,
            'unpublished_choiceless': unpublished_choiceless,
            'total': hidden_total
        }
    })


@csrf_exempt
@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
def logout_view(request: Request):
    """
    Handle user logout with aggressive session clearing.
    CSRF exempt because user is already authenticated.
    """
    try:
        # Debug logging
        print(f"Logout request - User: {request.user}, Authenticated: {request.user.is_authenticated}")
        print(f"Session key before: {request.session.session_key}")
        print(f"Session data before: {dict(request.session)}")
        
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response({"error": "User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Use Django's built-in logout function
        django_logout(request._request)
        
        # Also manually clear session data (more aggressive)
        request.session.flush()
        
        # Clear any remaining session data
        for key in list(request.session.keys()):
            del request.session[key]
        
        print(f"Session key after: {request.session.session_key}")
        print(f"Session data after: {dict(request.session)}")
        print("Logout successful")
        return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Logout error: {str(e)}")
        return Response({"error": "Logout failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    
    

