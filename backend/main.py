import os
import uuid
import shutil
import mimetypes
import httpx
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from typing import Any, Dict, List, Optional
from datetime import datetime

from database import mongo_manager, init_db
from auth import hash_password, verify_password, create_access_token, require_current_user_email, verify_admin_token, ensure_user_not_blocked

app = FastAPI(title="Pulse of Profit API")

# Configure CORS
origins = [
    "https://pulseofprofit.vercel.app",
    "http://localhost:3000",
    "http://localhost:8000",
    "*"
]
frontend_env = os.getenv("FRONTEND_URL")
if frontend_env and frontend_env not in origins:
    origins.append(frontend_env)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static uploads directory
UPLOADS_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

CLOUDFLARE_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID", "").strip()
CLOUDFLARE_IMAGES_API_TOKEN = os.getenv("CLOUDFLARE_IMAGES_API_TOKEN", "").strip()
CLOUDFLARE_IMAGES_VARIANT = os.getenv("CLOUDFLARE_IMAGES_VARIANT", "public").strip() or "public"


def is_image_upload(file: UploadFile) -> bool:
    content_type = (file.content_type or "").lower()
    extension = os.path.splitext(file.filename or "")[1].lower()
    return content_type.startswith("image/") or extension in {
        ".avif", ".bmp", ".gif", ".heic", ".heif", ".jpeg", ".jpg",
        ".png", ".svg", ".tif", ".tiff", ".webp",
    }


async def store_uploaded_file(file: UploadFile) -> str:
    """Store images in Cloudflare Images when configured, otherwise locally.

    Non-image media such as videos continue to use local uploads.
    """
    has_account = bool(CLOUDFLARE_ACCOUNT_ID)
    has_token = bool(CLOUDFLARE_IMAGES_API_TOKEN)
    if has_account != has_token:
        raise HTTPException(
            status_code=503,
            detail="Cloudflare Images is partially configured. Set both account ID and API token.",
        )

    if is_image_upload(file) and has_account and has_token:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="The uploaded image is empty.")

        content_type = file.content_type or mimetypes.guess_type(file.filename or "")[0] or "application/octet-stream"
        endpoint = f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/images/v1"
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    endpoint,
                    headers={"Authorization": f"Bearer {CLOUDFLARE_IMAGES_API_TOKEN}"},
                    data={"requireSignedURLs": "false"},
                    files={"file": (os.path.basename(file.filename or "image"), content, content_type)},
                )
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail="Could not reach Cloudflare Images.") from exc

        try:
            payload = response.json()
        except ValueError as exc:
            raise HTTPException(status_code=502, detail="Cloudflare Images returned an invalid response.") from exc

        if not response.is_success or not payload.get("success"):
            errors = payload.get("errors") or []
            detail = errors[0].get("message") if errors and isinstance(errors[0], dict) else None
            raise HTTPException(status_code=502, detail=detail or "Cloudflare Images rejected the upload.")

        result = payload.get("result") or {}
        variants = result.get("variants") or []
        if not variants:
            raise HTTPException(status_code=502, detail="Cloudflare Images did not return a delivery URL.")

        requested_suffix = f"/{CLOUDFLARE_IMAGES_VARIANT}"
        return next((url for url in variants if url.rstrip("/").endswith(requested_suffix)), variants[0])

    extension = os.path.splitext(os.path.basename(file.filename or ""))[1]
    unique_name = f"{uuid.uuid4()}{extension}"
    file_path = os.path.join(UPLOADS_DIR, unique_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return f"/uploads/{unique_name}"

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Pydantic Schemas
class Comment(BaseModel):
    id: str
    author: str
    avatar: str
    content: str
    timestamp: str

class Post(BaseModel):
    id: str
    title: str
    date: str
    author: str
    content: str
    likes: int
    reposts: int = 0
    comments_count: int
    comments: List[Comment]
    imageUrl: Optional[str] = None
    mediaUrls: Optional[List[str]] = []
    contentBlocks: Optional[List[Dict[str, Any]]] = None
    isLiked: Optional[bool] = False
    isReposted: Optional[bool] = False

class PostCreate(BaseModel):
    title: str
    content: str
    imageUrl: Optional[str] = None
    mediaUrls: Optional[List[str]] = []
    contentBlocks: Optional[List[Dict[str, Any]]] = None
    author: Optional[str] = None

class Profile(BaseModel):
    email: str
    name: str
    mob_no: Optional[str] = ""
    avatar: str
    bio: str

class ProfileUpdate(BaseModel):
    name: str
    mob_no: Optional[str] = ""
    bio: str

class CommentCreate(BaseModel):
    author: str
    content: str

class UserRegister(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    mob_no: Optional[str] = ""
    password: Optional[str] = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: Optional[str] = ""

class EmailAuthRequest(BaseModel):
    email: EmailStr

class AdminRegister(BaseModel):
    name: str
    mob_no: str
    email: EmailStr
    passcode: str

class AdminLogin(BaseModel):
    email: Optional[EmailStr] = None
    passcode: str

class ManualLikesUpdate(BaseModel):
    likes: int

class ManualCommentCreate(BaseModel):
    author: str
    content: str
    avatar: Optional[str] = None

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Profile

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/email-auth", response_model=AuthResponse)
def email_auth(req: EmailAuthRequest):
    email = req.email.strip().lower()
    found_user = None

    if mongo_manager.is_connected and mongo_manager.db is not None:
        users_col = mongo_manager.db["users"]
        found_user = users_col.find_one({"email": email})
    else:
        for u in mongo_manager.in_memory_users:
            if u["email"].lower() == email:
                found_user = u
                break

    if found_user:
        if found_user.get("is_blocked", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been blocked. Contact support for help.",
            )
        # Existing user - login
        token = create_access_token({"sub": email})
        user_profile = Profile(
            email=found_user["email"],
            name=found_user.get("name") or email.split("@")[0].capitalize(),
            mob_no=found_user.get("mob_no", ""),
            avatar=found_user.get("avatar") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}",
            bio=found_user.get("bio", "Member of Pulse of Profit community.")
        )
        return AuthResponse(access_token=token, user=user_profile)
    else:
        # New user - register
        display_name = email.split("@")[0].capitalize()
        avatar = f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}"
        user_doc = {
            "email": email,
            "name": display_name,
            "mob_no": "",
            "hashed_password": "",
            "avatar": avatar,
            "bio": "Member of Pulse of Profit community.",
            "role": "user",
            "created_at": datetime.now()
        }
        if mongo_manager.is_connected and mongo_manager.db is not None:
            users_col = mongo_manager.db["users"]
            users_col.insert_one(user_doc)
        else:
            mongo_manager.in_memory_users.append(user_doc)

        token = create_access_token({"sub": email})
        user_profile = Profile(
            email=email,
            name=display_name,
            mob_no="",
            avatar=avatar,
            bio="Member of Pulse of Profit community."
        )
        return AuthResponse(access_token=token, user=user_profile)


@app.post("/api/auth/register", response_model=AuthResponse)
def register(user_in: UserRegister):
    email = user_in.email.strip().lower()
    found_user = None

    if mongo_manager.is_connected and mongo_manager.db is not None:
        users_col = mongo_manager.db["users"]
        found_user = users_col.find_one({"email": email})
    else:
        for u in mongo_manager.in_memory_users:
            if u["email"].lower() == email:
                found_user = u
                break

    if found_user:
        ensure_user_not_blocked(email)
        # User already exists: Log them in seamlessly
        token = create_access_token({"sub": email})
        user_profile = Profile(
            email=found_user["email"],
            name=found_user.get("name") or (user_in.name if user_in.name else email.split("@")[0].capitalize()),
            mob_no=found_user.get("mob_no", user_in.mob_no or ""),
            avatar=found_user.get("avatar") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}",
            bio=found_user.get("bio", "Member of Pulse of Profit community.")
        )
        return AuthResponse(access_token=token, user=user_profile)

    display_name = user_in.name.strip() if user_in.name and user_in.name.strip() else email.split("@")[0].capitalize()
    hashed_pwd = hash_password(user_in.password) if user_in.password else ""
    avatar = f"https://api.dicebear.com/7.x/avataaars/svg?seed={display_name}"

    user_doc = {
        "email": email,
        "name": display_name,
        "mob_no": user_in.mob_no or "",
        "hashed_password": hashed_pwd,
        "avatar": avatar,
        "bio": "Member of Pulse of Profit community.",
        "role": "user",
        "created_at": datetime.now()
    }

    if mongo_manager.is_connected and mongo_manager.db is not None:
        users_col = mongo_manager.db["users"]
        users_col.insert_one(user_doc)
    else:
        mongo_manager.in_memory_users.append(user_doc)

    token = create_access_token({"sub": email})
    user_profile = Profile(
        email=email,
        name=display_name,
        mob_no=user_in.mob_no or "",
        avatar=avatar,
        bio="Member of Pulse of Profit community."
    )
    return AuthResponse(access_token=token, user=user_profile)


@app.post("/api/auth/login", response_model=AuthResponse)
def login(user_in: UserLogin):
    email = user_in.email.strip().lower()
    found_user = None

    if mongo_manager.is_connected and mongo_manager.db is not None:
        users_col = mongo_manager.db["users"]
        found_user = users_col.find_one({"email": email})
    else:
        for u in mongo_manager.in_memory_users:
            if u["email"].lower() == email:
                found_user = u
                break

    if found_user:
        ensure_user_not_blocked(email)

    if not found_user:
        # If user not registered yet, auto-register them
        display_name = email.split("@")[0].capitalize()
        avatar = f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}"
        user_doc = {
            "email": email,
            "name": display_name,
            "mob_no": "",
            "hashed_password": hash_password(user_in.password) if user_in.password else "",
            "avatar": avatar,
            "bio": "Member of Pulse of Profit community.",
            "role": "user",
            "created_at": datetime.now()
        }
        if mongo_manager.is_connected and mongo_manager.db is not None:
            users_col = mongo_manager.db["users"]
            users_col.insert_one(user_doc)
        else:
            mongo_manager.in_memory_users.append(user_doc)
        found_user = user_doc
    elif user_in.password and found_user.get("hashed_password"):
        if not verify_password(user_in.password, found_user["hashed_password"]):
            raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": email})
    user_profile = Profile(
        email=found_user["email"],
        name=found_user.get("name") or email.split("@")[0].capitalize(),
        mob_no=found_user.get("mob_no", ""),
        avatar=found_user.get("avatar") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={email}",
        bio=found_user.get("bio", "Member of Pulse of Profit community.")
    )
    return AuthResponse(access_token=token, user=user_profile)


@app.get("/api/auth/me", response_model=Profile)
def get_me(user_email: str = Depends(require_current_user_email)):
    
    if mongo_manager.is_connected and mongo_manager.db is not None:
        users_col = mongo_manager.db["users"]
        found = users_col.find_one({"email": user_email})
        if found:
            return Profile(
                email=found["email"],
                name=found["name"],
                mob_no=found.get("mob_no", ""),
                avatar=found["avatar"],
                bio=found.get("bio", "Member of Pulse of Profit community.")
            )
    else:
        for u in mongo_manager.in_memory_users:
            if u["email"] == user_email:
                return Profile(
                    email=u["email"],
                    name=u["name"],
                    mob_no=u.get("mob_no", ""),
                    avatar=u["avatar"],
                    bio=u.get("bio", "Member of Pulse of Profit community.")
                )
    
    raise HTTPException(status_code=404, detail="User profile not found")

@app.post("/api/profile", response_model=Profile)
def update_profile(
    profile_data: ProfileUpdate, 
    user_email: str = Depends(require_current_user_email)
):
    if mongo_manager.is_connected and mongo_manager.db is not None:
        users_col = mongo_manager.db["users"]
        users_col.update_one(
            {"email": user_email},
            {"$set": {
                "name": profile_data.name, 
                "bio": profile_data.bio,
                "mob_no": profile_data.mob_no or ""
            }}
        )
        found = users_col.find_one({"email": user_email})
        if found:
            return Profile(
                email=found["email"],
                name=found["name"],
                mob_no=found.get("mob_no", ""),
                avatar=found["avatar"],
                bio=found.get("bio", "Member of Pulse of Profit community.")
            )
    else:
        for u in mongo_manager.in_memory_users:
            if u["email"] == user_email:
                u["name"] = profile_data.name
                u["bio"] = profile_data.bio
                if profile_data.mob_no:
                    u["mob_no"] = profile_data.mob_no
                return Profile(
                    email=u["email"],
                    name=u["name"],
                    mob_no=u.get("mob_no", ""),
                    avatar=u["avatar"],
                    bio=u.get("bio", "Member of Pulse of Profit community.")
                )
    
    raise HTTPException(status_code=404, detail="User profile not found")

# --- UPLOAD ENDPOINT ---

@app.post("/api/upload")
async def upload_photo(file: UploadFile = File(...), user_email: str = Depends(require_current_user_email)):
    try:
        return {"url": await store_uploaded_file(file)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload photo: {str(e)}")

async def store_multiple_uploads(files: List[UploadFile]) -> List[str]:
    try:
        uploaded_urls = []
        for file in files:
            uploaded_urls.append(await store_uploaded_file(file))
        return uploaded_urls
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload files: {str(e)}")

@app.post("/api/upload-multiple")
async def upload_multiple(files: List[UploadFile] = File(...), user_email: str = Depends(require_current_user_email)):
    return {"urls": await store_multiple_uploads(files)}

@app.post("/api/vyavasthapak/upload-multiple")
async def vyavasthapak_upload_multiple(files: List[UploadFile] = File(...), admin_user: str = Depends(verify_admin_token)):
    for file in files:
        content_type = (file.content_type or "").lower()
        if not is_image_upload(file) or content_type.startswith("video/") or (
            content_type and content_type != "application/octet-stream" and not content_type.startswith("image/")
        ):
            raise HTTPException(status_code=400, detail="Only image files can be uploaded to admin bulletins.")
    return {"urls": await store_multiple_uploads(files)}

# --- POSTS ENDPOINTS ---

def format_post_dict(doc: dict) -> dict:
    media_list = doc.get("mediaUrls", [])
    if not media_list and doc.get("imageUrl"):
        media_list = [doc.get("imageUrl")]
    comments = doc.get("comments") or []
        
    return {
        "id": str(doc.get("id", doc.get("_id"))),
        "title": doc.get("title", ""),
        "date": doc.get("date", ""),
        "author": doc.get("author", "ANONYMOUS"),
        "content": doc.get("content", ""),
        "likes": doc.get("likes", 0),
        "reposts": doc.get("reposts", 0),
        "comments_count": len(comments),
        "comments": comments,
        "imageUrl": doc.get("imageUrl"),
        "mediaUrls": media_list,
        "contentBlocks": doc.get("contentBlocks"),
        "isLiked": doc.get("isLiked", False),
        "isReposted": doc.get("isReposted", False)
    }

@app.get("/api/posts", response_model=List[Post])
def get_posts(sort: Optional[str] = "latest", user_email: str = Depends(require_current_user_email)):
    posts_list = []
    if mongo_manager.is_connected and mongo_manager.db is not None:
        posts_col = mongo_manager.db["posts"]
        cursor = posts_col.find().sort("_id", -1)
        posts_list = [format_post_dict(p) for p in cursor]
    else:
        posts_list = [format_post_dict(p) for p in reversed(mongo_manager.in_memory_posts)]

    if sort == "top":
        posts_list = sorted(posts_list, key=lambda x: x["likes"], reverse=True)
    return posts_list


@app.post("/api/posts", response_model=Post)
def create_post(post_in: PostCreate, user_email: str = Depends(require_current_user_email)):
    author_name = post_in.author or "ANONYMOUS USER"
    
    if user_email:
        if mongo_manager.is_connected and mongo_manager.db is not None:
            user = mongo_manager.db["users"].find_one({"email": user_email})
            if user:
                author_name = user.get("name", author_name)
        else:
            for u in mongo_manager.in_memory_users:
                if u["email"] == user_email:
                    author_name = u.get("name", author_name)

    now_str = datetime.now().strftime("%d %B %Y")
    post_id = str(uuid.uuid4().hex[:8])

    media_list = post_in.mediaUrls or []
    if not media_list and post_in.imageUrl:
        media_list = [post_in.imageUrl]

    post_doc = {
        "id": post_id,
        "title": post_in.title or "PULSE OF PROFIT BULLETIN 🗞️",
        "date": now_str,
        "author": author_name.upper(),
        "content": post_in.content,
        "likes": 0,
        "reposts": 0,
        "comments_count": 0,
        "comments": [],
        "imageUrl": post_in.imageUrl,
        "mediaUrls": media_list,
        "contentBlocks": post_in.contentBlocks,
        "isLiked": False,
        "isReposted": False,
        "created_at": datetime.now()
    }

    if mongo_manager.is_connected and mongo_manager.db is not None:
        mongo_manager.db["posts"].insert_one(post_doc)
    else:
        mongo_manager.in_memory_posts.append(post_doc)

    return format_post_dict(post_doc)


@app.get("/api/posts/{post_id}", response_model=Post)
def get_post(post_id: str, user_email: str = Depends(require_current_user_email)):
    if mongo_manager.is_connected and mongo_manager.db is not None:
        p = mongo_manager.db["posts"].find_one({"id": post_id})
        if p:
            return format_post_dict(p)
    else:
        for p in mongo_manager.in_memory_posts:
            if p["id"] == post_id:
                return format_post_dict(p)

    raise HTTPException(status_code=404, detail="Post not found")


@app.post("/api/posts/{post_id}/like", response_model=Post)
def like_post(post_id: str, user_email: str = Depends(require_current_user_email)):
    if mongo_manager.is_connected and mongo_manager.db is not None:
        posts_col = mongo_manager.db["posts"]
        p = posts_col.find_one({"id": post_id})
        if p:
            new_is_liked = not p.get("isLiked", False)
            new_likes = p.get("likes", 0) + (1 if new_is_liked else -1)
            if new_likes < 0:
                new_likes = 0
            posts_col.update_one(
                {"id": post_id},
                {"$set": {"isLiked": new_is_liked, "likes": new_likes}}
            )
            p["isLiked"] = new_is_liked
            p["likes"] = new_likes
            return format_post_dict(p)
    else:
        for p in mongo_manager.in_memory_posts:
            if p["id"] == post_id:
                p["isLiked"] = not p.get("isLiked", False)
                if p["isLiked"]:
                    p["likes"] += 1
                else:
                    p["likes"] = max(0, p["likes"] - 1)
                return format_post_dict(p)

    raise HTTPException(status_code=404, detail="Post not found")


@app.post("/api/posts/{post_id}/repost", response_model=Post)
def repost_post(post_id: str, user_email: str = Depends(require_current_user_email)):
    if mongo_manager.is_connected and mongo_manager.db is not None:
        posts_col = mongo_manager.db["posts"]
        p = posts_col.find_one({"id": post_id})
        if p:
            new_is_reposted = not p.get("isReposted", False)
            new_reposts = p.get("reposts", 0) + (1 if new_is_reposted else -1)
            if new_reposts < 0:
                new_reposts = 0
            posts_col.update_one(
                {"id": post_id},
                {"$set": {"isReposted": new_is_reposted, "reposts": new_reposts}}
            )
            p["isReposted"] = new_is_reposted
            p["reposts"] = new_reposts
            return format_post_dict(p)
    else:
        for p in mongo_manager.in_memory_posts:
            if p["id"] == post_id:
                p["isReposted"] = not p.get("isReposted", False)
                if p["isReposted"]:
                    p["reposts"] += 1
                else:
                    p["reposts"] = max(0, p["reposts"] - 1)
                return format_post_dict(p)

    raise HTTPException(status_code=404, detail="Post not found")


@app.post("/api/posts/{post_id}/comment", response_model=Post)
def add_comment(post_id: str, comment_in: CommentCreate, user_email: str = Depends(require_current_user_email)):
    new_comment = {
        "id": f"c_{uuid.uuid4().hex[:6]}",
        "author": comment_in.author,
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={comment_in.author}",
        "content": comment_in.content,
        "timestamp": "Just now"
    }

    if mongo_manager.is_connected and mongo_manager.db is not None:
        posts_col = mongo_manager.db["posts"]
        p = posts_col.find_one({"id": post_id})
        if p:
            comments = p.get("comments", [])
            comments.append(new_comment)
            posts_col.update_one(
                {"id": post_id},
                {"$set": {"comments": comments, "comments_count": len(comments)}}
            )
            p["comments"] = comments
            p["comments_count"] = len(comments)
            return format_post_dict(p)
    else:
        for p in mongo_manager.in_memory_posts:
            if p["id"] == post_id:
                p.setdefault("comments", []).append(new_comment)
                p["comments_count"] = len(p["comments"])
                return format_post_dict(p)

    raise HTTPException(status_code=404, detail="Post not found")

# --- PROFILE ENDPOINTS ---

@app.get("/api/profile", response_model=Profile)
def get_profile(user_email: str = Depends(require_current_user_email)):
    if user_email and mongo_manager.is_connected and mongo_manager.db is not None:
        u = mongo_manager.db["users"].find_one({"email": user_email})
        if u:
            return Profile(
                email=u["email"],
                name=u["name"],
                avatar=u["avatar"],
                bio=u.get("bio", "Member of Pulse of Profit community.")
            )

    return Profile(
        email="techkaran401@gmail.com",
        name="Karan",
        avatar="https://api.dicebear.com/7.x/bottts/svg?seed=Karan",
        bio="Interested in financial markets, business analysis, and global economy updates."
    )

@app.post("/api/profile", response_model=Profile)
def update_profile(profile_in: ProfileUpdate, user_email: str = Depends(require_current_user_email)):
    if user_email and mongo_manager.is_connected and mongo_manager.db is not None:
        mongo_manager.db["users"].update_one(
            {"email": user_email},
            {"$set": {"name": profile_in.name, "bio": profile_in.bio}}
        )
        u = mongo_manager.db["users"].find_one({"email": user_email})
        return Profile(
            email=u["email"],
            name=u["name"],
            avatar=u["avatar"],
            bio=u["bio"]
        )
    return Profile(
        email="techkaran401@gmail.com",
        name=profile_in.name,
        avatar="https://api.dicebear.com/7.x/bottts/svg?seed=Karan",
        bio=profile_in.bio
    )

# --- VYAVASTHAPAK (ADMIN) ENDPOINTS ---

@app.get("/api/vyavasthapak/has-admin")
def vyavasthapak_has_admin():
    if mongo_manager.is_connected and mongo_manager.db is not None:
        count = mongo_manager.db["users"].count_documents({"role": "admin"})
        return {"has_admin": count > 0}
    count = sum(1 for u in mongo_manager.in_memory_users if u.get("role") == "admin")
    return {"has_admin": count > 0}

@app.post("/api/vyavasthapak/register")
def vyavasthapak_register(admin_in: AdminRegister):
    email = admin_in.email.lower()
    hashed_pwd = hash_password(admin_in.passcode)
    avatar = f"https://api.dicebear.com/7.x/avataaars/svg?seed={admin_in.name}"
    
    admin_doc = {
        "email": email,
        "name": admin_in.name,
        "mob_no": admin_in.mob_no,
        "hashed_password": hashed_pwd,
        "avatar": avatar,
        "role": "admin",
        "is_blocked": False,
        "created_at": datetime.now()
    }

    if mongo_manager.is_connected and mongo_manager.db is not None:
        users_col = mongo_manager.db["users"]
        if users_col.find_one({"email": email}):
            raise HTTPException(status_code=400, detail="Admin with this email already exists")
        users_col.insert_one(admin_doc)
    else:
        for u in mongo_manager.in_memory_users:
            if u["email"] == email:
                raise HTTPException(status_code=400, detail="Admin with this email already exists")
        mongo_manager.in_memory_users.append(admin_doc)
        mongo_manager.in_memory_admins.append(admin_doc)

    token = create_access_token({"sub": email, "role": "admin"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "admin",
        "message": "Admin Registered Successfully"
    }

@app.post("/api/vyavasthapak/login")
def vyavasthapak_login(login_in: AdminLogin):
    found_admin = None
    
    if mongo_manager.is_connected and mongo_manager.db is not None:
        users_col = mongo_manager.db["users"]
        if login_in.email:
            found_admin = users_col.find_one({"email": login_in.email.lower(), "role": "admin"})
        else:
            found_admin = users_col.find_one({"role": "admin"})
    else:
        for u in mongo_manager.in_memory_users:
            if u.get("role") == "admin":
                if not login_in.email or u.get("email") == login_in.email.lower():
                    found_admin = u
                    break
                    
    if not found_admin or not verify_password(login_in.passcode, found_admin["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid admin credentials or passcode")

    ensure_user_not_blocked(found_admin["email"])
        
    token = create_access_token({"sub": found_admin["email"], "role": "admin"})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": "admin",
        "message": "Vyavasthapak Authentication Successful"
    }

@app.get("/api/vyavasthapak/stats")
def vyavasthapak_stats(admin_user: str = Depends(verify_admin_token)):
    posts_count = 0
    total_likes = 0
    total_comments = 0
    
    if mongo_manager.is_connected and mongo_manager.db is not None:
        posts_col = mongo_manager.db["posts"]
        posts_count = posts_col.count_documents({})
        users_col = mongo_manager.db["users"]
        users_count = users_col.count_documents({})
        for p in posts_col.find():
            total_likes += p.get("likes", 0)
            total_comments += len(p.get("comments") or [])
    else:
        posts_count = len(mongo_manager.in_memory_posts)
        users_count = len(mongo_manager.in_memory_users)
        for p in mongo_manager.in_memory_posts:
            total_likes += p.get("likes", 0)
            total_comments += len(p.get("comments") or [])
            
    reports_count = len(getattr(mongo_manager, "in_memory_reports", []))

    return {
        "total_posts": posts_count,
        "total_users": users_count,
        "total_likes": total_likes,
        "total_comments": total_comments,
        "pending_reports": reports_count,
        "system_status": "OPERATIONAL",
        "uptime": "99.98%",
        "db_connected": mongo_manager.is_connected
    }

@app.get("/api/vyavasthapak/posts")
def vyavasthapak_get_posts(admin_user: str = Depends(verify_admin_token)):
    if mongo_manager.is_connected and mongo_manager.db is not None:
        posts_col = mongo_manager.db["posts"]
        return [format_post_dict(p) for p in posts_col.find().sort("_id", -1)]
    return [format_post_dict(p) for p in reversed(mongo_manager.in_memory_posts)]

@app.post("/api/vyavasthapak/posts")
def vyavasthapak_create_post(post_in: PostCreate, admin_user: str = Depends(verify_admin_token)):
    author_name = post_in.author or "VYAVASTHAPAK ADMIN"
    now_str = datetime.now().strftime("%d %B %Y")
    post_id = str(uuid.uuid4().hex[:8])

    media_list = post_in.mediaUrls or []
    if not media_list and post_in.imageUrl:
        media_list = [post_in.imageUrl]

    post_doc = {
        "id": post_id,
        "title": post_in.title or "PULSE OF PROFIT BULLETIN 🗞️",
        "date": now_str,
        "author": author_name.upper(),
        "content": post_in.content,
        "likes": 0,
        "reposts": 0,
        "comments_count": 0,
        "comments": [],
        "imageUrl": post_in.imageUrl,
        "mediaUrls": media_list,
        "contentBlocks": post_in.contentBlocks,
        "isLiked": False,
        "isReposted": False,
        "created_at": datetime.now()
    }

    if mongo_manager.is_connected and mongo_manager.db is not None:
        mongo_manager.db["posts"].insert_one(post_doc)
    else:
        mongo_manager.in_memory_posts.insert(0, post_doc)

    return format_post_dict(post_doc)

@app.post("/api/vyavasthapak/posts/{post_id}/manual-likes")
def vyavasthapak_update_likes(post_id: str, likes_in: ManualLikesUpdate, admin_user: str = Depends(verify_admin_token)):
    if likes_in.likes < 0:
        raise HTTPException(status_code=400, detail="Likes count cannot be negative")

    if mongo_manager.is_connected and mongo_manager.db is not None:
        posts_col = mongo_manager.db["posts"]
        p = posts_col.find_one({"id": post_id})
        if not p:
            raise HTTPException(status_code=404, detail="Post not found")
        posts_col.update_one({"id": post_id}, {"$set": {"likes": likes_in.likes}})
        p["likes"] = likes_in.likes
        return format_post_dict(p)
    else:
        for p in mongo_manager.in_memory_posts:
            if p["id"] == post_id:
                p["likes"] = likes_in.likes
                return format_post_dict(p)

    raise HTTPException(status_code=404, detail="Post not found")

@app.post("/api/vyavasthapak/posts/{post_id}/manual-comments")
def vyavasthapak_add_comment(post_id: str, comment_in: ManualCommentCreate, admin_user: str = Depends(verify_admin_token)):
    avatar_url = comment_in.avatar or f"https://api.dicebear.com/7.x/avataaars/svg?seed={comment_in.author}"
    new_comment = {
        "id": f"c_{uuid.uuid4().hex[:6]}",
        "author": comment_in.author,
        "avatar": avatar_url,
        "content": comment_in.content,
        "timestamp": "Just now"
    }

    if mongo_manager.is_connected and mongo_manager.db is not None:
        posts_col = mongo_manager.db["posts"]
        p = posts_col.find_one({"id": post_id})
        if p:
            comments = p.get("comments", [])
            comments.append(new_comment)
            posts_col.update_one(
                {"id": post_id},
                {"$set": {"comments": comments, "comments_count": len(comments)}}
            )
            p["comments"] = comments
            p["comments_count"] = len(comments)
            return format_post_dict(p)
    else:
        for p in mongo_manager.in_memory_posts:
            if p["id"] == post_id:
                p.setdefault("comments", []).append(new_comment)
                p["comments_count"] = len(p["comments"])
                return format_post_dict(p)

    raise HTTPException(status_code=404, detail="Post not found")

@app.delete("/api/vyavasthapak/posts/{post_id}/comments/{comment_id}")
def vyavasthapak_delete_comment(post_id: str, comment_id: str, admin_user: str = Depends(verify_admin_token)):
    if mongo_manager.is_connected and mongo_manager.db is not None:
        posts_col = mongo_manager.db["posts"]
        p = posts_col.find_one({"id": post_id})
        if p:
            comments = [c for c in p.get("comments", []) if c.get("id") != comment_id]
            posts_col.update_one(
                {"id": post_id},
                {"$set": {"comments": comments, "comments_count": len(comments)}}
            )
            p["comments"] = comments
            p["comments_count"] = len(comments)
            return format_post_dict(p)
    else:
        for p in mongo_manager.in_memory_posts:
            if p["id"] == post_id:
                p["comments"] = [c for c in p.get("comments", []) if c.get("id") != comment_id]
                p["comments_count"] = len(p["comments"])
                return format_post_dict(p)

    raise HTTPException(status_code=404, detail="Post not found")

@app.delete("/api/vyavasthapak/posts/{post_id}")
def vyavasthapak_delete_post(post_id: str, admin_user: str = Depends(verify_admin_token)):
    found = False
    if mongo_manager.is_connected and mongo_manager.db is not None:
        res = mongo_manager.db["posts"].delete_one({"id": post_id})
        if res.deleted_count > 0:
            found = True
    else:
        for i, p in enumerate(mongo_manager.in_memory_posts):
            if p["id"] == post_id:
                mongo_manager.in_memory_posts.pop(i)
                found = True
                break

    if not found:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": f"Post {post_id} deleted successfully by Vyavasthapak"}

@app.get("/api/vyavasthapak/users")
def vyavasthapak_get_users(admin_user: str = Depends(verify_admin_token)):
    if mongo_manager.is_connected and mongo_manager.db is not None:
        users = list(mongo_manager.db["users"].find())
        clean_users = []
        for u in users:
            clean_users.append({
                "email": u["email"],
                "name": u["name"],
                "mob_no": u.get("mob_no", ""),
                "avatar": u.get("avatar", ""),
                "role": u.get("role", "user"),
                "is_blocked": u.get("is_blocked", False),
                "created_at": str(u.get("created_at", "2026-04-20"))
            })
        return clean_users

    clean_users = []
    for u in mongo_manager.in_memory_users:
        clean_users.append({
            "email": u["email"],
            "name": u["name"],
            "mob_no": u.get("mob_no", ""),
            "avatar": u.get("avatar", ""),
            "role": u.get("role", "user"),
            "is_blocked": u.get("is_blocked", False),
            "created_at": str(u.get("created_at", "2026-04-20"))
        })
    return clean_users

@app.post("/api/vyavasthapak/users/{email}/toggle-block")
def vyavasthapak_toggle_block_user(email: str, admin_user: str = Depends(verify_admin_token)):
    new_status = False
    if mongo_manager.is_connected and mongo_manager.db is not None:
        u = mongo_manager.db["users"].find_one({"email": email})
        if not u:
            raise HTTPException(status_code=404, detail="User not found")
        new_status = not u.get("is_blocked", False)
        mongo_manager.db["users"].update_one({"email": email}, {"$set": {"is_blocked": new_status}})
    else:
        found = False
        for u in mongo_manager.in_memory_users:
            if u["email"] == email:
                u["is_blocked"] = not u.get("is_blocked", False)
                new_status = u["is_blocked"]
                found = True
                break
        if not found:
            raise HTTPException(status_code=404, detail="User not found")

    return {"message": f"User {email} block status set to {new_status}", "is_blocked": new_status}

@app.delete("/api/vyavasthapak/users/{email}")
def vyavasthapak_delete_user(email: str, admin_user: str = Depends(verify_admin_token)):
    found = False
    if mongo_manager.is_connected and mongo_manager.db is not None:
        res = mongo_manager.db["users"].delete_one({"email": email})
        if res.deleted_count > 0:
            found = True
    else:
        for i, u in enumerate(mongo_manager.in_memory_users):
            if u["email"] == email:
                mongo_manager.in_memory_users.pop(i)
                found = True
                break

    if not found:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {email} deleted successfully"}

@app.get("/api/vyavasthapak/reports")
def vyavasthapak_get_reports(admin_user: str = Depends(verify_admin_token)):
    reports = getattr(mongo_manager, "in_memory_reports", [])
    return reports

@app.post("/api/vyavasthapak/reports/{report_id}/resolve")
def vyavasthapak_resolve_report(report_id: str, admin_user: str = Depends(verify_admin_token)):
    reports = getattr(mongo_manager, "in_memory_reports", [])
    for r in reports:
        if r["id"] == report_id:
            r["status"] = "resolved"
            return {"message": "Report resolved successfully", "report": r}
    return {"message": "Report updated"}

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host=host, port=port, reload=True)
