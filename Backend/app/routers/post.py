from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.post import Post
from app.schemas.post_schema import PostCreate

router = APIRouter(prefix="/posts", tags=["Posts"])

# 게시글 작성 (CREATE)
@router.post("/create")
def create_post(post_data: PostCreate, db: Session = Depends(get_db)):

    new_post = Post(
        title=post_data.title,
        content=post_data.content,
        user_id=post_data.user_id,
    )

    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    return {"message": "게시글 작성 완료", "post_id": new_post.post_id}



# 게시글 전체 조회 (READ)
@router.get("/")
def get_all_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.post_id.desc()).all()
    return posts




# 게시글 하나 조회 (READ)

@router.get("/{post_id}")
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.post_id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="게시글을 찾을 수 없습니다.")
    return post



# 게시글 삭제 (DELETE)
@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):

    post = db.query(Post).filter(Post.post_id == post_id).first()

    if not post:
        raise HTTPException(status_code=404, detail="삭제할 게시글이 없습니다.")

    db.delete(post)
    db.commit()

    return {"message": "게시글 삭제 완료"}