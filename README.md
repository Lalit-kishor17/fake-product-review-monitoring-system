
# Fake Product Review Monitoring System

A comprehensive machine learning-based web application for detecting fake product reviews using Natural Language Processing and multiple ML algorithms.

## 🌟 Features

- **OAuth Authentication**: Secure login using Google OAuth
- **Multiple ML Models**: Random Forest, Logistic Regression, and SVM classifiers
- **Single Review Analysis**: Analyze individual reviews with confidence scores
- **Batch Processing**: Upload CSV files for bulk review analysis
- **Interactive Dashboard**: User-friendly interface for all operations
- **Sample Data**: Educational examples of real vs fake reviews
- **Dataset Management**: View and download training datasets

## 🏗️ Architecture

### Backend (Flask)
- RESTful API endpoints
- OAuth integration with Authlib
- Machine learning model integration
- CSV file processing
- Session management

### Frontend (HTML/CSS/JavaScript)
- Bootstrap 5 responsive design
- Interactive forms and dashboards
- Real-time analysis results
- File upload functionality

### Machine Learning Pipeline
- Text preprocessing with NLTK
- TF-IDF vectorization
- Multiple model training and evaluation
- Prediction confidence scoring

## 📊 ML Models Used

1. **Random Forest Classifier**
   - Best overall performance
   - Handles overfitting well
   - Feature importance analysis

2. **Logistic Regression**
   - Fast and interpretable
   - Good baseline model
   - Probability outputs

3. **Support Vector Machine (SVM)**
   - Effective for text classification
   - Good with high-dimensional data
   - Kernel trick for non-linear patterns

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip package manager
- Google OAuth credentials (for authentication)

### Step 1: Clone/Download Project Files
```bash
# Create project directory
mkdir fake_review_project
cd fake_review_project

# All files are already provided in this implementation
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure OAuth (Optional for testing)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Update the credentials in `app.py`:

```python
oauth.register(
    name='google',
    client_id='your-actual-google-client-id',
    client_secret='your-actual-google-client-secret',
    # ... rest of config
)
```

### Step 4: Run the Application
```bash
python app.py
```

### Step 5: Access the Application
Open your browser and navigate to: `http://localhost:5000`

## 📂 Project Structure

```
fake_review_project/
├── app.py                          # Main Flask application
├── requirements.txt                # Python dependencies
├── fake_reviews_dataset.csv        # Sample training dataset
├── templates/                      # HTML templates
│   ├── base.html                  # Base template with navigation
│   ├── index.html                 # Home page
│   ├── dashboard.html             # User dashboard
│   ├── analyze.html               # Analysis interface
│   ├── single_result.html         # Single review results
│   └── samples.html               # Sample reviews for learning
└── models/                        # Saved ML models (auto-created)
    ├── vectorizer.pkl
    ├── random_forest_model.pkl
    ├── logistic_regression_model.pkl
    └── svm_model.pkl
```

## 🔧 API Endpoints

### Authentication Routes
- `GET /` - Home page
- `GET /login` - Initiate OAuth login
- `GET /callback` - OAuth callback handler
- `GET /logout` - User logout

### Application Routes
- `GET /dashboard` - User dashboard (protected)
- `GET,POST /analyze` - Review analysis interface (protected)
- `GET /dataset` - View training dataset (protected)
- `GET /download_dataset` - Download CSV dataset (protected)
- `GET /samples` - View sample reviews (public)

### API Routes
- `POST /api/predict` - Predict review authenticity (protected)

## 📊 Dataset Format

The application expects CSV files with the following structure:

```csv
review_text,label,label_description
"Great product, works as expected",0,"Real"
"AMAZING! Best purchase ever!!!",1,"Fake"
```

### Columns:
- `review_text`: The review content to analyze
- `label`: 0 for real, 1 for fake (optional)
- `label_description`: "Real" or "Fake" (optional)

## 🧠 How It Works

### 1. Text Preprocessing
- Remove special characters and punctuation
- Convert to lowercase
- Remove stop words
- Tokenization

### 2. Feature Extraction
- TF-IDF (Term Frequency-Inverse Document Frequency)
- N-gram analysis
- Text length and pattern analysis

### 3. Model Training
- Split data into training/testing sets
- Train multiple ML algorithms
- Cross-validation for model selection
- Save trained models for inference

### 4. Prediction
- Preprocess input text
- Apply TF-IDF transformation
- Get predictions from all models
- Return confidence scores and probabilities

## 🎯 Usage Examples

### Single Review Analysis
1. Login with Google OAuth
2. Navigate to "Analyze" page
3. Enter review text
4. Select ML model
5. Click "Analyze Review"
6. View results with confidence scores

### Batch Analysis
1. Prepare CSV file with reviews
2. Upload file in "Analyze" section
3. View results for all reviews
4. Download results if needed

### Educational Use
1. Visit "Samples" page (no login required)
2. Study examples of real vs fake reviews
3. Learn to identify patterns manually

## 🔍 Features Detected

### Fake Review Indicators:
- Excessive superlatives ("BEST", "AMAZING", "PERFECT")
- Too many exclamation marks
- Generic praise without specifics
- Overly promotional language
- Suspicious timing patterns

### Real Review Indicators:
- Balanced feedback (pros and cons)
- Specific usage details
- Natural language patterns
- Context about purchase reason
- Minor complaints or suggestions

## ⚙️ Configuration Options

### Model Settings (in `app.py`):
```python
# Adjust TF-IDF parameters
vectorizer = TfidfVectorizer(
    max_features=5000,      # Maximum number of features
    stop_words='english',   # Remove English stop words
    ngram_range=(1, 2)      # Use unigrams and bigrams
)

# Model hyperparameters
RandomForestClassifier(
    n_estimators=100,       # Number of trees
    random_state=42        # For reproducibility
)
```

### Application Settings:
```python
app.secret_key = 'your-secret-key'  # Change in production
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Max file size
```

## 🚀 Deployment Options

### Local Development
- Use the built-in Flask development server
- Perfect for testing and development

### Production Deployment
- Use WSGI server like Gunicorn
- Deploy to cloud platforms (Heroku, AWS, Google Cloud)
- Set up proper environment variables
- Use production database instead of CSV files

### Docker Deployment
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

## 🧪 Testing

### Manual Testing
1. Test OAuth login/logout flow
2. Analyze sample reviews
3. Upload test CSV files
4. Verify model predictions

### Model Performance Testing
```python
# Check model accuracies
print("Model Accuracies:")
for model_name, accuracy in model_accuracies.items():
    print(f"{model_name}: {accuracy:.4f}")
```

## 🔐 Security Considerations

- OAuth tokens are stored in session
- File uploads are restricted to CSV format
- User authentication required for sensitive operations
- Input validation on all forms
- Secure session management

## 🐛 Troubleshooting

### Common Issues:

1. **OAuth Error**: Check Google API credentials
2. **Model Training Failed**: Verify dataset format
3. **Import Errors**: Install all requirements
4. **Permission Denied**: Check file permissions

### Debug Mode:
```python
app.run(debug=True)  # Shows detailed error messages
```

## 📈 Future Enhancements

- [ ] Advanced deep learning models (BERT, GPT)
- [ ] Real-time review scraping
- [ ] User feedback incorporation
- [ ] Advanced visualization dashboards
- [ ] Multi-language support
- [ ] API rate limiting
- [ ] Database integration
- [ ] Review clustering analysis

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make improvements
4. Test thoroughly
5. Submit pull request

## 📝 License

This project is open source and available under the MIT License.

## 📞 Support

For questions or issues:
- Check the troubleshooting section
- Review the code documentation
- Create an issue in the repository

---

**Built with ❤️ using Flask, scikit-learn, and modern web technologies**
