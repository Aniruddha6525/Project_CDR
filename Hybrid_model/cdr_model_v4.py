
# Dependencies managed in requirements.txt
import pandas as pd
import joblib
import nltk
# from google.colab import drive
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
nltk.download('vader_lexicon', quiet=True)
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)
nltk.download('punkt_tab', quiet=True)

file_path = 'Dataset/final_scam_calls_dataset_updated.csv'
full_df = pd.read_csv(file_path)

analyzer = SentimentIntensityAnalyzer()

def get_sentiment_score(text):
    if not isinstance(text, str):
        return 0.0
    return analyzer.polarity_scores(text)['compound']

print("Performing Sentiment Analysis...")
full_df['sentiment_score'] = full_df['Transcript_Text'].apply(get_sentiment_score)
print("Sentiment analysis complete.")

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import string

def preprocess_text(text):
    if not isinstance(text, str): return ""
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

full_df['cleaned_text'] = full_df['Transcript_Text'].apply(preprocess_text)

numerical_features = [
    'sentiment_score', 'asks_for_otp', 'asks_for_email_password', 'asks_to_click_link',
    'asks_remote_access', 'uses_urgency', 'claims_authority', 'has_email', 'has_otp_like_number'
]
text_feature = 'cleaned_text'
all_features = numerical_features + [text_feature]

X_full = full_df[all_features]
y_full = full_df['Label']

preprocessor = ColumnTransformer(
    transformers=[
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2)), text_feature),
        ('passthrough_numeric', 'passthrough', numerical_features)
    ])

final_pipeline_v4 = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(random_state=42))
])

print("\n--- Training final model with Advanced Features... ---")
final_pipeline_v4.fit(X_full, y_full)
print("--- Advanced model trained successfully!  ---")

model_save_path = 'Dataset/fraud_detection_pipeline_v4_advanced.joblib'
joblib.dump(final_pipeline_v4, model_save_path)
print(f"\nAdvanced model saved to: {model_save_path}")

