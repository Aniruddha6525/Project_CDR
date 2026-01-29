import os
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

app = FastAPI(title="CDR Fraud Detection API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, 'Dataset')
MODEL_PATH = os.path.join(DATASET_DIR, 'hybrid_audio_text_model_v6.keras')

SAMPLE_RATE = 22050
DURATION_SECONDS = 15
N_MELS = 128
FIXED_LENGTH = SAMPLE_RATE * DURATION_SECONDS

print(f"Loading model from: {MODEL_PATH}")
try:
    model = tf.keras.models.load_model(MODEL_PATH)
    print("Model loaded successfully! ✅")
except Exception as e:
    print(f"CRITICAL ERROR: Failed to load model: {e}")
    model = None

def preprocess_audio(audio_path):
    try:
        print(f"Preprocessing audio: {audio_path}")
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
        if max_val == 0:
            max_val = 1e-9

        log_spectrogram = librosa.power_to_db(spectrogram, ref=max_val)

        result = np.expand_dims(np.expand_dims(log_spectrogram, axis=-1), axis=0)
        print(f"Audio preprocessing successful. Shape: {result.shape}")
        return result
    except Exception as e:
        print(f"Error processing audio: {e}")
        return None

def transcribe_audio(audio_path):
    print(f"Transcribing audio: {audio_path}")
    recognizer = sr.Recognizer()
    
    try:
        y, sr_native = sf.read(audio_path)
        
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
        return ""
    except sr.RequestError as e:
        print(f"Transcription failed: RequestError ({e})")
        return ""
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

    temp_filename = f"temp_{file.filename}"
    temp_path = os.path.join(BASE_DIR, temp_filename)
    
    try:
        print(f"Received file: {file.filename}")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        transcript = transcribe_audio(temp_path)
        
        audio_input = preprocess_audio(temp_path)
        if audio_input is None:
             raise HTTPException(status_code=400, detail="Could not process audio file")
        
        print(f"Audio Input Stats - Min: {np.min(audio_input):.4f}, Max: {np.max(audio_input):.4f}, Mean: {np.mean(audio_input):.4f}")

        if not transcript:
            print("WARNING: Transcript is empty.")
        else:
            print(f"Transcript used for prediction: '{transcript}'")
        
        text_input = tf.constant([transcript])

        print("Running prediction...")
        prediction = model.predict([audio_input, text_input])
        score = float(prediction[0][0])
        print(f"Prediction raw score: {score}")
        
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
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print(f"Cleaned up {temp_path}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
