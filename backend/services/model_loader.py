
import torch
import torch.nn as nn
import timm
from pathlib import Path


class FakeLensEfficientNet(nn.Module):
    def __init__(self):
        super().__init__()

        self.backbone = timm.create_model(
            "efficientnet_b0",
            pretrained=False,
            num_classes=0
        )

        in_features = self.backbone.num_features

        self.classifier = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.BatchNorm1d(512),
            nn.SiLU(),
            nn.Dropout(0.3),

            nn.Linear(512, 128),
            nn.BatchNorm1d(128),
            nn.SiLU(),
            nn.Dropout(0.3),

            nn.Linear(128, 1)
        )

    def forward(self, x):
        features = self.backbone(x)
        return self.classifier(features)


def load_model():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model_path = (
        Path(__file__).resolve().parent.parent
        / "models"
        / "best_fakelens.pth"
    )

    model = FakeLensEfficientNet()

    state_dict = torch.load(
        model_path,
        map_location=device,
        weights_only=True
    )

    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()

    return model, device
