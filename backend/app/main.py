from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.auth import create_access_token
from app.config import settings
from app.routers import projects
from app.schemas import LoginRequest, Token

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        #"http://localhost:5173",
        "https://m-suleman.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)


@app.post("/api/auth/login", response_model=Token, tags=["Auth"])
async def login(credentials: LoginRequest):
    if (
        credentials.username != settings.admin_username
        or credentials.password != settings.admin_password
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return Token(access_token=create_access_token(subject=credentials.username))
