from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: str
    password: str
    nickname: str

class UserLogin(BaseModel):
    email: str
    password: str