import asyncio
from backend.agents.gemini_client import GeminiClient

async def test_gemini():
    client = GeminiClient()
    try:
        res = await client.generate_json('{"test": "respond with valid JSON"}')
        print("Success:", res)
    except Exception as e:
        print("Error:", repr(e))

if __name__ == "__main__":
    asyncio.run(test_gemini())
