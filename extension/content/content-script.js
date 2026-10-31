/**
 * FakeLens Content Script
 * Detects images and performs local ONNX inference
 */

console.log('FakeLens content script loaded');

let currentOverlay = null;

// Listen for analysis requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeImage') {
    handleImageAnalysis(request.imageUrl, request.pageUrl);
  }
});

async function handleImageAnalysis(imageUrl, pageUrl) {
  try {
    showLoadingOverlay();
    
    // Load and validate image
    const imageData = await loadImageAsDataURL(imageUrl);
    const settings = await getSettings();
    
    // Perform local ONNX inference
    const prediction = await performLocalInference(imageData);
    
    // Determine verdict
    const verdict = determineVerdict(prediction.score, settings);
    
    const result = {
      verdict,
      score: prediction.score,
      imageUrl,
      pageUrl,
      imageData,  // Add image data for display
      hasGradCAM: false
    };
    
    showResultOverlay(result, imageData);
    
    // Save to history
    chrome.runtime.sendMessage({ action: 'saveToHistory', data: result });
    
  } catch (error) {
    console.error('Analysis failed:', error);
    showErrorOverlay(error.message);
  }
}

function loadImageAsDataURL(imageUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      if (img.width < 64 || img.height < 64) {
        reject(new Error('Image trop petite (minimum 64x64 pixels)'));
        return;
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const dataURL = canvas.toDataURL('image/jpeg', 0.95);
      const sizeInMB = (dataURL.length * 3/4) / (1024 * 1024);
      
      if (sizeInMB > 5) {
        reject(new Error('Image trop volumineuse (maximum 5 Mo)'));
        return;
      }
      
      resolve(dataURL);
    };
    
    img.onerror = () => reject(new Error('Impossible de charger l\'image'));
    img.src = imageUrl;
  });
}

/**
 * Perform inference by calling backend API
 * Sends image to /predict endpoint and returns score
 */
async function performLocalInference(imageData) {
  console.log('Calling backend API for prediction...');
  const startTime = performance.now();
  
  try {
    // Convert data URL to blob
    const blob = await (await fetch(imageData)).blob();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', blob, 'image.jpg');
    
    // Call backend API
    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    const processingTime = performance.now() - startTime;
    
    console.log(`Prediction received: probability=${result.probability.toFixed(3)}`);
    
    return {
      score: result.probability,  // Use probability (0-1), not score (0-100)
      processingTime: Math.round(processingTime),
      isMock: result.is_mock || false
    };
    
  } catch (error) {
    console.error('Backend API call failed:', error);
    
    // Show error to user
    throw new Error(`Backend non disponible. Vérifiez que le serveur tourne sur http://localhost:8000\n\nErreur: ${error.message}`);
  }
}

function determineVerdict(score, settings) {
  if (score < settings.threshold_low) return 'real';
  if (score > settings.threshold_high) return 'generated';
  return 'uncertain';
}

async function getSettings() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ action: 'getSettings' }, response => {
      resolve(response || {
        threshold_low: 0.3,
        threshold_high: 0.7,
        language: 'fr'
      });
    });
  });
}

function showLoadingOverlay() {
  removeCurrentOverlay();
  const overlay = createOverlay();
  overlay.innerHTML = `
    <div class="fakelens-loading">
      <div class="fakelens-spinner"></div>
      <p>Analyse en cours...</p>
    </div>
  `;
  document.body.appendChild(overlay);
  currentOverlay = overlay;
}

function showResultOverlay(result, imageData) {
  removeCurrentOverlay();
  const overlay = createOverlay();
  const info = getVerdictInfo(result.verdict);
  
  overlay.innerHTML = `
    <div class="fakelens-result ${info.class}">
      <div class="fakelens-header">
        <h3>🔍 FakeLens</h3>
        <button class="fakelens-close">&times;</button>
      </div>
      
      <div class="fakelens-content">
        <div class="fakelens-image-preview">
          <img src="${imageData}" alt="Analyzed image" class="fakelens-analyzed-image" />
        </div>
        
        <div class="fakelens-verdict">
          <span class="fakelens-verdict-icon">${info.icon}</span>
          <span class="fakelens-verdict-text">${info.label}</span>
        </div>
        
        <div class="fakelens-score">
          <div class="fakelens-score-label">Score de confiance</div>
          <div class="fakelens-score-bar">
            <div class="fakelens-score-fill ${info.class}" style="width: ${result.score * 100}%"></div>
          </div>
          <div class="fakelens-score-value">${(result.score * 100).toFixed(1)}%</div>
        </div>
        
        <div class="fakelens-notice">
          ⚠️ Ce résultat est probabiliste. La carte de chaleur montre où le modèle "regarde".
        </div>
        
        <button class="fakelens-gradcam-btn" id="fakelens-request-gradcam">
          🔥 Voir la carte de chaleur (Grad-CAM)
        </button>
        
        <div class="fakelens-actions">
          <button class="fakelens-btn-secondary" id="fakelens-close-btn">Fermer</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  currentOverlay = overlay;
  
  overlay.querySelector('.fakelens-close').addEventListener('click', removeCurrentOverlay);
  overlay.querySelector('#fakelens-close-btn').addEventListener('click', removeCurrentOverlay);
  overlay.querySelector('#fakelens-request-gradcam').addEventListener('click', () => {
    requestGradCAM(result, imageData);
  });
  overlay.addEventListener('click', e => {
    if (e.target === overlay) removeCurrentOverlay();
  });
}

function showErrorOverlay(errorMessage) {
  removeCurrentOverlay();
  const overlay = createOverlay();
  
  overlay.innerHTML = `
    <div class="fakelens-result fakelens-error">
      <div class="fakelens-header">
        <h3>🔍 FakeLens</h3>
        <button class="fakelens-close">&times;</button>
      </div>
      
      <div class="fakelens-content">
        <div class="fakelens-error-icon">⚠️</div>
        <h4>Erreur d'analyse</h4>
        <p>${errorMessage}</p>
        
        <div class="fakelens-actions">
          <button class="fakelens-btn-secondary" id="fakelens-close-btn">Fermer</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  currentOverlay = overlay;
  
  overlay.querySelector('.fakelens-close').addEventListener('click', removeCurrentOverlay);
  overlay.querySelector('#fakelens-close-btn').addEventListener('click', removeCurrentOverlay);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) removeCurrentOverlay();
  });
}

async function requestGradCAM(result, imageData) {
  const button = document.querySelector('#fakelens-request-gradcam');
  if (button) {
    button.disabled = true;
    button.textContent = '⏳ Génération...';
  }
  
  chrome.runtime.sendMessage({
    action: 'requestGradCAM',
    imageData
  }, response => {
    if (response.error) {
      alert(`Backend injoignable.\nL'inférence locale fonctionne, mais Grad-CAM nécessite le backend.`);
      if (button) {
        button.disabled = false;
        button.textContent = '🔥 Voir la carte de chaleur';
      }
    } else {
      displayGradCAM(response.heatmap_png_base64);
    }
  });
}

function displayGradCAM(heatmapBase64) {
  const container = document.createElement('div');
  container.className = 'fakelens-gradcam-container';
  container.innerHTML = `
    <div class="fakelens-gradcam-header">
      <h4>🔥 Carte de chaleur Grad-CAM</h4>
      <p>Les zones rouges montrent où le modèle a regardé.</p>
    </div>
    <img src="data:image/png;base64,${heatmapBase64}" alt="Heatmap" class="fakelens-gradcam-image" />
  `;
  
  const content = document.querySelector('.fakelens-content');
  if (content) {
    document.querySelector('#fakelens-request-gradcam')?.remove();
    content.insertBefore(container, document.querySelector('.fakelens-actions'));
  }
}

function getVerdictInfo(verdict) {
  const verdicts = {
    real: { label: 'Image Réelle', icon: '✅', class: 'fakelens-real' },
    generated: { label: 'Probablement Générée par IA', icon: '🤖', class: 'fakelens-generated' },
    uncertain: { label: 'Incertain', icon: '❓', class: 'fakelens-uncertain' }
  };
  return verdicts[verdict] || verdicts.uncertain;
}

function createOverlay() {
  const overlay = document.createElement('div');
  overlay.className = 'fakelens-overlay';
  return overlay;
}

function removeCurrentOverlay() {
  if (currentOverlay) {
    currentOverlay.remove();
    currentOverlay = null;
  }
}
