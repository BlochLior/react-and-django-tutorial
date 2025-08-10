from .schemas import QuestionSchema, QuestionAdminSchema
from .models import Question

def serialize_question_with_choices(question_obj: Question) -> QuestionSchema:
    """
    Serializes a Django Question model instance into a Pydantic QuestionSchema,
    including all related choices.
    Basically, takes the Django RelatedManager and converts it to 
    a list to satisfy Pydantic's list field requirements.
    """

    # Make sure the choices are prefetched to avoid N+1 query issues
    if not hasattr(question_obj, "_prefetched_objects_cache") or "choice_set" not in question_obj._prefetched_objects_cache:
        question_obj = Question.objects.prefetch_related("choice_set").get(id=question_obj.id)

    question_data = {
        "id": question_obj.id,
        "question_text": question_obj.question_text,
        "pub_date": question_obj.pub_date,
        "choice_set": list(question_obj.choice_set.all())
    }

    return QuestionSchema.model_validate(question_data)
        
def serialize_question_with_choices_admin(admin_question_obj: Question) -> QuestionAdminSchema:
    """
    Serializes a Django Question model instance into a Pydantic QuestionAdminSchema,
    including all related choices. Handles the prefetching, and lets Pydantic handle
    the rest.
    """
    
    question_with_choices = Question.objects.prefetch_related("choice_set").get(id=admin_question_obj.id)
    
    question_data = {
        "id": question_with_choices.id,
        "question_text": question_with_choices.question_text,
        "pub_date": question_with_choices.pub_date,
        "choice_set": list(question_with_choices.choice_set.all()),
    }

    return QuestionAdminSchema.model_validate(question_data)