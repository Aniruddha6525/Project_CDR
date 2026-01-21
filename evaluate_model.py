# -*- coding: utf-8 -*-
"""
Evaluate CDR Model V7
"""

import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import pandas as pd
import numpy as np
import librosa
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_score, recall_score, f1_score
import seaborn as sns
import matplotlib.pyplot as plt

# Define paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, 'Dataset')
CSV_FILE_PATH = os.path.join(DATASET_DIR, 'final_scam_calls_dataset_updated.csv')
AUDIO_BASE_PATH = DATASET_DIR
MODEL_PATH = os.path.join(DATASET_DIR, 'hybrid_audio_text_model_v6.keras')

SAMPLE_RATE = 22050
DURATION_SECONDS = 15
N_MELS = 128
FIXED_LENGTH = SAMPLE_RATE * DURATION_SECONDS

CATEGORY_FOLDERS = {
    'Banking_Fraud': 'Banking_Fraud',
    'Legit_Call': 'Legit_Call',
    'Loan_Credit_Scam': 'Loan_Credit_Scam',
    'Prize_Lottery_Scam': 'Prize_Lottery_Scam',
    'Social_Engineering': 'Social_Engineering',
    'Tech_Support_Scam': 'Tech_Support_Scam',
    'Threat_Legal': 'Threat_Legal',
    'UPI_Payment_Scam': 'UPI_Payment_Scam'
}

def get_valid_audio_path(row):
    call_id = row['Call_ID']
    category = row['Category']
    folder_name = CATEGORY_FOLDERS.get(category)
    if folder_name:
        full_path = os.path.join(AUDIO_BASE_PATH, folder_name, f"{call_id}.mp3")
        if os.path.exists(full_path):
            return full_path
    return None

def load_and_process_audio(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=SAMPLE_RATE, duration=DURATION_SECONDS)
        if len(y) < FIXED_LENGTH:
            y = np.pad(y, (0, int(FIXED_LENGTH - len(y))), mode='constant')
        else:
            y = y[:int(FIXED_LENGTH)]
        spectrogram = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=N_MELS)
        log_spectrogram = librosa.power_to_db(spectrogram, ref=np.max)
        return np.expand_dims(log_spectrogram, axis=-1)
    except Exception:
        return np.zeros((N_MELS, int(np.ceil(FIXED_LENGTH / 512)), 1))

def process_text(text):
    return str(text)

def data_generator(dataframe, batch_size=32):
    num_samples = len(dataframe)
    while True:
        dataframe = dataframe.sample(frac=1)
        for offset in range(0, num_samples, batch_size):
            batch_df = dataframe.iloc[offset : offset + batch_size]
            audio_list = [load_and_process_audio(path) for path in batch_df['audio_path']]
            audio_data = np.array(audio_list, dtype='float32')
            text_list = [process_text(text) for text in batch_df['Transcript_Text']]
            text_input_tensor = tf.reshape(tf.constant(text_list), [-1, 1])
            labels = np.array(batch_df['Label'].values, dtype='float32')
            yield {'audio_input': audio_data, 'text_input': text_input_tensor}, labels

def evaluate():
    print(f"Loading model from: {MODEL_PATH}")
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully! ✅")
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    print(f"Loading dataset from: {CSV_FILE_PATH}")
    df = pd.read_csv(CSV_FILE_PATH)
    df['Category'] = df['Category'].replace('Legg_Call', 'Legit_Call')
    df['audio_path'] = df.apply(get_valid_audio_path, axis=1)
    df = df.dropna(subset=['audio_path'])
    print(f"Valid samples: {len(df)}")

    # Use the same split as training to ensure we evaluate on Test set
    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df['Label'])
    print(f"Test Set Size: {len(test_df)}")

    BATCH_SIZE = 32
    test_gen = data_generator(test_df, BATCH_SIZE)
    
    print("\n--- Evaluating ---")
    steps = len(test_df) // BATCH_SIZE
    if steps == 0: steps = 1
    
    all_labels = []
    all_preds = []
    
    # Manually iterate to collect all predictions
    print("Collecting predictions...")
    for i in range(steps + 1):
        if i * BATCH_SIZE >= len(test_df): break
        batch_data, batch_labels = next(test_gen)
        preds = model.predict(batch_data, verbose=0)
        all_labels.extend(batch_labels)
        all_preds.extend((preds > 0.5).astype(int).flatten())

    print("\n--- Results ---")
    acc = accuracy_score(all_labels, all_preds)
    prec = precision_score(all_labels, all_preds)
    rec = recall_score(all_labels, all_preds)
    f1 = f1_score(all_labels, all_preds)

    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    
    print("\nClassification Report:")
    print(classification_report(all_labels, all_preds, target_names=['Legit', 'Fraud']))

    # Plot Confusion Matrix
    cm = confusion_matrix(all_labels, all_preds)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Legit', 'Fraud'], yticklabels=['Legit', 'Fraud'])
    plt.xlabel('Predicted')
    plt.ylabel('Actual')
    plt.title('Confusion Matrix')
    save_path = os.path.join(BASE_DIR, 'confusion_matrix.png')
    plt.savefig(save_path)
    print(f"\nGraph saved to: {save_path}")
    plt.close()

if __name__ == "__main__":
    evaluate()
