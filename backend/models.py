from pydantic import BaseModel

class Project(BaseModel):
    name: str
    description: str
    url: str
    language: str | None