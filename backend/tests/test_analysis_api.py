"""Integración del modelo español, el contrato HTTP y la caché."""

from fastapi.testclient import TestClient

from app.core.analysis import clear_analysis_cache
from app.main import app


client = TestClient(app)


def test_analyze_returns_structured_data_and_uses_cache():
    clear_analysis_cache()
    payload = {"documents": [{"id": "demo", "text": "Los gatos negros comen pescado fresco."}]}
    first = client.post("/api/analyze", json=payload)
    second = client.post("/api/analyze", json=payload)

    assert first.status_code == 200
    data = first.json()
    assert data["cached"] is False
    assert data["tokens"][0].keys() == {"token", "lemma", "pos", "tag", "morph"}
    assert data["metrics"]["words"] == 6
    assert any(item["label"] == "NOUN" for item in data["pos_distribution"])
    assert second.json()["cached"] is True
    assert second.json()["corpus_hash"] == data["corpus_hash"]


def test_analyze_rejects_empty_documents():
    response = client.post("/api/analyze", json={"documents": []})
    assert response.status_code == 422
