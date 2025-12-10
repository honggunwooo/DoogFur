from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database import get_db
from app.models.user import User
from app.schemas.auth_schema import UserCreate

router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)

def hash_password(password: str):
    return pwd_context.hash(password)

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    # 비밀번호 길이 체크
    if len(user.password) < 6:
        raise HTTPException(status_code=400, detail="비밀번호는 6자 이상이어야 합니다.")

    # 이메일 중복 체크
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")

    # 비밀번호 해싱
    hashed_pw = hash_password(user.password)

    # User 생성
    new_user = User(
        email=user.email,
        password=hashed_pw,
        nickname=user.nickname
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "회원가입 성공", "user_id": new_user.user_id}