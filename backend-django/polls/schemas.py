from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

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
    choices: list[ChoiceSchema] = []
    
    model_config = ConfigDict(from_attributes=True)

class VoteSchema(BaseModel):
    """
    VoteSchema is a model inherited from BaseModel of pydantic.
    It is used to validate the vote data.
    """
    choice_id: int