import os
import json
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Suppress oneDNN custom operations logs

import shutil
import sqlite3
import uvicorn
import io
import numpy as np
import librosa
import soundfile as sf
import tensorflow as tf
import speech_recognition as sr
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks, Form
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict
from fingerprint_engine import FingerprintEngine

app = FastAPI()

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "fingerprints.db"
TEMP_DIR = "temp_uploads"
DATASET_DIR = "Dataset"
MODEL_PATH = os.path.join(DATASET_DIR, 'hybrid_audio_text_model_v6.keras')

# Audio Processing Constants
SAMPLE_RATE = 22050
DURATION_SECONDS = 15
N_MELS = 128
FIXED_LENGTH = SAMPLE_RATE * DURATION_SECONDS

if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)

# Initialize Engines
print("Initializing Fingerprint Engine...")
fingerprint_engine = FingerprintEngine()

print(f"Loading Hybrid AI Model from {MODEL_PATH}...")
try:
    hybrid_model = tf.keras.models.load_model(MODEL_PATH)
    print("Hybrid AI Model loaded successfully!")
except Exception as e:
    print(f"WARNING: Failed to load Hybrid AI Model: {e}")
    hybrid_model = None

FILE_SCAM_MAP = {}

def load_scam_types():
    """Scans the Dataset directory to map filenames to scam types, or loads from JSON."""
    global FILE_SCAM_MAP
    print("Loading scam types...")
    
    mapping_file = 'scam_mapping.json'
    if os.path.exists(mapping_file):
        try:
            with open(mapping_file, 'r') as f:
                FILE_SCAM_MAP.update(json.load(f))
            print(f"Loaded {len(FILE_SCAM_MAP)} file-to-scam mappings from {mapping_file}.")
            return
        except Exception as e:
            print(f"Error loading {mapping_file}: {e}")

    count = 0
    if os.path.exists(DATASET_DIR):
        for root, dirs, files in os.walk(DATASET_DIR):
            folder_name = os.path.basename(root)
            if folder_name == "Dataset": continue
            
            for file in files:
                if file.lower().endswith(('.mp3', '.wav')):
                    FILE_SCAM_MAP[file] = folder_name
                    count += 1
    print(f"Loaded {count} file-to-scam mappings via directory scan.")

# Load scam types on startup
load_scam_types()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# --- Hybrid Model Helper Functions ---

def preprocess_audio(audio_path):
    """Preprocesses audio for the Hybrid Model (Mel-spectrogram)."""
    try:
        y, native_sr = sf.read(audio_path)
        
        if y.ndim > 1:
            y = np.mean(y, axis=1)
            
        if native_sr != SAMPLE_RATE:
            y = librosa.resample(y, orig_sr=native_sr, target_sr=SAMPLE_RATE)
            
        max_len = SAMPLE_RATE * DURATION_SECONDS
        if len(y) > max_len:
             y = y[:max_len]
             
        y = librosa.util.normalize(y)

        if len(y) < FIXED_LENGTH:
            y = np.pad(y, (0, int(FIXED_LENGTH - len(y))), mode='constant')
        else:
            y = y[:int(FIXED_LENGTH)]

        spectrogram = librosa.feature.melspectrogram(y=y, sr=SAMPLE_RATE, n_mels=N_MELS)
        
        max_val = np.max(spectrogram)
        if max_val == 0: max_val = 1e-9
        log_spectrogram = librosa.power_to_db(spectrogram, ref=max_val)

        # Reshape for model input (batch_size, height, width, channels)
        result = np.expand_dims(np.expand_dims(log_spectrogram, axis=-1), axis=0)
        return result
    except Exception as e:
        print(f"Error in preprocess_audio: {e}")
        return None

def transcribe_audio(audio_path):
    """Transcribes audio using Google Speech Recognition."""
    recognizer = sr.Recognizer()
    try:
        y, sr_native = sf.read(audio_path)
        # Convert to WAV in memory for SpeechRecognition
        wav_io = io.BytesIO()
        sf.write(wav_io, y, sr_native, format='WAV')
        wav_io.seek(0)
        
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
            return text
    except Exception as e:
        print(f"Transcription error: {e}")
        import traceback
        traceback.print_exc()
        return ""

@app.post("/predict")
async def predict(
    file: UploadFile = File(...),
    mode: str = Form("auto"),
    manual_transcript: str = Form(None)
):
    temp_file_path = os.path.join(TEMP_DIR, file.filename)
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        results = {}
        
        # --- STAGE 1: FINGERPRINT CHECK ---
        if mode in ["auto", "fingerprint"]:
            print("Stage 1: Running Fingerprint Analysis...")
            hashes = fingerprint_engine.fingerprint_file(temp_file_path)
            
            match_ratio = 0.0
            scam_type = "Unknown"
            fingerprint_confidence = 0.0
            best_match_file = None
            
            if hashes:
                conn = get_db_connection()
                cursor = conn.cursor()
                query_hashes = [h[0] for h in hashes]
                chunk_size = 500
                matches = defaultdict(int)
                
                for i in range(0, len(query_hashes), chunk_size):
                    chunk = query_hashes[i:i+chunk_size]
                    placeholders = ','.join(['?'] * len(chunk))
                    sql = f"SELECT file_name FROM fingerprints WHERE hash IN ({placeholders})"
                    cursor.execute(sql, chunk)
                    rows = cursor.fetchall()
                    for row in rows:
                        matches[row['file_name']] += 1
                conn.close()

                if matches:
                     best_match_file = max(matches, key=matches.get)
                     match_count = matches[best_match_file]
                     total_input_hashes = len(hashes)
                     match_ratio = match_count / total_input_hashes if total_input_hashes > 0 else 0
                     
                     # Dynamic Threshold
                     THRESHOLD_RATIO = 0.20
                     fingerprint_confidence = min(match_ratio / THRESHOLD_RATIO, 1.0)
                     
                     if match_ratio >= THRESHOLD_RATIO:
                         scam_type = FILE_SCAM_MAP.get(best_match_file, "Unknown Scam")
                         results["fingerprint"] = {
                            "label": "KNOWN_FRAUD",
                            "confidence": fingerprint_confidence,
                            "scam_type": scam_type,
                            "match_ratio": match_ratio,
                            "best_match": best_match_file,
                            "details": f"Fingerprint Match ({match_ratio:.1%}) with {best_match_file}"
                        }
                         # If mode is auto, we can return early if we found a strong match
                         if mode == "auto":
                             return results["fingerprint"]

            if "fingerprint" not in results and mode == "fingerprint":
                 return {
                    "label": "LEGIT", 
                    "confidence": 0.0, 
                    "details": "No significant fingerprint match found.",
                    "match_ratio": match_ratio,
                    "best_match": best_match_file
                }


        # --- STAGE 2: HYBRID AI MODEL ---
        if mode in ["auto", "hybrid"]:
            # If auto mode and we already found a fraud in stage 1, we might skip this 
            # (matches original logic, but user might want 'Deep Scan' to always run if requested)
            if mode == "auto" and "fingerprint" in results:
                 pass # Already returned above
            
            print("Stage 2: Running Hybrid AI Analysis...")
            if hybrid_model:
                # Use manual transcript if provided, otherwise transcribe
                if manual_transcript:
                    print("Using Manual Transcript")
                    transcript = manual_transcript
                else:
                    print("Generating Transcript...")
                    transcript = transcribe_audio(temp_file_path)
                
                if not transcript: transcript = "" 
                
                # Preprocess Audio
                audio_input = preprocess_audio(temp_file_path)
                
                if audio_input is not None:
                    text_input = tf.constant([transcript])
                    prediction = hybrid_model.predict([audio_input, text_input])
                    ai_score = float(prediction[0][0])
                    
                    print(f"Hybrid Model Score: {ai_score}")
                    
                    hybrid_result = {
                        "confidence": ai_score,
                        "transcript": transcript,
                        "model_version": "v7", # Assuming v7 based on code
                        "details": f"AI Score: {ai_score:.4f}"
                    }

                    if ai_score > 0.5:
                         hybrid_result.update({
                            "label": "SUSPECTED_FRAUD",
                            "scam_type": "AI Detected Pattern",
                        })
                    else:
                        hybrid_result.update({
                            "label": "LEGIT",
                        })
                    
                    if mode == "hybrid":
                        return hybrid_result
                    
                    # For auto mode, if we are here, it means stage 1 failed or didn't find fraud
                    return hybrid_result

                else:
                     return {"label": "LEGIT", "confidence": 0.0, "details": "Audio preprocessing failed for AI model."}
            else:
                 return {"label": "LEGIT", "confidence": 0.0, "details": "Hybrid Model not loaded."}
                 
        return results.get("fingerprint", {"label": "ERROR", "details": "No result computed"})

    except Exception as e:
        print(f"Error processing file: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
             try:
                os.remove(temp_file_path)
             except: pass

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
