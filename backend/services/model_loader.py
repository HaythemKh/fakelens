import torch
import timm
from pathlib import Path

def load_model():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model_path = (
        Path(__file__).resolve().parent.parent
        / "models"
        / "best_fakelens.pth"
    )

    model = timm.create_model(
        "efficientnet_b0",
        pretrained=False,
        num_classes=2
    )
    state_dict = torch.load(
        model_path,
        map_location=device,
        weights_only=True
    )

    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    return model, device