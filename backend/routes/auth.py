from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from auth import (
    verify_password, create_token, get_user_by_username, current_user
)
from fastapi import Depends

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest):
    user = get_user_by_username(body.username)
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants incorrects")
    token = create_token(user["id"])
    return TokenResponse(access_token=token, username=user["username"])


@router.get("/me")
def me(user: dict = Depends(current_user)):
    return {"id": user["id"], "username": user["username"]}
