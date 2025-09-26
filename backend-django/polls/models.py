from django.db import models
from django.contrib.auth.models import User

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
