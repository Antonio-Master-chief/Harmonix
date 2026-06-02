"""
JWT authentication via Supabase.

Supabase signs its JWTs with your project's JWT secret
(Project Settings → API → JWT Secret).

Admin routes use a separate ADMIN_API_KEY header — simpler than
role-based JWT claims for a small project.
"""

import os
from fastapi import Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import Optional

_bearer = HTTPBearer(auto_error=False)


def _jwt_secret() -> str:
    s = os.environ.get("SUPABASE_JWT_SECRET")
    if not s:
        raise RuntimeError("SUPABASE_JWT_SECRET not set")
    return s


def verify_jwt(token: str) -> dict:
    """Decode and validate a Supabase JWT. Returns the payload."""
    try:
        payload = jwt.decode(
            token,
            _jwt_secret(),
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")


async def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> dict:
    """FastAPI dependency — blocks unauthenticated requests."""
    if not credentials:
        raise HTTPException(401, "Authorization header required")
    return verify_jwt(credentials.credentials)


async def optional_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
) -> Optional[dict]:
    """FastAPI dependency — returns payload or None if no token."""
    if not credentials:
        return None
    try:
        return verify_jwt(credentials.credentials)
    except HTTPException:
        return None


async def require_admin(x_admin_key: Optional[str] = Header(default=None)) -> None:
    """FastAPI dependency — blocks non-admin requests on library management routes."""
    expected = os.environ.get("ADMIN_API_KEY")
    if not expected:
        raise RuntimeError("ADMIN_API_KEY not set in environment")
    if x_admin_key != expected:
        raise HTTPException(403, "Admin access required")
