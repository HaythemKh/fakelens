# External Libraries

This folder contains external JavaScript libraries required by the extension.

## ONNX Runtime Web

To add ONNX Runtime Web for local model inference:

1. **Download from CDN or npm:**
   ```bash
   npm install onnxruntime-web
   # or download from:
   # https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/
   ```

2. **Copy required files here:**
   - `ort.min.js` - Main ONNX Runtime library
   - `ort-wasm.wasm` - WebAssembly backend
   - `ort-wasm-simd.wasm` - SIMD-enabled version (optional)

3. **Update manifest.json if needed:**
   Already configured in `web_accessible_resources`

## Usage in Content Script

```javascript
// Import ONNX Runtime
const ort = await import(chrome.runtime.getURL('libs/ort.min.js'));

// Create inference session
const modelUrl = chrome.runtime.getURL('models/model.onnx');
const session = await ort.InferenceSession.create(modelUrl);

// Run inference
const tensor = preprocessImage(imageData);
const results = await session.run({ input: tensor });
```

## Current Status

⏳ **Pending** - Library not yet added. Extension runs in mock mode.
