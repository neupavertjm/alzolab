"""Tests de los helpers de texto compartidos por la ingesta."""

from app.core.text import build_entry, normalize_text, remove_duplicates


def test_normalize_text_applies_nfkc():
    # La ligadura ﬁ (U+FB01) se descompone en 'fi' bajo NFKC.
    assert normalize_text("oﬁcina") == "oficina"


def test_normalize_text_handles_none():
    assert normalize_text(None) == ""


def test_build_entry_normalizes_and_sets_fields():
    entry = build_entry("Wikipedia", "Wiki:corpus", "oﬁcina")
    assert entry["modo"] == "Wikipedia"
    assert entry["url"] == "Wiki:corpus"
    assert entry["texto"] == "oficina"
    assert len(entry["id"]) == 10
    assert entry["fecha"]  # se sella con la hora actual


def test_remove_duplicates_drops_identical_text_keeps_order():
    entries = [
        {"id": "a", "texto": "mismo texto"},
        {"id": "b", "texto": "otro texto"},
        {"id": "c", "texto": "mismo texto"},  # duplicado de a
    ]
    result = remove_duplicates(entries)
    assert [e["id"] for e in result] == ["a", "b"]


def test_remove_duplicates_empty_list():
    assert remove_duplicates([]) == []
