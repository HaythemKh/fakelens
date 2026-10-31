/**
 * FakeLens Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await checkBackendStatus();
  await loadHistory();
  setupEventListeners();
});

async function loadSettings() {
  chrome.runtime.sendMessage({ action: 'getSettings' }, settings => {
    if (settings) {
      document.getElementById('threshold-low').value = settings.threshold_low || 0.3;
      document.getElementById('threshold-high').value = settings.threshold_high || 0.7;
      document.getElementById('auto-gradcam').checked = settings.auto_gradcam || false;
      
      updateThresholdDisplays();
    }
  });
}

function setupEventListeners() {
  // Threshold sliders
  document.getElementById('threshold-low').addEventListener('input', updateThresholdDisplays);
  document.getElementById('threshold-high').addEventListener('input', updateThresholdDisplays);
  
  // Save settings
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // Clear history
  document.getElementById('clear-history').addEventListener('click', clearHistory);
}

function updateThresholdDisplays() {
  const low = document.getElementById('threshold-low').value;
  const high = document.getElementById('threshold-high').value;
  
  document.getElementById('threshold-low-value').textContent = parseFloat(low).toFixed(2);
  document.getElementById('threshold-high-value').textContent = parseFloat(high).toFixed(2);
}

async function saveSettings() {
  const settings = {
    threshold_low: parseFloat(document.getElementById('threshold-low').value),
    threshold_high: parseFloat(document.getElementById('threshold-high').value),
    auto_gradcam: document.getElementById('auto-gradcam').checked
  };
  
  chrome.runtime.sendMessage({ 
    action: 'updateSettings', 
    settings 
  }, response => {
    if (response.success) {
      const btn = document.getElementById('save-settings');
      btn.textContent = '✓ Enregistré';
      setTimeout(() => {
        btn.textContent = 'Enregistrer';
      }, 2000);
    }
  });
}

async function checkBackendStatus() {
  chrome.runtime.sendMessage({ action: 'checkBackendHealth' }, response => {
    const statusEl = document.getElementById('backend-status');
    const dot = statusEl.querySelector('.status-dot');
    
    if (response.available) {
      statusEl.innerHTML = '<span class="status-dot online"></span> En ligne';
    } else {
      statusEl.innerHTML = '<span class="status-dot offline"></span> Hors ligne';
    }
  });
  
  // Mock model status (will be real when ONNX is implemented)
  const modelEl = document.getElementById('model-status');
  modelEl.innerHTML = '<span class="status-dot online"></span> Prêt (mock)';
}

async function loadHistory() {
  chrome.runtime.sendMessage({ action: 'getHistory' }, history => {
    const listEl = document.getElementById('history-list');
    
    if (!history || history.length === 0) {
      listEl.innerHTML = '<p class="empty-state">Aucune analyse pour le moment</p>';
      return;
    }
    
    listEl.innerHTML = history.slice(0, 10).map(item => {
      const time = new Date(item.timestamp).toLocaleTimeString('fr-FR');
      const verdictLabels = {
        real: 'Réelle',
        generated: 'Générée',
        uncertain: 'Incertain'
      };
      
      // Generate thumbnail if imageData exists
      const thumbnail = item.imageData ? 
        `<img src="${item.imageData}" alt="Thumbnail" class="history-thumbnail" />` : 
        '<div class="history-no-thumb">🖼️</div>';
      
      return `
        <div class="history-item">
          <div class="history-item-content">
            ${thumbnail}
            <div class="history-item-details">
              <div class="history-item-verdict ${item.verdict}">
                ${verdictLabels[item.verdict]} (${(item.score * 100).toFixed(1)}%)
              </div>
              <div class="history-item-time">${time}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  });
}

async function clearHistory() {
  if (confirm('Effacer tout l\'historique ?')) {
    chrome.runtime.sendMessage({ action: 'clearHistory' }, () => {
      loadHistory();
    });
  }
}
