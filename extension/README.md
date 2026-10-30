# FakeLens Browser Extension

Chrome/Edge extension for detecting AI-generated images.

## 📁 Structure

```
extension/
├── manifest.json           # Extension configuration (Manifest V3)
├── background/
│   └── service-worker.js  # Background tasks, context menu, API communication
├── content/
│   ├── content-script.js  # Image detection and local inference
│   └── content-style.css  # Overlay styles
├── popup/
│   ├── popup.html        # Extension popup UI
│   ├── popup.js          # Popup functionality
│   └── popup.css         # Popup styles
├── icons/                # Extension icons (16, 32, 48, 128)
├── models/               # ONNX models for local inference
└── libs/                 # ONNX Runtime Web library
```

## 🚀 Installation (Developer Mode)

1. Open Chrome/Edge
2. Navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `extension/` folder

## ✨ Features

### Core (Implemented)
- ✅ Right-click context menu "Vérifier cette image"
- ✅ Local inference in browser (mock - ONNX integration pending)
- ✅ Verdict display with confidence score
- ✅ Three-state classification (Real, Generated, Uncertain)
- ✅ Adjustable thresholds
- ✅ Session history
- ✅ Backend communication for Grad-CAM
- ✅ Error handling
- ✅ Privacy-first (image stays in browser by default)

### Pending
- ⏳ ONNX Runtime Web integration
- ⏳ Model loading and preprocessing (224x224, ImageNet normalization)
- ⏳ Real icons (currently using placeholders)

## 🎯 Usage

1. Navigate to any webpage with images
2. Right-click on an image
3. Select "Vérifier cette image (FakeLens)"
4. View the analysis result
5. (Optional) Request Grad-CAM heatmap

## ⚙️ Configuration

Open the extension popup to:
- Adjust decision thresholds
- View analysis history
- Check backend status
- Clear history

## 🔧 Development

### Testing
1. Make changes to any file
2. Go to `chrome://extensions/`
3. Click the reload icon on FakeLens card
4. Test on a webpage

### Mock Mode
Currently, the extension runs in mock mode:
- Random prediction scores (0-1)
- No actual model inference
- All UI and workflows functional

## 📝 Next Steps

1. **Add ONNX Runtime Web**
   - Download `onnxruntime-web` library to `libs/`
   - Implement preprocessing pipeline
   - Load model from `models/`

2. **Create Icons**
   - Design 16x16, 32x32, 48x48, 128x128 PNG icons
   - Place in `icons/` folder

3. **Real Model Integration**
   - Export trained model to ONNX
   - Quantize to INT8 (<25MB)
   - Place in `models/` folder

## 🛠️ Tech Stack

- Manifest V3
- Vanilla JavaScript
- CSS3
- ONNX Runtime Web (pending)
- Chrome Extension APIs
