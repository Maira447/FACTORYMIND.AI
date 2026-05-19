import os
import json
import traceback
from google import genai
from dotenv import load_dotenv

# Load .env relative to workspace
current_dir = os.path.dirname(os.path.abspath(__file__))
# current_dir is e:\testingg\smartfactory-ai\scratch
workspace_dir = os.path.dirname(current_dir)
# workspace_dir is e:\testingg\smartfactory-ai
backend_dir = os.path.join(workspace_dir, "backend")
# backend_dir is e:\testingg\smartfactory-ai\backend

env_path = os.path.join(backend_dir, ".env")
print("Loading dotenv from:", env_path)
load_dotenv(env_path, override=True)

# Resolve GOOGLE_APPLICATION_CREDENTIALS
creds_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if creds_path:
    resolved_creds = os.path.abspath(os.path.join(backend_dir, creds_path))
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = resolved_creds
    print("Resolved credentials to:", resolved_creds)

print("Project ID:", os.getenv("GOOGLE_PROJECT_ID"))

try:
    client = genai.Client(vertexai=True, project=os.getenv("GOOGLE_PROJECT_ID"), location="us-central1")
    print("Initialized Vertex Client. Sending query...")
    res = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Hello, respond with a short sentence."
    )
    print("Vertex AI Response:", res.text)
except Exception as e:
    print("Error:")
    traceback.print_exc()
