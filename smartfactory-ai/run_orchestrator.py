import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from backend.agents.orchestrator import AntigravityOrchestrator

async def main():
    # Use a placeholder scenario ID. Ensure the scenario exists in Supabase or will be created manually.
    scenario_id = os.getenv("TEST_SCENARIO_ID", "test-scenario")
    orchestrator = AntigravityOrchestrator()
    try:
        result = await orchestrator.run_full_pipeline(scenario_id)
        print("Orchestration completed successfully:")
        print(result)
    except Exception as e:
        print("Orchestration failed:", e)

if __name__ == "__main__":
    asyncio.run(main())
