import joblib
import pandas as pd
from pathlib import Path
from smartfactory_ai.backend.ml.model_registry import load_model

def check_parameters():
    print("--- SmartFactory AI: Trained Model Parameters ---\n")
    
    # Load the trained predictor
    predictor = load_model("maintenance_predictor")
    
    if predictor is None or predictor.scaler is None:
        print("❌ Model not found or not trained. Please start the server first.")
        return

    # 1. Feature Importances (What the AI looks for)
    importances = predictor.binary_model.feature_importances_
    feature_names = predictor.feature_names
    
    importance_df = pd.DataFrame({
        'Feature': feature_names,
        'Importance (%)': [round(i * 100, 2) for i in importances]
    }).sort_values(by='Importance (%)', ascending=False)

    print("--- 1. Feature Importances (Ranking) ---")
    print(importance_df.to_string(index=False))
    print("\n")

    # 2. Scaler Statistics (What is 'Normal')
    # The scaler stores mean_ and scale_ (standard deviation)
    # numeric_features order in feature_engineering.py:
    # 0: Air temp, 1: Process temp, 2: RPM, 3: Torque, 4: Tool wear, 
    # 5: temp_delta, 6: power_proxy, 7: tool_wear_factor
    
    numeric_labels = [
        "Air temperature [K]", "Process temperature [K]", 
        "Rotational speed [rpm]", "Torque [Nm]", "Tool wear [min]",
        "Temperature Delta", "Power Proxy", "Tool Wear Factor"
    ]
    
    stats_df = pd.DataFrame({
        'Parameter': numeric_labels,
        'Average (Mean)': [round(m, 2) for m in predictor.scaler.mean_],
        'Variation (Std Dev)': [round(s, 2) for s in predictor.scaler.scale_]
    })

    print("--- 2. Scaler Baseline (Normal Ranges) ---")
    print(stats_df.to_string(index=False))
    print("\n")

if __name__ == "__main__":
    check_parameters()
