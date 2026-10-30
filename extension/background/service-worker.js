/**
 * FakeLens Service Worker
 * Handles context menu, messages between components, and backend communication
 */

const API_BASE_URL = 'http://localhost:8000';
const CONTEXT_MENU_ID = 'fakelens-verify-image';

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('FakeLens extension installed');
  
  // Create context menu
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: 'Vérifier cette image (FakeLens)',
    contexts: ['image']
  });
  
  // Initialize default settings
  chrome.storage.local.set({
    history: [],
    settings: {
      threshold_low: 0.3,
      threshold_high: 0.7,
      language: 'fr',
      auto_gradcam: false
    }
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === CONTEXT_MENU_ID) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'analyzeImage',
      imageUrl: info.srcUrl,
      pageUrl: info.pageUrl
    });
  }
});

// Handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'checkBackendHealth':
      checkBackendHealth().then(sendResponse);
      return true;
      
    case 'requestGradCAM':
      requestGradCAM(request.imageData).then(sendResponse);
      return true;
      
    case 'saveToHistory':
      saveToHistory(request.data).then(sendResponse);
      return true;
      
    case 'getHistory':
      getHistory().then(sendResponse);
      return true;
      
    case 'getSettings':
      getSettings().then(sendResponse);
      return true;
      
    case 'updateSettings':
      updateSettings(request.settings).then(sendResponse);
      return true;
  }
});

async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      return { available: true, data: await response.json() };
    }
    return { available: false };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

async function requestGradCAM(imageData) {
  try {
    const blob = await (await fetch(imageData)).blob();
    const formData = new FormData();
    formData.append('image', blob, 'image.jpg');
    
    const response = await fetch(`${API_BASE_URL}/explain`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) throw new Error(`Backend error: ${response.status}`);
    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function saveToHistory(data) {
  const { history = [] } = await chrome.storage.local.get(['history']);
  data.timestamp = new Date().toISOString();
  history.unshift(data);
  if (history.length > 50) history.splice(50);
  await chrome.storage.local.set({ history });
  return { success: true };
}

async function getHistory() {
  const { history = [] } = await chrome.storage.local.get(['history']);
  return history;
}

async function getSettings() {
  const { settings } = await chrome.storage.local.get(['settings']);
  return settings || {};
}

async function updateSettings(newSettings) {
  const { settings } = await chrome.storage.local.get(['settings']);
  await chrome.storage.local.set({ settings: { ...settings, ...newSettings } });
  return { success: true };
}
