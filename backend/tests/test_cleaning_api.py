"""Contrato HTTP de la fase Limpiar."""

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_preview_returns_before_after_without_persistence():
    response = client.post(
        "/api/clean/preview",
        json={
            "documents": [{"id": "doc-1", "text": "Texto [12]"}],
            "rules": [
                {
                    "label": "Referencias",
                    "regex": r"\[\d+\]",
                    "replacement": "",
                }
            ],
        },
    )
    assert response.status_code == 200
    document = response.json()["documents"][0]
    assert document == {
        "id": "doc-1",
        "before": "Texto [12]",
        "after": "Texto ",
        "changed": True,
        "replacements": 1,
    }


def test_presets_are_reusable_rules():
    response = client.get("/api/clean/presets")
    assert response.status_code == 200
    preset_ids = {preset["id"] for preset in response.json()}
    assert {"references", "urls", "emails", "spaces"} <= preset_ids
