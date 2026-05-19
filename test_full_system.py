import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_step(name, func):
    print(f"--- Testing {name} ---")
    try:
        func()
        print("✅ Success\n")
    except Exception as e:
        print(f"❌ Failed: {e}\n")

def check_health():
    resp = requests.get("http://127.0.0.1:8000/health")
    print(f"Health: {resp.json()}")
    assert resp.status_code == 200

def test_ml_inference():
    payload = {
        "readings": [
            {
                "Type": "L",
                "Air temperature [K]": 305.0,
                "Process temperature [K]": 315.0,
                "Rotational speed [rpm]": 2800,
                "Torque [Nm]": 75.0,
                "Tool wear [min]": 210,
                "Product ID": "X-9000"
            }
        ]
    }
    resp = requests.post(f"{BASE_URL}/ml/predict/maintenance", json=payload)
    if resp.status_code != 200:
        print(f"Error Response: {resp.text}")
    data = resp.json()
    print(f"Prediction for X-9000: {json.dumps(data['predictions'][0], indent=2)}")
    assert resp.status_code == 200
    assert "risk_score" in data["predictions"][0]

def test_critical_failure():
    payload = {
        "readings": [
            {
                "Type": "L",
                "Air temperature [K]": 305.0,
                "Process temperature [K]": 316.0,
                "Rotational speed [rpm]": 1400,
                "Torque [Nm]": 78.0,
                "Tool wear [min]": 240,
                "Product ID": "FAIL-99"
            }
        ]
    }
    resp = requests.post(f"{BASE_URL}/ml/predict/maintenance", json=payload)
    data = resp.json()
    print(f"Prediction for FAIL-99 (Expected High Risk):")
    print(json.dumps(data['predictions'][0], indent=2))
    assert data["predictions"][0]["risk_score"] > 80

def test_model_parameters():
    resp = requests.get(f"{BASE_URL}/ml/parameters")
    data = resp.json()
    print("--- 1. Feature Importances (%) ---")
    print(json.dumps(data['feature_importances_percent'], indent=2))
    
    print("\n--- 2. Scaler Baselines (Means) ---")
    print(data['scaler_baseline']['means'])
    assert resp.status_code == 200

def test_scenarios_auth():
    # Testing unauthorized access
    resp = requests.get(f"{BASE_URL}/scenarios/")
    print(f"Auth check (expected 401): {resp.status_code}")
    assert resp.status_code == 401

if __name__ == "__main__":
    print("🚀 Starting SmartFactory AI Full System Test\n")
    test_step("System Health", check_health)
    test_step("ML Inference Pipeline (Normal)", test_ml_inference)
    test_step("ML Inference Pipeline (CRITICAL FAILURE)", test_critical_failure)
    test_step("Trained Parameter Analysis", test_model_parameters)
    test_step("Security/Auth Layer", test_scenarios_auth)
    print("🏁 Testing Complete.")

