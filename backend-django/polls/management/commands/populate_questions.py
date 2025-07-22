from django.core.management.base import BaseCommand
from polls.models import Question, Choice
from django.utils import timezone

class Command(BaseCommand):
    """
    This command is used to populate the database with questions and choices.
    It is run once, after the database is created.
    Questions 1 and 2 are already in the database, and were entered manually, 
    through the python interactive shell.
    As such, this command is just as a learning exercise.
    """
    help = 'Populate the database with questions and choices'

    def handle(self, *args, **options):
        # Create new questions
        q1 = Question(question_text="What's up?", pub_date=timezone.now())
        q1.save()
        q2 = Question(question_text="What's your favorite color?", pub_date=timezone.now())
        q2.save()
        q3 = Question(question_text="What's your favorite animal?", pub_date=timezone.now())
        q3.save()
        q4 = Question(question_text="What's your favorite food?", pub_date=timezone.now())
        q4.save()
        q5 = Question(question_text="What's your favorite movie?", pub_date=timezone.now())
        q5.save()

        # Create new choices
        c1 = Choice(choice_text="Red", votes=0, question=q2)
        c1.save()
        c2 = Choice(choice_text="Blue", votes=0, question=q2)
        c2.save()
        c3 = Choice(choice_text="Green", votes=0, question=q2)
        c3.save()
        c4 = Choice(choice_text="Dog", votes=0, question=q3)
        c4.save()
        c5 = Choice(choice_text="Cat", votes=0, question=q3)
        c5.save()
        c6 = Choice(choice_text="Fish", votes=0, question=q3)
        c6.save()
        c7 = Choice(choice_text="Pizza", votes=0, question=q4)
        c7.save()
        c8 = Choice(choice_text="Burger", votes=0, question=q4)
        c8.save()
        c9 = Choice(choice_text="Sushi", votes=0, question=q4)
        c9.save()
        c10 = Choice(choice_text="Ice cream", votes=0, question=q4)
        c10.save()
        c11 = Choice(choice_text="The Godfather", votes=0, question=q5)
        c11.save()
        c12 = Choice(choice_text="The Dark Knight", votes=0, question=q5)
        c12.save()
        c13 = Choice(choice_text="The Lord of the Rings", votes=0, question=q5)
        c13.save()
        c14 = Choice(choice_text="The Matrix", votes=0, question=q5)
        c14.save()
        c15 = Choice(choice_text="The Hobbit", votes=0, question=q5)
        c15.save()
        c16 = Choice(choice_text="The Lion King", votes=0, question=q5)
        c16.save()
        c17 = Choice(choice_text="The Avengers", votes=0, question=q5)
        c17.save()
        c18 = Choice(choice_text="Not much", votes=0, question=q1)
        c18.save()
        c19 = Choice(choice_text="Just hacking around", votes=0, question=q1)
        c19.save()
                