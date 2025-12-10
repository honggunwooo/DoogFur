from fastapi import APIRouter, Depends
from app.database import engine

router = APIRouter()

@router.get("/db")
def check_db():
    try:
        conn = engine.connect()
        conn.close()
        return {"status": "ok", "message": "DB 연결 성공!"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}