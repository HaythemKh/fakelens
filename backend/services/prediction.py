import torch
from PIL import Image
from torchvision import transforms

from services.model_loader import load_model

model, device = load_model()

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def predict_image(image: Image.Image):
    image = image.convert("RGB")
    tensor = preprocess(image).unsqueeze(0).to(device)

    with torch.no_grad():
        logit = model(tensor)
        probability = torch.sigmoid(logit).item()

    return {
        "score": round(probability * 100, 2),
        "probability": probability
    }