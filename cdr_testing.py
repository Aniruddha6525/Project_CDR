# -*- coding: utf-8 -*-
"""CDR_Testing.py

Refactored for local execution.
"""

import joblib
import pandas as pd
import string
import os
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import nltk

# Download NLTK data (safe to run multiple times)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')
try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab')


def preprocess_text(text):
    if not isinstance(text, str):
        return ""

    text = text.lower()
    text = "".join([char for char in text if char not in string.punctuation])
    tokens = word_tokenize(text)

    stop_words = set(stopwords.words('english'))
    custom_stopwords = {'hai', 'ka', 'ke', 'kar', 'mein', 'se', 'ko', 'par', 'ho', 'aapka', 'karo', 'kiye'}
    stop_words.update(custom_stopwords)
    filtered_tokens = [word for word in tokens if word not in stop_words]

    lemmatizer = WordNetLemmatizer()
    lemmatized_tokens = [lemmatizer.lemmatize(word) for word in filtered_tokens]

    return " ".join(lemmatized_tokens)

def get_sentiment_score(text):
    if not isinstance(text, str):
        return 0.0
    analyzer = SentimentIntensityAnalyzer()
    sentiment_dict = analyzer.polarity_scores(text)
    return sentiment_dict['compound']


def predict_scam(transcript_text, pipeline):
    if pipeline is None:
        return "Model is not loaded."

    sentiment_score = get_sentiment_score(transcript_text)

    data = {
        'cleaned_text': [transcript_text],
        'asks_for_otp': [1 if 'otp' in transcript_text.lower() else 0],
        'asks_for_email_password': [1 if 'password' in transcript_text.lower() else 0],
        'asks_to_click_link': [1 if 'link' in transcript_text.lower() else 0],
        'asks_remote_access': [1 if 'anydesk' in transcript_text.lower() or 'teamviewer' in transcript_text.lower() else 0],
        'uses_urgency': [1 if 'urgent' in transcript_text.lower() or 'immediately' in transcript_text.lower() or 'now' in transcript_text.lower() else 0],
        'claims_authority': [1 if 'bank' in transcript_text.lower() or 'police' in transcript_text.lower() or 'rbi' in transcript_text.lower() else 0],
        'has_email': [1 if 'email' in transcript_text.lower() else 0],
        'has_otp_like_number': [1 if any(char.isdigit() for char in transcript_text) else 0],
        'sentiment_score': [sentiment_score]
    }
    input_df = pd.DataFrame(data)

    input_df['cleaned_text'] = input_df['cleaned_text'].apply(preprocess_text)

    try:
        prediction = pipeline.predict(input_df)[0]
        probabilities = pipeline.predict_proba(input_df)[0]

        if prediction == 1:
            result = "Prediction: ☠️ FRAUD ☠️"
            confidence = f"Confidence: {probabilities[1]:.0%}"
        else:
            result = "Prediction: Legit ✅"
            confidence = f"Confidence: {probabilities[0]:.0%}"

        return f"{result}\n{confidence}"
    except Exception as e:
        return f"Error during prediction: {e}"

if __name__ == "__main__":
    # Define paths relative to the script location
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATASET_DIR = os.path.join(BASE_DIR, 'Dataset')
    
    MODEL_PATH_V2 = os.path.join(DATASET_DIR, 'fraud_detection_pipeline_v2.joblib')

    print(f"Loading model from: {MODEL_PATH_V2}")
    try:
        loaded_pipeline = joblib.load(MODEL_PATH_V2)
        print("Model loaded successfully! ✅")
    except FileNotFoundError:
        print(f"\nERROR: Model file not found at {MODEL_PATH_V2}")
        loaded_pipeline = None
    except Exception as e:
        print(f"\nERROR loading model: {e}")
        loaded_pipeline = None

    if loaded_pipeline:
        print("\n--- Testing with random transcripts ---")

        test_cases = [
            ("New Test 1 - Legit", "Your order has been placed successfully. You will receive a confirmation email shortly."),
            ("New Test 2 - Scam Attempt (Urgency + Authority)", "This is an urgent call from the tax department. Your account is under audit and immediate action is required to avoid penalties. Call us back right now."),
            ("New Test 3 - Legit (Contains number but no OTP context)", "Your delivery is scheduled for tomorrow between 2 PM and 4 PM. Tracking number is 123456789."),
            ("New Test 4 - Scam Attempt (Link + Prize)", "Congratulations! You have won a free gift card. Click this link to claim your prize: [fake-link].com"),
            ("New Test 5 - Legit (Standard bank notification)", "An amount of Rs. 500 has been debited from your account. Your current balance is Rs. 10000. Thank you for banking with us.")
        ]

        for test_id, text in test_cases:
            print(f"\nInput: '{test_id}'")
            print(predict_scam(text, loaded_pipeline))

    # --- Model Evaluation Section ---
    print("\n--- Model Evaluation ---")
    CSV_PATH = os.path.join(DATASET_DIR, 'final_scam_calls_dataset_updated.csv')
    
    if os.path.exists(CSV_PATH):
        df = pd.read_csv(CSV_PATH)
        print(f"Loaded dataset with {len(df)} rows.")
        
        # Load other models for comparison
        models = {
            'v2': MODEL_PATH_V2,
            'v3': os.path.join(DATASET_DIR, 'fraud_detection_pipeline_v3.joblib'),
            'v4_adv': os.path.join(DATASET_DIR, 'fraud_detection_pipeline_v4_advanced.joblib'),
            'v5': os.path.join(DATASET_DIR, 'fraud_detection_pipeline_v5.joblib')
        }
        
        loaded_models = {}
        for name, path in models.items():
            if os.path.exists(path):
                try:
                    loaded_models[name] = joblib.load(path)
                    print(f"Loaded {name}")
                except Exception as e:
                    print(f"Failed to load {name}: {e}")
            else:
                print(f"Model {name} not found at {path}")

        if loaded_models:
            # Preprocess dataset for evaluation
            print("Preprocessing dataset...")
            df['cleaned_text'] = df['Transcript_Text'].apply(preprocess_text)
            df['asks_for_otp'] = df['cleaned_text'].apply(lambda x: 1 if 'otp' in x else 0)
            df['asks_for_email_password'] = df['cleaned_text'].apply(lambda x: 1 if 'password' in x else 0)
            df['asks_to_click_link'] = df['cleaned_text'].apply(lambda x: 1 if 'link' in x else 0)
            df['asks_remote_access'] = df['cleaned_text'].apply(lambda x: 1 if 'anydesk' in x or 'teamviewer' in x else 0)
            df['uses_urgency'] = df['cleaned_text'].apply(lambda x: 1 if 'urgent' in x or 'immediately' in x or 'now' in x else 0)
            df['claims_authority'] = df['cleaned_text'].apply(lambda x: 1 if 'bank' in x or 'police' in x or 'rbi' in x else 0)
            df['has_email'] = df['cleaned_text'].apply(lambda x: 1 if 'email' in x else 0)
            df['has_otp_like_number'] = df['Transcript_Text'].apply(lambda x: 1 if any(char.isdigit() for char in str(x)) else 0)
            df['sentiment_score'] = df['Transcript_Text'].apply(get_sentiment_score)

            feature_cols = [
                'cleaned_text', 'asks_for_otp', 'asks_for_email_password', 'asks_to_click_link',
                'asks_remote_access', 'uses_urgency', 'claims_authority', 'has_email',
                'has_otp_like_number', 'sentiment_score'
            ]
            input_df = df[feature_cols].copy()
            actual_labels = df['Label']

            from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

            results = []
            for name, model in loaded_models.items():
                print(f"Evaluating {name}...")
                try:
                    preds = model.predict(input_df)
                    results.append({
                        'Model': name,
                        'Accuracy': accuracy_score(actual_labels, preds),
                        'Precision': precision_score(actual_labels, preds),
                        'Recall': recall_score(actual_labels, preds),
                        'F1-Score': f1_score(actual_labels, preds)
                    })
                except Exception as e:
                    print(f"Error evaluating {name}: {e}")

            if results:
                eval_df = pd.DataFrame(results)
                print("\nEvaluation Results:")
                print(eval_df.to_string(index=False))
    else:
        print(f"Dataset not found at {CSV_PATH}. Skipping evaluation.")




