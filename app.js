// Application Data
const appData = {
    models: [
        { name: "Random Forest", accuracy: 0.89, description: "Best overall performance with ensemble learning" },
        { name: "Logistic Regression", accuracy: 0.86, description: "Fast and interpretable linear model" },
        { name: "SVM", accuracy: 0.88, description: "Effective for high-dimensional text data" }
    ],
    sampleReviews: {
        real: [
            {
                text: "The headphones are decent for the price. Sound quality is good but not exceptional. The bass could be stronger.",
                characteristics: ["Balanced feedback", "Specific details", "Moderate tone"]
            },
            {
                text: "Good value for money. The material feels solid and the design is nice. Minor issues with the packaging.",
                characteristics: ["Mentions pros and cons", "Specific observations", "Natural language"]
            },
            {
                text: "I've been using this for 3 weeks now. Overall satisfied with the purchase. Customer service was helpful when I had questions.",
                characteristics: ["Time context", "Balanced review", "Specific experience"]
            }
        ],
        fake: [
            {
                text: "OMG this is the BEST product ever! I bought 5 of them and they're all perfect! Amazing quality and super fast shipping!",
                characteristics: ["Excessive superlatives", "Multiple exclamation marks", "Overly promotional"]
            },
            {
                text: "Absolutely incredible! This product changed my life! Everyone should buy this immediately! Perfect in every way!",
                characteristics: ["Extreme language", "Generic praise", "Promotional tone"]
            },
            {
                text: "AMAZING product! I love it so much! Best purchase ever! The seller is fantastic and shipping was lightning fast!",
                characteristics: ["All caps words", "Repetitive praise", "Perfect experience claim"]
            }
        ]
    }
};

// Application state
let currentSection = 'home';
let analysisHistory = [];

// DOM Elements
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');
const reviewTextarea = document.getElementById('review-text');
const charCount = document.getElementById('char-count');
const analyzeBtn = document.getElementById('analyze-btn');
const analysisResults = document.getElementById('analysis-results');
const modelSelect = document.getElementById('model-select');
const loadingOverlay = document.getElementById('loading-overlay');
const csvFile = document.getElementById('csv-file');
const uploadArea = document.getElementById('upload-area');
const batchProgress = document.getElementById('batch-progress');
const batchResults = document.getElementById('batch-results');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAnalysis();
    initializeBatchUpload();
    initializeSamples();
    setupActionButtons();
});

// Navigation
function initializeNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetSection = e.target.getAttribute('data-section');
            showSection(targetSection);
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
    }
    
    // Update navigation
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        }
    });
}

// Analysis functionality
function initializeAnalysis() {
    if (reviewTextarea) {
        reviewTextarea.addEventListener('input', updateCharacterCount);
        reviewTextarea.addEventListener('input', debounce(handleRealtimeAnalysis, 1000));
    }
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', handleAnalysis);
    }
}

function updateCharacterCount() {
    if (charCount && reviewTextarea) {
        charCount.textContent = reviewTextarea.value.length;
    }
}

function handleRealtimeAnalysis() {
    const text = reviewTextarea.value.trim();
    if (text.length > 50) {
        // Only show real-time analysis for longer texts
        // This would normally call your ML API
        console.log('Real-time analysis for:', text.substring(0, 50) + '...');
    }
}

function handleAnalysis() {
    const text = reviewTextarea.value.trim();
    const selectedModel = modelSelect.value;
    
    if (!text) {
        alert('Please enter a review to analyze.');
        return;
    }
    
    showLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
        const result = analyzeReview(text, selectedModel);
        displayAnalysisResult(result);
        showLoading(false);
        
        // Add to history
        analysisHistory.push({
            text: text,
            result: result,
            timestamp: new Date(),
            model: selectedModel
        });
    }, 1500);
}

function analyzeReview(text, model) {
    // Simulate ML model prediction
    const fakeKeywords = ['amazing', 'perfect', 'best', 'incredible', 'fantastic', '!!!', 'love it'];
    const realKeywords = ['decent', 'good', 'okay', 'satisfied', 'issues', 'problems', 'weeks', 'months'];
    
    let fakeScore = 0;
    let realScore = 0;
    
    const lowerText = text.toLowerCase();
    
    fakeKeywords.forEach(keyword => {
        const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
        fakeScore += matches;
    });
    
    realKeywords.forEach(keyword => {
        const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
        realScore += matches;
    });
    
    // Add some randomness and model-specific adjustments
    const modelMultiplier = {
        'random-forest': 1.0,
        'logistic-regression': 0.95,
        'svm': 0.98
    };
    
    fakeScore *= modelMultiplier[model] || 1.0;
    const totalScore = fakeScore + realScore + 1; // Avoid division by zero
    const fakeProbability = (fakeScore + Math.random() * 0.3) / totalScore;
    
    const isFake = fakeProbability > 0.5;
    const confidence = Math.abs(fakeProbability - 0.5) * 2;
    
    return {
        isFake: isFake,
        confidence: Math.min(0.95, Math.max(0.55, confidence)),
        fakeProbability: Math.min(0.95, Math.max(0.05, fakeProbability)),
        realProbability: 1 - fakeProbability,
        model: model,
        modelInfo: appData.models.find(m => m.name.toLowerCase().replace(' ', '-') === model)
    };
}

function displayAnalysisResult(result) {
    const resultsContainer = analysisResults;
    
    resultsContainer.innerHTML = `
        <div class="results-content show">
            <div class="prediction-result">
                <div class="prediction-label ${result.isFake ? 'fake' : 'real'}">
                    ${result.isFake ? '🚩 Likely Fake' : '✅ Likely Real'}
                </div>
                <div class="confidence-score">
                    Confidence: ${(result.confidence * 100).toFixed(1)}%
                </div>
                <div class="confidence-bar">
                    <div class="confidence-fill ${result.isFake ? 'fake' : 'real'}" 
                         style="width: ${result.confidence * 100}%"></div>
                </div>
            </div>
            
            <div class="probability-breakdown">
                <h4>Probability Breakdown:</h4>
                <div style="margin-bottom: 8px;">
                    <span>Fake: ${(result.fakeProbability * 100).toFixed(1)}%</span>
                    <div class="confidence-bar" style="height: 6px; margin-top: 4px;">
                        <div class="confidence-fill fake" style="width: ${result.fakeProbability * 100}%"></div>
                    </div>
                </div>
                <div>
                    <span>Real: ${(result.realProbability * 100).toFixed(1)}%</span>
                    <div class="confidence-bar" style="height: 6px; margin-top: 4px;">
                        <div class="confidence-fill real" style="width: ${result.realProbability * 100}%"></div>
                    </div>
                </div>
            </div>
            
            <div class="model-info">
                <h4>Model: ${result.modelInfo.name}</h4>
                <p><strong>Accuracy:</strong> ${(result.modelInfo.accuracy * 100).toFixed(1)}%</p>
                <p><strong>Description:</strong> ${result.modelInfo.description}</p>
            </div>
        </div>
    `;
}

// Batch upload functionality
function initializeBatchUpload() {
    if (csvFile) {
        csvFile.addEventListener('change', handleFileSelect);
    }
    
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleFileDrop);
        uploadArea.addEventListener('click', () => csvFile?.click());
    }
    
    const exportBtn = document.getElementById('export-results');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportResults);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleFileDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect({ target: { files: files } });
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Please select a CSV file.');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB.');
        return;
    }
    
    processCSVFile(file);
}

function processCSVFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const csv = e.target.result;
        const rows = parseCSV(csv);
        
        if (rows.length === 0) {
            alert('The CSV file appears to be empty.');
            return;
        }
        
        processBatchAnalysis(rows);
    };
    
    reader.readAsText(file);
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const reviewColumnIndex = headers.findIndex(h => 
        h.includes('review') || h.includes('text') || h.includes('comment')
    );
    
    if (reviewColumnIndex === -1) {
        alert('Could not find a review column. Please ensure your CSV has a column named "review", "text", or "comment".');
        return [];
    }
    
    const reviews = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            const columns = line.split(',');
            if (columns[reviewColumnIndex]) {
                reviews.push(columns[reviewColumnIndex].replace(/"/g, '').trim());
            }
        }
    }
    
    return reviews;
}

function processBatchAnalysis(reviews) {
    document.getElementById('upload-area').style.display = 'none';
    batchProgress.style.display = 'block';
    
    const progressFill = document.getElementById('progress-fill');
    const progressCurrent = document.getElementById('progress-current');
    const progressTotal = document.getElementById('progress-total');
    
    progressTotal.textContent = reviews.length;
    
    const results = [];
    let processed = 0;
    
    const processNext = () => {
        if (processed >= reviews.length) {
            displayBatchResults(results);
            return;
        }
        
        const review = reviews[processed];
        const result = analyzeReview(review, 'random-forest');
        
        results.push({
            review: review,
            ...result
        });
        
        processed++;
        progressCurrent.textContent = processed;
        progressFill.style.width = `${(processed / reviews.length) * 100}%`;
        
        // Simulate processing delay
        setTimeout(processNext, 100);
    };
    
    processNext();
}

function displayBatchResults(results) {
    batchProgress.style.display = 'none';
    batchResults.style.display = 'block';
    
    const fakeCount = results.filter(r => r.isFake).length;
    const realCount = results.length - fakeCount;
    
    const summaryDiv = document.getElementById('results-summary');
    summaryDiv.innerHTML = `
        <h4>Analysis Summary</h4>
        <p><strong>Total Reviews:</strong> ${results.length}</p>
        <p><strong>Fake Reviews:</strong> ${fakeCount} (${((fakeCount / results.length) * 100).toFixed(1)}%)</p>
        <p><strong>Real Reviews:</strong> ${realCount} (${((realCount / results.length) * 100).toFixed(1)}%)</p>
    `;
    
    const tbody = document.getElementById('results-tbody');
    tbody.innerHTML = results.map(result => `
        <tr>
            <td>${result.review.substring(0, 50)}${result.review.length > 50 ? '...' : ''}</td>
            <td class="prediction-cell ${result.isFake ? 'fake' : 'real'}">
                ${result.isFake ? 'Fake' : 'Real'}
            </td>
            <td>${(result.confidence * 100).toFixed(1)}%</td>
            <td>Random Forest</td>
        </tr>
    `).join('');
    
    // Store results for export
    window.batchAnalysisResults = results;
}

function exportResults() {
    if (!window.batchAnalysisResults) {
        alert('No results to export.');
        return;
    }
    
    const results = window.batchAnalysisResults;
    const csvContent = [
        'Review,Prediction,Confidence,Fake Probability,Real Probability,Model',
        ...results.map(r => `
            "${r.review.replace(/"/g, '""')}",
            ${r.isFake ? 'Fake' : 'Real'},
            ${(r.confidence * 100).toFixed(1)}%,
            ${(r.fakeProbability * 100).toFixed(1)}%,
            ${(r.realProbability * 100).toFixed(1)}%,
            Random Forest
        `.replace(/\s+/g, ' ').trim())
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Sample reviews
function initializeSamples() {
    const realSamplesContainer = document.getElementById('real-samples');
    const fakeSamplesContainer = document.getElementById('fake-samples');
    
    if (realSamplesContainer) {
        realSamplesContainer.innerHTML = appData.sampleReviews.real.map(sample => 
            createSampleCard(sample, 'real')
        ).join('');
    }
    
    if (fakeSamplesContainer) {
        fakeSamplesContainer.innerHTML = appData.sampleReviews.fake.map(sample => 
            createSampleCard(sample, 'fake')
        ).join('');
    }
}

function createSampleCard(sample, type) {
    return `
        <div class="sample-card">
            <div class="sample-text">"${sample.text}"</div>
            <div class="sample-characteristics">
                <h4>Key Characteristics:</h4>
                <div class="characteristics-list">
                    ${sample.characteristics.map(char => 
                        `<span class="characteristic-tag">${char}</span>`
                    ).join('')}
                </div>
            </div>
            <div class="sample-actions">
                <button class="btn btn--sm btn--outline" onclick="analyzeSample('${sample.text.replace(/'/g, "\\'")}')">Analyze This Review</button>
            </div>
        </div>
    `;
}

window.analyzeSample = function(text) {
    showSection('analyze');
    if (reviewTextarea) {
        reviewTextarea.value = text;
        updateCharacterCount();
    }
};

// Action buttons
function setupActionButtons() {
    const actionButtons = document.querySelectorAll('[data-action]');
    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            showSection(action);
        });
    });
    
    const downloadSampleBtn = document.getElementById('download-sample');
    if (downloadSampleBtn) {
        downloadSampleBtn.addEventListener('click', downloadSampleCSV);
    }
}

function downloadSampleCSV() {
    const sampleData = [
        'review,actual_label',
        '"Great product, really happy with my purchase. Good value for money.",real',
        '"AMAZING!!! Best product EVER!!! Everyone should buy this NOW!!!",fake',
        '"Decent quality for the price. Some minor issues but overall satisfied.",real',
        '"Perfect in every way! Changed my life! 5 stars!!!",fake',
        '"I\'ve been using this for 2 months. Works as expected, no major complaints.",real'
    ].join('\n');
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_reviews.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Utility functions
function showLoading(show) {
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.add('show');
        } else {
            loadingOverlay.classList.remove('show');
        }
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    console.log('ReviewGuard AI Application Initialized');
    console.log('Features available: Single review analysis, Batch processing, Sample reviews, Dashboard');
}