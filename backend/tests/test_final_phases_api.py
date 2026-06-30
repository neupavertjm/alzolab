"""Contratos HTTP de terminología, KWIC y exportación."""

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_terminology_endpoint_returns_ranked_terms():
    response = client.post(
        "/api/terminology",
        json={
            "documents": [
                {
                    "id": "demo",
                    "text": "El análisis textual estudia textos. El análisis textual estudia textos.",
                }
            ],
            "min_words": 2,
            "max_words": 3,
            "min_frequency": 2,
            "top_n": 10,
        },
    )
    assert response.status_code == 200
    assert any(term["term"] == "análisis textual" for term in response.json()["terms"])


def test_concordance_endpoint_preserves_document_metadata():
    response = client.post(
        "/api/concordance",
        json={
            "documents": [{"id": "d1", "label": "demo.txt", "text": "Uno corpus dos."}],
            "query": "CORPUS",
            "window": 1,
            "max_results": 10,
        },
    )
    assert response.status_code == 200
    assert response.json()["results"][0] == {
        "document_id": "d1",
        "document_label": "demo.txt",
        "left": "Uno",
        "node": "corpus",
        "right": "dos",
    }


def test_export_endpoint_sets_download_headers_for_every_format():
    document = {"id": "1", "modo": "Archivo", "url": "demo.txt", "fecha": "2026", "texto": "café"}
    for file_format in ("txt", "json", "csv"):
        response = client.post(
            "/api/export",
            json={"kind": "corpus", "format": file_format, "documents": [document]},
        )
        assert response.status_code == 200
        assert f"alzolab-corpus.{file_format}" in response.headers["content-disposition"]
        assert response.content


def test_export_accepts_full_analysis_contract():
    analysis = client.post(
        "/api/analyze",
        json={"documents": [{"id": "demo", "text": "El corpus contiene textos."}]},
    ).json()
    response = client.post(
        "/api/export",
        json={"kind": "analysis", "format": "csv", "analysis": analysis},
    )
    assert response.status_code == 200
    assert response.content.startswith(b"\xef\xbb\xbftoken,lemma,pos,tag,morph")
    assert "alzolab-analysis.csv" in response.headers["content-disposition"]
