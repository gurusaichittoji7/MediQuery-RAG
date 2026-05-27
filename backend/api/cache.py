import hashlib
import json
import time
from typing import Optional

# In-memory cache — resets on server restart
# For production, swap with Redis
_cache: dict = {}
CACHE_TTL_SECONDS = 3600  # 1 hour


def _make_key(question: str) -> str:
    return hashlib.md5(question.strip().lower().encode()).hexdigest()


def get_cached(question: str) -> Optional[dict]:
    key = _make_key(question)
    entry = _cache.get(key)
    if not entry:
        return None
    if time.time() - entry["cached_at"] > CACHE_TTL_SECONDS:
        del _cache[key]
        return None
    return entry["result"]


def set_cache(question: str, result: dict):
    key = _make_key(question)
    _cache[key] = {
        "cached_at": time.time(),
        "result": result,
    }

def cache_stats() -> dict:
    return {
        "cached_queries": len(_cache),
        "ttl_seconds": CACHE_TTL_SECONDS,
    }