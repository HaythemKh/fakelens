# FakeLens Architecture

## Project Structure

```
fakelens/
├── extension/              # Browser Extension (Manifest V3)
│   └── models/            # ONNX models for local inference
│
├── backend/               # FastAPI Backend
│   ├── api/              # API endpoints
│   ├── models/           # Model loading and inference
│   └── utils/            # Grad-CAM and preprocessing
│
├── ai/                    # Machine Learning
│   ├── notebook/         # Training notebooks (Kaggle/Colab)
│   ├── models/           # Trained models and checkpoints
│   └── evaluation/       # Evaluation scripts and metrics
│
├── tests/                 # Test Images
│   ├── real/             # Real images for testing
│   └── fake/             # AI-generated images for testing
│
└── docs/                  # Documentation
    └── ARCHITECTURE.md    # This file
```

## System Overview

```
[Web Page] -> [Content Script] -> [Service Worker]
                |                          |
                v                          v
    [ONNX Runtime Web]           [FastAPI Backend]
    (Local Inference)              (Grad-CAM)
                |                          |
                v                          v
              [Popup/Overlay UI] <---------+
```

## Components

### 1. Browser Extension (extension/)
- **Manifest V3**: Modern extension architecture
- **Content Script**: Detects images on web pages
- **Service Worker**: Background tasks and API communication
- **Popup**: Settings and history display
- **ONNX Runtime Web**: Local model inference
- **models/**: Quantized ONNX models (<25MB)

### 2. Backend API (backend/)
- **FastAPI**: REST API server
- **Grad-CAM**: Visual explanation generation
- **PyTorch/ONNX Runtime**: Model inference
- Endpoints: /health, /predict, /explain

### 3. Machine Learning (ai/)
- **notebook/**: Training notebooks
  - EfficientNet-B0 fine-tuning
  - Data preprocessing pipelines
  - Export scripts
- **models/**: Trained models
  - PyTorch checkpoints (.pth)
  - ONNX models (.onnx)
  - Quantized models (INT8)
- **evaluation/**: Model evaluation
  - Test scripts
  - Metrics computation
  - Performance analysis

### 4. Test Data (tests/)
- **real/**: Real photos for validation
- **fake/**: AI-generated images
  - StyleGAN samples
  - Stable Diffusion outputs
  - Midjourney images

## Data Flow

1. User right-clicks on image
2. Content script captures image
3. Local ONNX inference runs in browser
4. Result displayed with verdict and score
5. (Optional) User requests Grad-CAM
6. Image sent to backend API
7. Backend generates heatmap
8. Heatmap overlaid on result

## Security & Privacy

- **Local-first**: Images stay in browser by default
- **Consent**: Explicit permission before sending to backend
- **No storage**: Backend doesn't store images
- **CORS**: Limited to extension only
