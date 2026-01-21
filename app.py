# -*- coding: utf-8 -*-
"""
FastAPI Backend for CDR Fraud Detection System
"""

import os
# Suppress TensorFlow oneDNN warnings
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
import numpy as np
import librosa
import soundfile as sf
import tensorflow as tf
import speech_recognition as sr
import io

# Initialize FastAPI app
app = FastAPI(title="CDR Fraud Detection API", version="1.0")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, 'Dataset')
MODEL_PATH = os.path.join(DATASET_DIR, 'hybrid_audio_text_model_v6.keras')

SAMPLE_RATE = 22050
DURATION_SECONDS = 15
N_MELS = 128
FIXED_LENGTH = SAMPLE_RATE * DURATION_SECONDS

# Load Model
print(f"Loading model from: {MODEL_PATH}")
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully! ✅")
except Exception as e:
    print(f"CRITICAL ERROR: Failed to load model: {e}")
    model = None

def preprocess_audio(audio_path):
    """
    Load and preprocess audio for the model (Spectrogram).
    """
    try:
        print(f"Preprocessing audio: {audio_path}")
        y, sr = librosa.load(audio_path, sr=SAMPLE_RATE, duration=DURATION_SECONDS)

        # Normalize audio to -1 to 1 (Match training logic)
        y = librosa.util.normalize(y)

        if len(y) < FIXED_LENGTH:
            y = np.pad(y, (0, int(FIXED_LENGTH - len(y))), mode='constant')
        else:
            y = y[:int(FIXED_LENGTH)]

        spectrogram = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=N_MELS)
        
        # Use np.max(spectrogram) but ensure it's not 0 to avoid NaNs
        max_val = np.max(spectrogram)
        if max_val == 0:
            max_val = 1e-9 # Small epsilon

        log_spectrogram = librosa.power_to_db(spectrogram, ref=max_val)

        # Add batch and channel dimensions: (1, 128, 646, 1)
        result = np.expand_dims(np.expand_dims(log_spectrogram, axis=-1), axis=0)
        print(f"Audio preprocessing successful. Shape: {result.shape}")
        return result
    except Exception as e:
        print(f"Error processing audio: {e}")
        return None

def transcribe_audio(audio_path):
    """
    Transcribe audio using Google Web Speech API.
    Uses librosa + soundfile to convert to WAV (no FFmpeg needed).
    """
    print(f"Transcribing audio: {audio_path}")
    recognizer = sr.Recognizer()
    
    try:
        # Load audio with librosa (supports many formats via soundfile/audioread)
        y, sr_native = librosa.load(audio_path, sr=None) 
        
        # Save to in-memory WAV file
        wav_io = io.BytesIO()
        sf.write(wav_io, y, sr_native, format='WAV')
        wav_io.seek(0)
        
        with sr.AudioFile(wav_io) as source:
            audio_data = recognizer.record(source)
            text = recognizer.recognize_google(audio_data)
            print(f"Transcription successful: {text}")
            return text
    except sr.UnknownValueError:
        print("Transcription failed: UnknownValueError (Could not understand audio)")
        return "" # Could not understand audio
    except sr.RequestError as e:
        print(f"Transcription failed: RequestError ({e})")
        return "" # API unavailable
    except Exception as e:
        print(f"Transcription error: {e}")
        return ""

@app.get("/")
async def root():
    return {"message": "CDR Fraud Detection API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    # Save uploaded file temporarily
    temp_filename = f"temp_{file.filename}"
    temp_path = os.path.join(BASE_DIR, temp_filename)
    
    try:
        print(f"Received file: {file.filename}")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 1. Transcribe
        transcript = transcribe_audio(temp_path)
        
        # 2. Preprocess Audio
        audio_input = preprocess_audio(temp_path)
        if audio_input is None:
             raise HTTPException(status_code=400, detail="Could not process audio file")
        
        print(f"Audio Input Stats - Min: {np.min(audio_input):.4f}, Max: {np.max(audio_input):.4f}, Mean: {np.mean(audio_input):.4f}")

        # 3. Preprocess Text (Model expects a tensor)
        if not transcript:
            print("WARNING: Transcript is empty.")
        else:
            print(f"Transcript used for prediction: '{transcript}'")
        
        text_input = tf.constant([transcript])

        # 4. Predict
        # Model inputs: [audio_input, text_input]
        print("Running prediction...")
        prediction = model.predict([audio_input, text_input])
        score = float(prediction[0][0])
        print(f"Prediction raw score: {score}")
        
        # Threshold
        is_fraud = score > 0.5
        label = "FRAUD" if is_fraud else "LEGIT"
        
        return JSONResponse(content={
            "filename": file.filename,
            "label": label,
            "score": score,
            "confidence": f"{score:.2%}" if is_fraud else f"{1-score:.2%}",
            "transcript": transcript
        })

    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"Cleaned up {temp_path}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
