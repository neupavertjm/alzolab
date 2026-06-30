"""Detección de idioma es/en por palabras funcionales."""

from app.core.langdetect import detect_language

SPANISH = (
    "La lingüística de corpus estudia el lenguaje a partir de colecciones de "
    "textos reales y analiza los patrones de uso que se observan en los datos."
)
ENGLISH = (
    "Corpus linguistics studies language from large collections of real texts "
    "and analyses the usage patterns that are observed in the data."
)


def test_detects_spanish():
    assert detect_language(SPANISH) == "es"


def test_detects_english():
    assert detect_language(ENGLISH) == "en"


def test_short_text_has_no_signal():
    assert detect_language("hola mundo") is None


def test_empty_text_returns_none():
    assert detect_language("") is None
    assert detect_language(None) is None
