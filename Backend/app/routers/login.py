from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database import get_db
from app.models.user import User
from app.schemas.auth_schema import UserLogin

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"], 
    deprecated="auto"
)

def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):

    # 이메일 확인
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="이메일이 존재하지 않습니다.")

    # 비밀번호 검증
    if not verify_password(login_data.password, user.password):
        raise HTTPException(status_code=400, detail="비밀번호가 올바르지 않습니다.")

    return {
        "message": "로그인 성공",
        "user_id": user.user_id,
        "nickname": user.nickname
    }