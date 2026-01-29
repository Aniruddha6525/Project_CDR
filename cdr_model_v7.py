import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import pandas as pd
import numpy as np
import librosa
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras import layers, models, Input
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping
import matplotlib.pyplot as plt
import seaborn as sns

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, 'Dataset')
CSV_FILE_PATH = os.path.join(DATASET_DIR, 'final_scam_calls_dataset_updated.csv')
AUDIO_BASE_PATH = DATASET_DIR
MODEL_SAVE_PATH = os.path.join(DATASET_DIR, 'hybrid_audio_text_model_v6.keras')

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

def augment_audio(y, sr):
    if np.random.random() < 0.5:
        noise_amp = 0.005 * np.random.uniform() * np.amax(y)
        y = y + noise_amp * np.random.normal(size=y.shape)

    if np.random.random() < 0.5:
        steps = np.random.uniform(-2, 2)
        y = librosa.effects.pitch_shift(y, sr=sr, n_steps=steps)

    if np.random.random() < 0.5:
        rate = np.random.uniform(0.8, 1.2)
        y = librosa.effects.time_stretch(y, rate=rate)

    return y

def load_and_process_audio(audio_path, augment=False):
    try:
        y, sr = librosa.load(audio_path, sr=SAMPLE_RATE, duration=DURATION_SECONDS)

        y = librosa.util.normalize(y)
        
        if augment:
            y = augment_audio(y, sr)

        if len(y) < FIXED_LENGTH:
            y = np.pad(y, (0, int(FIXED_LENGTH - len(y))), mode='constant')
        else:
            y = y[:int(FIXED_LENGTH)]

        spectrogram = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=N_MELS)
        
        max_val = np.max(spectrogram)
        if max_val == 0:
            max_val = 1e-9
            
        log_spectrogram = librosa.power_to_db(spectrogram, ref=max_val)

        return np.expand_dims(log_spectrogram, axis=-1)
    except Exception as e:
        print(f"Error processing {audio_path}: {e}")
        return np.zeros((N_MELS, int(np.ceil(FIXED_LENGTH / 512)), 1))

def process_text(text):
    return str(text)

def data_generator(dataframe, batch_size=32, augment=False):
    num_samples = len(dataframe)
    while True:
        dataframe = dataframe.sample(frac=1)

        for offset in range(0, num_samples, batch_size):
            batch_df = dataframe.iloc[offset : offset + batch_size]

            audio_list = [load_and_process_audio(path, augment=augment) for path in batch_df['audio_path']]
            audio_data = np.array(audio_list, dtype='float32')

            text_list = [process_text(text) for text in batch_df['Transcript_Text']]
            text_input_tensor = tf.reshape(tf.constant(text_list), [-1, 1])

            labels = np.array(batch_df['Label'].values, dtype='float32')

            yield {'audio_input': audio_data, 'text_input': text_input_tensor}, labels

def build_hybrid_model(text_vectorizer, max_tokens):
    audio_input = Input(shape=(128, 646, 1), name='audio_input')
    
    x = layers.Conv2D(16, (3, 3), activation='relu', padding='same')(audio_input)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.BatchNormalization()(x)

    x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.3)(x)

    x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    x = layers.MaxPooling2D((2, 2))(x)
    
    x = layers.GlobalAveragePooling2D()(x)
    audio_features = layers.Dense(32, activation='relu')(x)

    text_input = Input(shape=(1,), dtype=tf.string, name='text_input')
    y = text_vectorizer(text_input)
    y = layers.Embedding(input_dim=max_tokens, output_dim=64)(y)
    y = layers.LSTM(32, return_sequences=False)(y)
    text_features = layers.Dense(32, activation='relu')(y)

    combined = layers.concatenate([audio_features, text_features])
    z = layers.Dense(32, activation='relu')(combined)
    z = layers.Dropout(0.5)(z)
    output = layers.Dense(1, activation='sigmoid', name='fraud_prediction')(z)

    model = models.Model(inputs=[audio_input, text_input], outputs=output)
    model.compile(optimizer='adam',
                  loss='binary_crossentropy',
                  metrics=['accuracy', tf.keras.metrics.Precision(name='precision'), tf.keras.metrics.Recall(name='recall')])
    return model

def main():
    if not os.path.exists(CSV_FILE_PATH):
        print(f"Error: Dataset not found at {CSV_FILE_PATH}")
        return

    print(f"Loading dataset from: {CSV_FILE_PATH}")
    df = pd.read_csv(CSV_FILE_PATH)

    df['Category'] = df['Category'].replace('Legg_Call', 'Legit_Call')

    print("Verifying audio files... (this may take a moment)")
    df['audio_path'] = df.apply(get_valid_audio_path, axis=1)

    initial_count = len(df)
    df = df.dropna(subset=['audio_path'])
    print(f"Dataset cleaned. Rows with valid audio: {len(df)} (Dropped {initial_count - len(df)})")

    if len(df) == 0:
        print("CRITICAL ERROR: No valid audio files found! Check your paths.")
        return

    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df['Label'])
    train_df, val_df = train_test_split(train_df, test_size=0.1, random_state=42, stratify=train_df['Label'])

    print(f"Train: {len(train_df)} | Val: {len(val_df)} | Test: {len(test_df)}")

    from sklearn.utils import class_weight
    class_weights = class_weight.compute_class_weight(
        class_weight='balanced',
        classes=np.unique(train_df['Label']),
        y=train_df['Label']
    )
    class_weights_dict = dict(enumerate(class_weights))
    print(f"Class Weights: {class_weights_dict}")

    BATCH_SIZE = 32
    train_gen = data_generator(train_df, BATCH_SIZE, augment=True)
    val_gen = data_generator(val_df, BATCH_SIZE, augment=False)
    test_gen = data_generator(test_df, BATCH_SIZE, augment=False)
    print("Generators initialized with Data Augmentation for Training.")

    max_tokens = 10000
    output_sequence_length = 50

    text_vectorizer = layers.TextVectorization(
        max_tokens=max_tokens,
        output_sequence_length=output_sequence_length,
        output_mode='int'
    )
    print("Adapting text vectorizer...")
    text_vectorizer.adapt(train_df['Transcript_Text'].values)

    hybrid_model = build_hybrid_model(text_vectorizer, max_tokens)
    try:
        hybrid_model.summary(line_length=80)
    except ValueError:
        print("Could not print model summary due to terminal width.")

    callbacks = [
        ModelCheckpoint(filepath=MODEL_SAVE_PATH,
                        save_best_only=True,
                        monitor='val_loss',
                        mode='min',
                        verbose=1),
        EarlyStopping(monitor='val_loss',
                      patience=10,
                      restore_best_weights=True)
    ]

    print("\n--- Starting Training ---")
    try:
        history = hybrid_model.fit(
            train_gen,
            steps_per_epoch=len(train_df) // BATCH_SIZE,
            validation_data=val_gen,
            validation_steps=len(val_df) // BATCH_SIZE,
            epochs=50,
            callbacks=callbacks
        )
        print("--- Training Complete ---")
        
        print(f"Saving final model to: {MODEL_SAVE_PATH}")
        hybrid_model.save(MODEL_SAVE_PATH)

    except KeyboardInterrupt:
        print("\nTraining interrupted by user. Saving current model state...")
        hybrid_model.save(MODEL_SAVE_PATH)
        print(f"Model saved to {MODEL_SAVE_PATH}")
        return

    if os.path.exists(MODEL_SAVE_PATH):
        print(f"Loading best model from: {MODEL_SAVE_PATH}")
        best_model = tf.keras.models.load_model(MODEL_SAVE_PATH)

        print("\n--- Evaluating on Test Set ---")
        test_loss, test_acc, test_prec, test_rec = best_model.evaluate(test_gen, steps=len(test_df) // BATCH_SIZE)

        print(f"\nTest Accuracy:  {test_acc:.4f}")
        print(f"Test Precision: {test_prec:.4f}")
        print(f"Test Recall:    {test_rec:.4f}")

        print("\nGenerating Classification Report...")
        test_gen_report = data_generator(test_df, BATCH_SIZE)
        all_labels = []
        all_preds = []

        steps = len(test_df) // BATCH_SIZE
        for i in range(steps + 1):
            if i * BATCH_SIZE >= len(test_df): break

            batch_data, batch_labels = next(test_gen_report)
            preds = best_model.predict(batch_data, verbose=0)

            all_labels.extend(batch_labels)
            all_preds.extend((preds > 0.5).astype(int).flatten())

        print("\nClassification Report:")
        print(classification_report(all_labels, all_preds, target_names=['Legit', 'Fraud']))

        cm = confusion_matrix(all_labels, all_preds)
        plt.figure(figsize=(6, 5))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                    xticklabels=['Legit', 'Fraud'],
                    yticklabels=['Legit', 'Fraud'])
        plt.title('Hybrid Model Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.show()
    else:
        print(f"Model file not found at {MODEL_SAVE_PATH}. Skipping evaluation.")

if __name__ == "__main__":
    main()
