import time
import hashlib
import json
from functools import wraps
from typing import Any, Callable, Optional
from collections import OrderedDict

class TTLCache:
    def __init__(self, maxsize: int = 128, ttl: int = 300):
        self.maxsize = maxsize
        self.ttl = ttl
        self._cache: OrderedDict[str, tuple[float, Any]] = OrderedDict()

    def _key(self, *args, **kwargs) -> str:
        raw = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
        return hashlib.md5(raw.encode()).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            ts, val = self._cache[key]
            if time.time() - ts < self.ttl:
                self._cache.move_to_end(key)
                return val
            del self._cache[key]
        return None

    def set(self, key: str, value: Any):
        if key in self._cache:
            del self._cache[key]
        elif len(self._cache) >= self.maxsize:
            self._cache.popitem(last=False)
        self._cache[key] = (time.time(), value)

    def clear(self):
        self._cache.clear()

cache = TTLCache(maxsize=256, ttl=300)

def cached(ttl: int = 300):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            c = TTLCache(maxsize=64, ttl=ttl)
            key = c._key(func.__name__, args, kwargs)
            hit = c.get(key)
            if hit is not None:
                return hit
            result = await func(*args, **kwargs)
            c.set(key, result)
            return result
        return wrapper
    return decorator
