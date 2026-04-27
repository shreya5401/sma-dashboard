import os
import base64

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

security = HTTPBearer(auto_error=False)

_jwks_cache: dict | None = None


def _get_jwks_url() -> str:
    pub_key = os.environ.get("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "")
    try:
        # Publishable key format: pk_test_<base64(domain)>$ or pk_live_<base64(domain)>$
        key_part = pub_key.split("_", 2)[2]
        padding = (4 - len(key_part) % 4) % 4
        domain = base64.b64decode(key_part + "=" * padding).decode().rstrip("$")
        return f"https://{domain}/.well-known/jwks.json"
    except Exception:
        return os.environ.get("CLERK_JWKS_URL", "")


def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        url = _get_jwks_url()
        if not url:
            raise HTTPException(status_code=500, detail="Clerk JWKS URL not configured")
        try:
            resp = httpx.get(url, timeout=10.0)
            resp.raise_for_status()
            _jwks_cache = resp.json()
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=500, detail=f"Failed to fetch Clerk JWKS: {exc}")
    return _jwks_cache


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    token = credentials.credentials
    try:
        jwks = _get_jwks()
        kid = jwt.get_unverified_header(token).get("kid")
        key = next((k for k in jwks.get("keys", []) if k.get("kid") == kid), None)
        if not key:
            raise HTTPException(status_code=401, detail="Unknown signing key")
        payload = jwt.decode(token, key, algorithms=["RS256"], options={"verify_aud": False})
        return payload
    except JWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}")
