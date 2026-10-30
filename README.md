# FakeLens - AI-Generated Image Detector

<cite index="1-3,1-4,1-5,1-6">Browser extension powered by deep learning that analyzes images on web pages and flags those that are probably AI-generated, with visual explanation of results.</cite>

## 🎯 Project Overview

**Hackathon:** ByteForge - Level 2  
**Organization:** ESIP Gafsa · October 30-31, 2026  
**Team Size:** 4 people

## 🏗️ Project Structure

```
fakelens/
├── extension/          # Browser extension (Manifest V3)
│   └── models/        # ONNX models for local inference
├── backend/           # FastAPI backend
├── ai/               # Machine learning
│   ├── notebook/     # Training notebooks
│   ├── models/       # Trained models and checkpoints
│   └── evaluation/   # Evaluation scripts
├── tests/            # Test images
│   ├── real/        # Real photos
│   └── fake/        # AI-generated images
└── docs/            # Documentation
```

## 🚀 Features

### Core (Mandatory)
- Binary classifier: real vs AI-generated images
- Browser inference using ONNX Runtime Web
- Chrome/Edge extension with Manifest V3
- Verdict display with confidence score
- FastAPI backend for Grad-CAM heatmaps
- Visual explainability with Grad-CAM
- Transparency notice about probabilistic results

### Stretch Goals (Bonus)
- Colored badges on analyzed images
- "Analyze whole page" mode
- Session history
- Web upload page for testing
- Adjustable decision threshold
- Bilingual interface (FR/EN)
- Robustness testing on recompressed images

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Training | Python, PyTorch, Kaggle/Colab |
| Model | EfficientNet-B0 (ImageNet pre-trained) |
| Export | ONNX + INT8 quantization |
| Browser Inference | onnxruntime-web |
| Backend | FastAPI |
| Extension | Manifest V3 |
| Explainability | Grad-CAM |

## 📦 Installation

Coming soon...

## 🧪 Usage

Coming soon...

## 👥 Team Roles

- **ML Engineer**: Data, training, evaluation, ONNX export
- **Backend Engineer**: FastAPI, Grad-CAM, local deployment
- **Frontend/Extension**: Manifest V3, ONNX Web integration, UI
- **Product/Demo**: Use cases, test sets, slides, pitch

## 📊 Performance Targets

- Local inference: <1s per image
- Backend Grad-CAM: <3s response time
- ONNX model size: <25MB (INT8 quantized)
- Accuracy on 140K Faces: >95%
- Accuracy on CIFAKE/AI vs Human: >85%

## 📝 License

MIT License

## 🙏 Acknowledgments

Organized by ByteForge team, in partnership with ESIP, University of Gafsa, and Brainovus.
