from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import os

class Question(models.Model):
    """
    Question is a model inherited from models.Model of django.
    It is used to store the question data.
    """
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')

    def __str__(self):
        return str(self.question_text)
        
class Choice(models.Model):
    """
    Choice is a model inherited from models.Model of django.
    It is used to store the choice data.
    """
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)
    def __str__(self):
        return str(self.choice_text)


class UserProfile(models.Model):
    """
    UserProfile extends Django's User model to store additional information
    needed for Google OAuth authentication and admin role management.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_admin = models.BooleanField(default=False)
    google_email = models.EmailField(unique=True)
    google_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} ({self.google_email})"


class UserVote(models.Model):
    """
    UserVote tracks which users have voted on which questions,
    ensuring one vote per user per question and providing audit trail.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice = models.ForeignKey(Choice, on_delete=models.CASCADE)
    voted_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'question']  # One vote per user per question
    
    def __str__(self):
        return f"{self.user.username} voted for '{self.choice.choice_text}' on '{self.question.question_text}'"


class AdminUserManagement(models.Model):
    """
    Track admin user management and main admin configuration.
    """
    main_admin_email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    @classmethod
    def get_main_admin_email(cls):
        """Get the main admin email from environment or database"""
        return os.getenv('MAIN_ADMIN_EMAIL', 'admin@example.com')
    
    def __str__(self):
        return f"Main Admin: {self.main_admin_email}"


class PollStatus(models.Model):
    """
    Track poll status and closure.
    """
    is_closed = models.BooleanField(default=False)
    closed_at = models.DateTimeField(null=True, blank=True)
    closed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    @classmethod
    def is_poll_closed(cls):
        """Check if poll is currently closed"""
        status = cls.objects.first()
        return status.is_closed if status else False
    
    @classmethod
    def close_poll(cls, user):
        """Close the poll"""
        status, created = cls.objects.get_or_create(defaults={'is_closed': False})
        status.is_closed = True
        status.closed_at = timezone.now()
        status.closed_by = user
        status.save()
        return status
    
    @classmethod
    def reopen_poll(cls, user):
        """Reopen the poll"""
        status, created = cls.objects.get_or_create(defaults={'is_closed': False})
        status.is_closed = False
        status.closed_at = None
        status.closed_by = None
        status.save()
        return status
    
    def __str__(self):
        return f"Poll {'Closed' if self.is_closed else 'Open'}"
