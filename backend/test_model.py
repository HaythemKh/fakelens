
from services.model_loader import load_model

model, device = load_model()

print("Modèle chargé avec succès !")
print("Device :", device)
print("Architecture :", model.__class__.__name__)
