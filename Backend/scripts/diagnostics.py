import argparse
import os
import sys
import time
import random
import requests
import numpy as np
from collections import defaultdict

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from fingerprint_engine import FingerprintEngine
except ImportError:
    pass # Will fail in 'test-engine' checked later

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_DIR = os.path.join(BASE_DIR, 'Dataset')
BASE_URL = "http://localhost:8002"

# --- ENGINE TEST ---
def test_engine(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print(f"Testing engine on: {file_path}")
    try:
        from fingerprint_engine import FingerprintEngine
        engine = FingerprintEngine()
    except ImportError:
         print("Error: Could not import fingerprint_engine. Make sure you're in the right directory.")
         return

    # 1. Load Audio
    y = engine.load_audio(file_path)
    if len(y) == 0:
        print("Audio load failed.")
        return
    print(f"Audio loaded. Shape: {y.shape}, Min: {np.min(y)}, Max: {np.max(y)}")

    # 2. Spectrogram
    S = engine._get_spectrogram(y)
    print(f"Spectrogram shape: {S.shape}")
    print(f"Spectrogram stats: Min={np.min(S)}, Max={np.max(S)}, Mean={np.mean(S)}")

    # 3. Peaks
    peaks = engine._find_peaks(S)
    print(f"Found {len(peaks)} peaks.")
    if len(peaks) > 0:
        print(f"First 5 peaks: {peaks[:5]}")

    # 4. Hashes
    hashes = engine._generate_hashes(peaks)
    print(f"Generated {len(hashes)} hashes.")
    if len(hashes) > 0:
        print(f"First 5 hashes: {hashes[:5]}")

# --- API TEST ---
def test_api(file_path):
    print(f"Testing API with file: {file_path}")
    url = f"{BASE_URL}/predict"
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'audio/mpeg')}
            response = requests.post(url, files=files)
            
        print(f"Status Code: {response.status_code}")
        print("Response JSON:")
        print(response.json())
        
    except Exception as e:
        print(f"Error: {e}")

# --- ACCURACY TEST ---
def get_files(folder_name, limit=50):
    folder_path = os.path.join(DATASET_DIR, folder_name)
    if not os.path.exists(folder_path):
        print(f"Warning: Folder {folder_name} not found.")
        return []
    
    files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.lower().endswith('.mp3')]
    if len(files) > limit:
        return random.sample(files, limit)
    return files

def test_file_api(file_path):
    """Helper for accuracy test"""
    url = f"{BASE_URL}/predict"
    try:
        with open(file_path, 'rb') as f:
            files = {'file': (os.path.basename(file_path), f, 'audio/mpeg')}
            response = requests.post(url, files=files, timeout=60)
            
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        print(f"Exception testing {file_path}: {e}")
        return None

def test_accuracy(limit=20):
    print("Selecting test samples...")
    # Fraud samples (Positive Class)
    fraud_files = get_files('Banking_Fraud', limit=limit) 
    # Legit samples (Negative Class)
    legit_files = get_files('Legit_Call', limit=limit)
    
    results = {"TP": 0, "FN": 0, "TN": 0, "FP": 0}

    print(f"\nTesting {len(fraud_files)} Fraud files...")
    for f in fraud_files:
        res = test_file_api(f)
        if res and res.get('label') == 'KNOWN_FRAUD':
            results["TP"] += 1
            print(f"[TP] {os.path.basename(f)} -> DETECTED")
        else:
            results["FN"] += 1
            print(f"[FN] {os.path.basename(f)} -> MISSED")

    print(f"\nTesting {len(legit_files)} Legit files...")
    for f in legit_files:
        res = test_file_api(f)
        if res and res.get('label') == 'KNOWN_FRAUD':
            results["FP"] += 1
            print(f"[FP] {os.path.basename(f)} -> FALSE ALARM")
        else:
            results["TN"] += 1
            print(f"[TN] {os.path.basename(f)} -> CORRECTLY IGNORED")

    # Metrics
    total_fraud = len(fraud_files)
    total_legit = len(legit_files)
    total = total_fraud + total_legit
    
    accuracy = (results["TP"] + results["TN"]) / total if total > 0 else 0
    precision = results["TP"] / (results["TP"] + results["FP"]) if (results["TP"] + results["FP"]) > 0 else 0
    recall = results["TP"] / (results["TP"] + results["FN"]) if (results["TP"] + results["FN"]) > 0 else 0

    report = f"""
    ========================================
    ACCURACY REPORT - Audio Fingerprinting
    ========================================
    Test Set Size: {total} ({total_fraud} Fraud, {total_legit} Legit)
    
    True Positives (TP): {results['TP']}
    False Negatives (FN): {results['FN']}
    True Negatives (TN): {results['TN']}
    False Positives (FP): {results['FP']}
    
    Accuracy:  {accuracy:.2%}
    Precision: {precision:.2%}
    Recall:    {recall:.2%}
    ========================================
    """
    print(report)
    with open("accuracy_report.txt", "w") as f:
        f.write(report)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Diagnostics tool for Nemo.")
    
    # Create subparsers
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Engine Test
    parser_engine = subparsers.add_parser("test-engine", help="Test fingerprint engine on a file")
    parser_engine.add_argument("file", help="Path to audio file")

    # API Test
    parser_api = subparsers.add_parser("test-api", help="Test API with a single file")
    parser_api.add_argument("file", help="Path to audio file")

    # Accuracy Test
    parser_acc = subparsers.add_parser("accuracy", help="Run batch accuracy test")
    parser_acc.add_argument("--limit", type=int, default=20, help="Number of files per category")

    args = parser.parse_args()

    if args.command == "test-engine":
        test_engine(args.file)
    elif args.command == "test-api":
        test_api(args.file)
    elif args.command == "accuracy":
        test_accuracy(limit=args.limit)
    else:
        parser.print_help()
