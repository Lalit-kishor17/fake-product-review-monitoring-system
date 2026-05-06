
# app.py - Main Flask Application
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report
import pickle
import os
import re
from functools import wraps
from authlib.integrations.flask_client import OAuth
import requests
from urllib.parse import quote_plus, urlencode

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Change this in production
CORS(app)

# OAuth Configuration
oauth = OAuth(app)

# Configure OAuth providers (Google)
oauth.register(
    name='google',
    client_id='your-google-client-id',
    client_secret='your-google-client-secret',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Global variables for ML models
vectorizer = None
models = {}
model_accuracies = {}

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def train_models():
    """Train multiple ML models for fake review detection"""
    global vectorizer, models, model_accuracies

    # Load dataset
    try:
        df = pd.read_csv('fake_reviews_dataset.csv')
    except FileNotFoundError:
        print("Dataset not found. Creating sample dataset...")
        create_sample_dataset()
        df = pd.read_csv('fake_reviews_dataset.csv')

    # Prepare features
    X = df['review_text']
    y = df['label']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Vectorize text
    vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    # Train multiple models
    model_configs = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000),
        'SVM': SVC(kernel='rbf', random_state=42, probability=True)
    }

    for name, model in model_configs.items():
        model.fit(X_train_vec, y_train)
        y_pred = model.predict(X_test_vec)
        accuracy = accuracy_score(y_test, y_pred)

        models[name] = model
        model_accuracies[name] = accuracy

        print(f"{name} Accuracy: {accuracy:.4f}")

    # Save models
    with open('vectorizer.pkl', 'wb') as f:
        pickle.dump(vectorizer, f)

    for name, model in models.items():
        with open(f'{name.lower().replace(" ", "_")}_model.pkl', 'wb') as f:
            pickle.dump(model, f)

    print("Models trained and saved successfully!")

def create_sample_dataset():
    """Create sample dataset if not exists"""
    real_reviews = [
        "The headphones are decent for the price. Sound quality is good but not exceptional.",
        "Purchased this product last month. Works as expected. Shipping was fast.",
        "Good value for money. The material feels solid and the design is nice.",
        "I've been using this for 3 weeks now. Overall satisfied with the purchase.",
        "The product arrived on time and in good condition. It works well.",
        "Nice product but a bit overpriced in my opinion. The quality is good though.",
        "Works fine for my needs. The size is perfect for my small apartment.",
        "Good build quality. Easy to set up. The color is exactly as shown.",
        "The product does what it's supposed to do. Nothing fancy but gets the job done.",
        "Happy with my purchase. The delivery was quick and the item was well packaged."
    ]

    fake_reviews = [
        "OMG this is the BEST product ever! I bought 5 of them and they're all perfect!",
        "Absolutely incredible! This product changed my life! Everyone should buy this!",
        "WOW! This is exactly what I was looking for! Perfect quality, perfect price!",
        "AMAZING product! I love it so much! Best purchase ever! The seller is fantastic!",
        "This product is absolutely perfect! No flaws whatsoever! I'm buying 10 more!",
        "Outstanding quality! This exceeded all my expectations! Perfect in every way!",
        "Incredible product! Works perfectly! Amazing seller! Fast shipping!",
        "PERFECT! PERFECT! PERFECT! This is the best product I have ever purchased!",
        "This product is absolutely fantastic! Works flawlessly! Great seller!",
        "Amazing product! Perfect quality! Great price! Fast shipping! Excellent seller!"
    ]

    reviews = real_reviews + fake_reviews
    labels = [0] * len(real_reviews) + [1] * len(fake_reviews)

    df = pd.DataFrame({
        'review_text': reviews,
        'label': labels,
        'label_description': ['Real' if l == 0 else 'Fake' for l in labels]
    })

    df.to_csv('fake_reviews_dataset.csv', index=False)

def load_models():
    """Load trained models"""
    global vectorizer, models

    try:
        with open('vectorizer.pkl', 'rb') as f:
            vectorizer = pickle.load(f)

        model_files = {
            'Random Forest': 'random_forest_model.pkl',
            'Logistic Regression': 'logistic_regression_model.pkl',
            'SVM': 'svm_model.pkl'
        }

        for name, filename in model_files.items():
            with open(filename, 'rb') as f:
                models[name] = pickle.load(f)

        print("Models loaded successfully!")

    except FileNotFoundError:
        print("Models not found. Training new models...")
        train_models()

def predict_review(text, model_name='Random Forest'):
    """Predict if a review is fake or real"""
    global vectorizer, models

    if vectorizer is None or not models:
        load_models()

    # Preprocess text
    text_vec = vectorizer.transform([text])

    # Get prediction
    model = models.get(model_name, models['Random Forest'])
    prediction = model.predict(text_vec)[0]
    probability = model.predict_proba(text_vec)[0]

    return {
        'prediction': 'Fake' if prediction == 1 else 'Real',
        'confidence': max(probability),
        'fake_probability': probability[1],
        'real_probability': probability[0]
    }

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/login')
def login():
    redirect_uri = url_for('callback', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)

@app.route('/callback')
def callback():
    token = oauth.google.authorize_access_token()
    user_info = token.get('userinfo')

    session['user'] = {
        'name': user_info.get('name'),
        'email': user_info.get('email'),
        'picture': user_info.get('picture')
    }

    return redirect(url_for('dashboard'))

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('home'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', user=session['user'])

@app.route('/analyze', methods=['GET', 'POST'])
@login_required
def analyze():
    if request.method == 'POST':
        if 'file' in request.files:
            # Handle CSV upload
            file = request.files['file']
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file)
                results = []

                for _, row in df.iterrows():
                    if 'review_text' in df.columns:
                        result = predict_review(row['review_text'])
                        results.append({
                            'review': row['review_text'][:100] + '...',
                            'prediction': result['prediction'],
                            'confidence': f"{result['confidence']:.2%}"
                        })

                return render_template('results.html', results=results, user=session['user'])

        else:
            # Handle single review analysis
            review_text = request.form.get('review_text')
            model_name = request.form.get('model', 'Random Forest')

            if review_text:
                result = predict_review(review_text, model_name)
                return render_template('single_result.html', 
                                     review=review_text, 
                                     result=result, 
                                     user=session['user'])

    return render_template('analyze.html', 
                         models=list(models.keys()), 
                         accuracies=model_accuracies,
                         user=session['user'])

@app.route('/api/predict', methods=['POST'])
@login_required
def api_predict():
    data = request.json
    review_text = data.get('review_text')
    model_name = data.get('model', 'Random Forest')

    if not review_text:
        return jsonify({'error': 'No review text provided'}), 400

    result = predict_review(review_text, model_name)
    return jsonify(result)

@app.route('/dataset')
@login_required
def dataset():
    try:
        df = pd.read_csv('fake_reviews_dataset.csv')
        data = df.to_dict('records')
        return render_template('dataset.html', data=data, user=session['user'])
    except FileNotFoundError:
        return render_template('dataset.html', data=[], user=session['user'])

@app.route('/download_dataset')
@login_required
def download_dataset():
    return send_file('fake_reviews_dataset.csv', as_attachment=True)

@app.route('/samples')
def samples():
    sample_data = {
        'real_reviews': [
            "The headphones are decent for the price. Sound quality is good but not exceptional. The bass could be stronger.",
            "Good value for money. The material feels solid and the design is nice. Minor issues with the packaging.",
            "I've been using this for 3 weeks now. Overall satisfied with the purchase. Customer service was helpful."
        ],
        'fake_reviews': [
            "OMG this is the BEST product ever! I bought 5 of them and they're all perfect! Amazing quality!",
            "Absolutely incredible! This product changed my life! Everyone should buy this immediately!",
            "AMAZING product! I love it so much! Best purchase ever! The seller is fantastic and shipping was lightning fast!"
        ]
    }
    return render_template('samples.html', samples=sample_data)

if __name__ == '__main__':
    # Initialize models on startup
    load_models()
    app.run(debug=True, port=5000)
