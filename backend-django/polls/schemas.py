from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator
from django.utils import timezone
from datetime import datetime
from typing import Optional

# --- Client Schemas ---

class ChoiceSchema(BaseModel):
    """
    ChoiceSchema is a model inherited from BaseModel of pydantic.
    It is used to validate the choice data.
    """
    id: int
    choice_text: str
    votes: int

    model_config = ConfigDict(from_attributes=True)

class QuestionSchema(BaseModel):
    """
    QuestionSchema is a model inherited from BaseModel of pydantic.
    It is used to validate the question data.
    """
    id: int
    question_text: str
    pub_date: datetime
    choices: list[ChoiceSchema] = Field(alias="choice_set")

    model_config = ConfigDict(from_attributes=True)

class PollSubmissionSchema(BaseModel):
    """
    PollSubmissionSchema is a model inherited from BaseModel of pydantic.
    It is used to validate the poll submission data.
    """
    votes: dict[int, int]
    
    model_config = ConfigDict(from_attributes=True)

# --- Admin Schemas ---
class QuestionAdminSchema(BaseModel):
    """
    The note_future_date and note_choiceless are used to display notes in the admin views,
    on the frontend directly.
    As such, they make the API more informative, and reduce the need for additional logic
    on the frontend.
    """
    id: int
    question_text: str
    pub_date: datetime
    choices: list[ChoiceSchema] = Field(
        alias="choice_set",
        default_factory=list,
        json_schema_extra={'read_only': True}
        )
    
    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    def validate_related_fields(cls, data):
        # This validator correctly handles the conversion from Django's manager to a list.
        if not isinstance(data, dict):
            # We must create a new dictionary to pass to Pydantic
            # to avoid the TypeError for direct assignment.
            return {
                "id": data.id,
                "question_text": data.question_text,
                "pub_date": data.pub_date,
                "choice_set": list(data.choice_set.all())
            }
        return data
        

    @computed_field
    def note_future_date(self) -> str:
        if self.pub_date > timezone.now():
            return "This question is in the future"
        return ""
    
    @computed_field
    def note_choiceless(self) -> str:
        if not self.choices:
            return "This question has no choices"
        return ""

class NewChoiceSchema(BaseModel):
    """
    Schema for creating a new choice.
    The votes field is optional and defaults to 0.
    """
    choice_text: str
    votes: int = 0

    model_config = ConfigDict(from_attributes=True)

class NewQuestionSchema(BaseModel):
    """
    Schema for creating a new question and its choices.
    The choices field is optional and defaults to an empty list.
    """
    question_text: str
    pub_date: datetime = Field(default_factory=timezone.now)
    choices: list[NewChoiceSchema] = []

class ChoiceUpdateSchema(BaseModel):
    id: Optional[int] = None
    choice_text: str
    votes: int

    model_config = ConfigDict(from_attributes=True)

class QuestionUpdateSchema(BaseModel):
    """
    Schema for updating a question and its choices.
    The choices field is optional and defaults to an empty list.
    """
    # No id because it is in the URL for restful API
    question_text: str
    pub_date: datetime = Field(default_factory=timezone.now)
    choices: list[ChoiceUpdateSchema] = []

class ResultsChoiceSchema(BaseModel):
    choice_text: str
    votes: int
    percentage: float
    
    model_config = ConfigDict(from_attributes=True)

class ResultsSchema(BaseModel):
    """
    Schema for a question in the results summary.
    """
    id: int
    question_text: str
    pub_date: datetime
    total_votes: int
    choices: list[ResultsChoiceSchema]
    
    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    def calculate_total_votes(cls, data):
        if not isinstance(data, dict):
            # Calculate total_votes and percentages before validation
            choices = list(data.choice_set.all())
            total_votes = sum(c.votes for c in choices)
            
            # Update the choices with percentage
            for choice in choices:
                choice.percentage = (choice.votes / total_votes) * 100 if total_votes > 0 else 0.0

            return {
                "id": data.id,
                "question_text": data.question_text,
                "pub_date": data.pub_date,
                "total_votes": total_votes,
                "choices": choices
            }
        return data

class ResultsSummarySchema(BaseModel):
    """
    Schema for the overall results summary of all questions.
    """
    total_questions: int
    total_votes_all_questions: int
    questions_results: list[ResultsSchema]

    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='before')
    def prepare_summary_data(cls, data):
        if isinstance(data, list):
            total_questions = len(data)
            questions_results = []
            total_votes_all_questions = 0

            for question in data:
                # Use the ResultsSchema to process each question
                validated_question = ResultsSchema.model_validate(question)
                questions_results.append(validated_question)
                total_votes_all_questions += validated_question.total_votes
            
            return {
                "total_questions": total_questions,
                "total_votes_all_questions": total_votes_all_questions,
                "questions_results": questions_results
            }
        return data