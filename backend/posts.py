from backend.database import SessionLocal
from backend.models import Posts
from backend.schema import PostOut, PostCreate, PostUpdate
import resend
import os
from dotenv import load_dotenv
from fastapi import HTTPException

load_dotenv()
admin_email = os.getenv("ADMIN_EMAIL")

def get_all_posts():
    db = SessionLocal()
    try:
        posts = db.query(Posts).all()

        result = [PostOut.model_validate(p, from_attributes=True) for p in posts]
        return result
    finally:
        db.close()

def create_posts(post: PostCreate):
    db = SessionLocal()

    db_post = Posts(
        title=post.title,
        content=post.content,
        published=post.published
    )

    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    db.close()

    try:
        resend.Emails.send({
            "from": "onboarding@resend.dev",
            "to": admin_email,
            "subject": "New Post has been created!",
            "html": f"""
                <h2>New Pos created on your website</h2>
                <p><strong>Title:</strong> {post.title}</p>
                <p><strong>Content:</strong> {post.content}</p>
            """
        })
    except Exception as e:
        print(f"Error sending the email: {e}")

    return {"status": "success", "message": "Post created"}

def delete_posts(post_id: int):
    db = SessionLocal()

    post = db.query(Posts).filter(Posts.id == post_id).first()

    if not post:
        db.close()
        raise HTTPException(status_code=404, detail="Post not found")
    
    db.delete(post)
    db.commit()
    db.close()

    return {"status": "deleted"}

def update_posts(post_id: int, update: PostUpdate):
    db = SessionLocal()

    post = db.query(Posts).filter(Posts.id == post_id).first()

    if not post:
        db.close()
        raise HTTPException(status_code=404, detail="Post not found")
    
    if update.title is not None:
        post.title = update.title
    if update.content is not None:
        post.content = update.content
    if update.published is not None:    
        post.published = update.published

    db.commit()
    db.refresh(post)
    db.close()
    return {"status": "Post updated"}

def get_post_by_id(post_id: int):
    db = SessionLocal()

    post = db.query(Posts).filter(Posts.id == post_id).first()

    if not post:
        db.close()
        raise HTTPException(status_code=404, detail="Post not found")


    db.close()
    return post

