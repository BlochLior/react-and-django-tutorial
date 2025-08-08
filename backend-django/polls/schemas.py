from pydantic import BaseModel, ConfigDict, Field, computed_field, model_validator
from django.utils import timezone
from django.db import models
from datetime import datetime

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

    @model_validator(mode="before")
    def validate_related_fields(cls, data):
        if not isinstance(data, dict):
            if hasattr(data, "choice_set") and isinstance(data.choice_set, models.Manager):
                data.choice_set = list(data.choice_set.all())
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


class ResultsChoiceSchema(BaseModel):
    choice_text: str
    votes: int
    percentage: float
    
    model_config = ConfigDict(from_attributes=True)

class ResultsSchema(BaseModel):
    question_text: str
    total_votes: int
    choices: list[ResultsChoiceSchema]
    
    model_config = ConfigDict(from_attributes=True)
