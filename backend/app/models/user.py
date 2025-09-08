from pydantic import BaseModel
from typing import Optional

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    token: str

class User(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    role: str
    password: str 