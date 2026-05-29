import os
from supabase import create_client, Client
from functools import lru_cache

@lru_cache(maxsize=1)
def get_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_SERVICE_KEY"]   # service role — needed for library writes
    return create_client(url, key)


@lru_cache(maxsize=1)
def get_anon_client() -> Client:
    """Anon client for user-facing reads (respects RLS)."""
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_ANON_KEY"]
    return create_client(url, key)
