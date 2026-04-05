from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request

from app.config import JWT_SECRET_KEY, JWT_ALGORITHM, JWT_EXPIRE_HOURS


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(payload: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS)
    to_encode = {**payload, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, detail="토큰이 만료되었습니다")
    except jwt.InvalidTokenError:
        raise HTTPException(401, detail="유효하지 않은 토큰입니다")


def _extract_token(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(401, detail="인증 토큰이 필요합니다")
    return auth_header[7:]


async def get_current_user(request: Request) -> dict:
    token = _extract_token(request)
    payload = decode_access_token(token)
    store_id_param = request.path_params.get("store_id")
    if store_id_param is not None and int(store_id_param) != payload.get("store_id"):
        raise HTTPException(403, detail="접근 권한이 없습니다")
    return payload


def require_role(role: str):
    async def _check(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") != role:
            raise HTTPException(403, detail="접근 권한이 없습니다")
        return user
    return _check
