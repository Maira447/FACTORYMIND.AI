import asyncio
from backend.services.supabase_client import supabase_service

async def test_supabase():
    url = supabase_service.client.supabase_url
    print(f"Supabase Client URL: {url}")

if __name__ == "__main__":
    asyncio.run(test_supabase())
