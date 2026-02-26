print("Installing SpeechRecognition library...")
# Dependencies managed in requirements.txt
print("SpeechRecognition installed.")

import speech_recognition as sr

audio_file_path = "Dataset/Audio_Files"
def audio_to_text(audio_file_path):
    r = sr.Recognizer()
    try:
        with sr.AudioFile(audio_file_path) as source:
            print(f"Processing audio file: {audio_file_path}")
            audio_data = r.record(source)
            try:
                text = r.recognize_google(audio_data)
                print(f"Transcription successful for {audio_file_path}")
                return text
            except sr.UnknownValueError:
                print(f"Google Speech Recognition could not understand audio in {audio_file_path}")
                return ""
            except sr.RequestError as e:
                print(f"Could not request results from Google Speech Recognition service for {audio_file_path}; {e}")
                return ""
    except FileNotFoundError:
        print(f"Error: Audio file not found at {audio_file_path}")
        return ""
    except Exception as e:
        print(f"An unexpected error occurred while processing {audio_file_path}: {e}")
        return ""

print("audio_to_text function defined.")

import re

def asks_for_otp(text):
    if not isinstance(text, str): return 0
    keywords = ['otp', 'one time password', 'code', 'pin number']
    for keyword in keywords:
        if keyword in text.lower():
            return 1
    return 0

def asks_for_email_password(text):
    if not isinstance(text, str): return 0
    keywords = ['email id', 'password', 'login credentials', 'email address', 'e-mail']
    for keyword in keywords:
        if keyword in text.lower():
            return 1
    return 0

def asks_to_click_link(text):
    if not isinstance(text, str): return 0
    keywords = ['click on this link', 'visit this website', 'click here', 'follow the link']
    for keyword in keywords:
        if keyword in text.lower():
            return 1
    return 0

def asks_remote_access(text):
    if not isinstance(text, str): return 0
    keywords = ['remote access', 'install teamviewer', 'anydesk', 'screen sharing']
    for keyword in keywords:
        if keyword in text.lower():
            return 1
    return 0

def uses_urgency(text):
    if not isinstance(text, str): return 0
    keywords = ['urgent', 'immediately', 'now', 'act fast', 'at once', 'asap', 'don\'t delay']
    for keyword in keywords:
        if keyword in text.lower():
            return 1
    return 0

def claims_authority(text):
    if not isinstance(text, str): return 0
    keywords = ['police', 'bank manager', 'income tax department', 'official', 'reserve bank', 'cyber cell']
    for keyword in keywords:
        if keyword in text.lower():
            return 1
    return 0

def has_email(text):
    if not isinstance(text, str): return 0
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if re.search(email_pattern, text):
        return 1
    return 0

def has_otp_like_number(text):
    if not isinstance(text, str): return 0
    otp_pattern = r'\b(?:otp|code|pin|your)\s*is\s*\b(\d{4,6})\b|\b(\d{4,6})\s*(?:is\s*your|otp|code|pin)\b|\b(\d{4,6})\b'
    if re.search(otp_pattern, text.lower()):
        return 1
    return 0

print("Feature extraction functions defined.")

def prepare_audio_for_prediction(audio_file_path):
    print(f"\nPreparing features for audio file: {audio_file_path}")

    raw_transcribed_text = audio_to_text(audio_file_path)

    if not raw_transcribed_text:
        print(f"Could not transcribe audio from {audio_file_path}. Returning empty DataFrame.")
        return pd.DataFrame()

    cleaned_text = preprocess_text(raw_transcribed_text)
    print(f"Cleaned text: {cleaned_text}")

    sentiment_score = get_sentiment_score(raw_transcribed_text)
    print(f"Sentiment score: {sentiment_score}")

    features = {
        'sentiment_score': sentiment_score,
        'asks_for_otp': asks_for_otp(raw_transcribed_text),
        'asks_for_email_password': asks_for_email_password(raw_transcribed_text),
        'asks_to_click_link': asks_to_click_link(raw_transcribed_text),
        'asks_remote_access': asks_remote_access(raw_transcribed_text),
        'uses_urgency': uses_urgency(raw_transcribed_text),
        'claims_authority': claims_authority(raw_transcribed_text),
        'has_email': has_email(raw_transcribed_text),
        'has_otp_like_number': has_otp_like_number(raw_transcribed_text),
        'cleaned_text': cleaned_text
    }

    numerical_features_order = [
        'sentiment_score', 'asks_for_otp', 'asks_for_email_password', 'asks_to_click_link',
        'asks_remote_access', 'uses_urgency', 'claims_authority', 'has_email', 'has_otp_like_number'
    ]
    text_feature_name = 'cleaned_text'

    ordered_values = [features[col] for col in numerical_features_order] + [features[text_feature_name]]
    ordered_columns = numerical_features_order + [text_feature_name]

    prediction_df = pd.DataFrame([ordered_values], columns=ordered_columns)

    print("Feature extraction complete.")
    return prediction_df

print("prepare_audio_for_prediction function defined.")

import joblib
print("Loading the trained model...")
model_save_path = 'Dataset/fraud_detection_pipeline_v6.joblib'
try:
    loaded_model_v5 = joblib.load(model_save_path)
    print(f"Model loaded successfully from: {model_save_path}")
except FileNotFoundError:
    print(f"ERROR: Model file not found at {model_save_path}.")
    print("Please ensure the file exists and the path is correct.")
except Exception as e:
    print(f"An error occurred while loading the model: {e}")

