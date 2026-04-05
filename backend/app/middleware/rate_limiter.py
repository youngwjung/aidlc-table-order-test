from datetime import datetime, timezone

from fastapi import HTTPException

_login_attempts: dict[str, list[datetime]] = {}

MAX_ATTEMPTS = 3
WINDOW_SECONDS = 60


def check_rate_limit(key: str) -> None:
    now = datetime.now(timezone.utc)
    attempts = _login_attempts.get(key, [])
    recent = [a for a in attempts if (now - a).total_seconds() < WINDOW_SECONDS]
    _login_attempts[key] = recent
    if len(recent) >= MAX_ATTEMPTS:
        raise HTTPException(429, detail="잠시 후 다시 시도해 주세요")


def record_failed_attempt(key: str) -> None:
    _login_attempts.setdefault(key, []).append(datetime.now(timezone.utc))


def clear_attempts(key: str) -> None:
    _login_attempts.pop(key, None)
