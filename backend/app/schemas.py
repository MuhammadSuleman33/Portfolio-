from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class ProjectOut(BaseModel):
    id: str
    title: str
    summary: str
    description: str
    tech_stack: list[str]
    image_url: str
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    featured: bool
    created_at: str
