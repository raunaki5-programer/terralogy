from supabase import create_client, Client
from app.config import settings
from typing import Optional

_supabase: Optional[Client] = None
_supabase_admin: Optional[Client] = None

def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _supabase

def get_supabase_admin() -> Client:
    global _supabase_admin
    if _supabase_admin is None:
        _supabase_admin = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _supabase_admin
