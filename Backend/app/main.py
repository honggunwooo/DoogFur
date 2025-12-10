from fastapi import FastAPI
from dotenv import load_dotenv

from app.routers import login
from app.routers import register
from app.routers import post
from app.routers import health
from app.database import Base, engine

load_dotenv()

app = FastAPI()

# DB 테이블 자동 생성
Base.metadata.create_all(bind=engine)

# ⚠️ prefix는 라우터 내부에 이미 있음 → 절대 중복 추가 금지
app.include_router(login.router)
app.include_router(register.router)
app.include_router(health.router)
app.include_router(post.router)


@app.get("/")
def home():
    return {"message": "FastAPI 서버 정상 작동!"}