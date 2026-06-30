"""Comportamiento bilingüe: modelo inglés, caché por idioma y corpus de ejemplo."""

from fastapi.testclient import TestClient

from app.core.analysis import analyze_text, clear_analysis_cache
from app.core.sample_data import build_sample_corpus
from app.main import app

client = TestClient(app)


def test_english_analysis_lemmatises_in_english():
    clear_analysis_cache()
    payload = {"documents": [{"id": "en", "text": "The cats are running fast."}], "lang": "en"}
    data = client.post("/api/analyze", json=payload).json()
    lemmas = {item["label"] for item in data["lemmas"]}
    # Lemas en inglés: 'cats' -> 'cat', 'running' -> 'run' (las stopwords se excluyen).
    assert "cat" in lemmas
    assert "run" in lemmas


def test_cache_is_keyed_by_language():
    clear_analysis_cache()
    text = "Data drives modern language analysis."
    _, cached_en_first = analyze_text(text, "en")
    _, cached_en_second = analyze_text(text, "en")
    _, cached_es = analyze_text(text, "es")
    assert cached_en_first is False  # primer análisis en inglés
    assert cached_en_second is True  # mismo (idioma, texto) -> cacheado
    assert cached_es is False  # mismo texto pero otro idioma -> entrada distinta


def test_sample_corpus_differs_by_language():
    es = build_sample_corpus("es")
    en = build_sample_corpus("en")
    assert len(es) == len(en) == 3
    assert es[0]["modo"] == "Ejemplo"
    assert en[0]["modo"] == "Sample"
    assert es[0]["id"].startswith("sample-es-")
    assert en[0]["id"].startswith("sample-en-")


def test_analyze_rejects_unsupported_language():
    response = client.post(
        "/api/analyze",
        json={"documents": [{"id": "x", "text": "hola"}], "lang": "fr"},
    )
    assert response.status_code == 422  # Literal["es","en"] rechaza 'fr'
