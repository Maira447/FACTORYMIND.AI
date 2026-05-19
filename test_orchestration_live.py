import requests
import time
import json
import io
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000/api/v1"
HEADERS = {"Authorization": "Bearer test-token"}

def run_live_orchestration_test():
    print("Starting Live Multi-Agent Orchestration Test\n")

    # 1. Create a Scenario
    scenario_name = f"Test Crisis {datetime.now().strftime('%H:%M:%S')}"
    scenario_resp = requests.post(f"{BASE_URL}/scenarios/", json={
        "name": scenario_name,
        "description": "A complex scenario with machine health risks and supply chain conflicts."
    }, headers=HEADERS)
    
    if scenario_resp.status_code != 200:
        print(f"[FAILED] Failed to create scenario: {scenario_resp.text}")
        return
    
    scenario_id = scenario_resp.json()["id"]
    print(f"[SUCCESS] Created Scenario: {scenario_name} (ID: {scenario_id})")

    # 2. Inject Mixed Data
    print("Injecting demo data into Supabase...")
    
    # Sensor Data (CSV)
    csv_content = (
        "UDI,Product ID,Type,Air temperature [K],Process temperature [K],Rotational speed [rpm],Torque [Nm],Tool wear [min],Target\n"
        "1,M-CRISIS-1,L,305.0,315.0,2800,75.0,210,1"
    )
    files = {'file': ('sensor_data.csv', io.BytesIO(csv_content.encode('utf-8')), 'text/csv')}
    requests.post(f"{BASE_URL}/scenarios/{scenario_id}/ingest/sensor", files=files, headers=HEADERS)

    # Operator Note
    requests.post(f"{BASE_URL}/scenarios/{scenario_id}/ingest/text", json={
        "type": "operator_note",
        "content": "Machine M-CRISIS-1 is making an unusual high-pitched whining sound."
    }, headers=HEADERS)

    # Supplier Email
    requests.post(f"{BASE_URL}/scenarios/{scenario_id}/ingest/text", json={
        "type": "supplier_email",
        "content": "Subject: Shipment Delay. Our bearing supply is stuck. Delay: 5 days."
    }, headers=HEADERS)

    # 3. Trigger Analysis
    print("\nTriggering Gemini Multi-Agent Analysis...")
    analyze_resp = requests.post(f"{BASE_URL}/scenarios/{scenario_id}/analyze", headers=HEADERS)
    
    if analyze_resp.status_code != 200:
        print(f"[FAILED] Failed to trigger analysis: {analyze_resp.text}")
        return

    print("Analysis started. Polling for results...")

    # 4. Poll for Completion
    max_attempts = 30
    for i in range(max_attempts):
        time.sleep(5)
        status_resp = requests.get(f"{BASE_URL}/scenarios/", headers=HEADERS)
        data = status_resp.json()
        status = data.get("status") if isinstance(data, dict) else "unknown"
        
        # If the status route returns a list, find the scenario
        if isinstance(data, list):
            match = next((s for s in data if s['id'] == scenario_id), None)
            status = match['status'] if match else "unknown"

        print(f"   [{i+1}/{max_attempts}] Current Status: {status}")
        
        if status == "complete":
            print("\n[SUCCESS] ANALYSIS COMPLETE!")
            # Fetch results from the new endpoint
            results_resp = requests.get(f"{BASE_URL}/scenarios/{scenario_id}/results", headers=HEADERS)
            print("\n--- FINAL AI INSIGHTS ---")
            print(json.dumps(results_resp.json(), indent=2))
            break
        elif status == "error":
            print("[FAILED] Analysis failed. Check backend logs.")
            break
    else:
        print("[TIMEOUT] Timeout reached.")

if __name__ == "__main__":
    run_live_orchestration_test()
