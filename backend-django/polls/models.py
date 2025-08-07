from django.db import models

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
