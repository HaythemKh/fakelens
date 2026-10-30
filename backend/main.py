
from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
from io import BytesIO

app = FastAPI(
    title="FakeLens API",
    description="API for detecting AI-generated images",
    version="1.0.0"
)


# --------------------------------------------------
# 1. HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Welcome to FakeLens API",
        "status": "running"
    }


# --------------------------------------------------
# 2. HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "FakeLens API",
        "model_loaded": False
    }


# --------------------------------------------------
# IMAGE VALIDATION
# --------------------------------------------------

def validate_image(file: UploadFile):
    allowed_types = ["image/jpeg", "image/png", "image/webp"]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Unsupported image format. Use JPG, PNG or WEBP."
        )


# --------------------------------------------------
# 3. PREDICT ENDPOINT
# --------------------------------------------------

@app.post("/predict")
async def predict(file: UploadFile = File(...)):

    validate_image(file)

    try:
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes)).convert("RGB")

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file."
        )

    # Temporary simulated prediction
    # The real AI model will be integrated later.

    return {
        "filename": file.filename,
        "prediction": "fake",
        "confidence": 0.92,
        "message": "This is a simulated prediction. Model not connected yet."
    }


# --------------------------------------------------
# 4. EXPLAIN ENDPOINT
# --------------------------------------------------

@app.post("/explain")
async def explain(file: UploadFile = File(...)):

    validate_image(file)

    try:
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes)).convert("RGB")

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Invalid image file."
        )

    # Temporary simulated explanation
    # Grad-CAM or another explainability method
    # will be integrated with the real model later.

    return {
        "filename": file.filename,
        "explanation": "Simulated explanation. Grad-CAM is not connected yet.",
        "heatmap_available": False
    }
