"""Pruebas deterministas de métricas y n-gramas."""

import pytest

from app.core.analysis import lexical_stats, top_ngrams


def test_top_ngrams_counts_and_stable_ranking():
    words = ["gato", "negro", "gato", "negro", "duerme"]
    assert top_ngrams(words, 2) == [
        ("gato negro", 2),
        ("negro duerme", 1),
        ("negro gato", 1),
    ]
    assert top_ngrams(words, 3, top_n=1) == [("gato negro duerme", 1)]


def test_top_ngrams_rejects_invalid_n():
    with pytest.raises(ValueError):
        top_ngrams(["texto"], 0)


def test_lexical_stats_known_values():
    stats = lexical_stats(
        ["El", "gato", "come", "pescado", "gato"],
        ["DET", "NOUN", "VERB", "NOUN", "NOUN"],
    )
    assert stats["word_count"] == 5
    assert stats["type_count"] == 4
    assert stats["ttr"] == pytest.approx(0.8)
    assert stats["hapax"] == 3
    assert stats["lexical_density"] == pytest.approx(0.8)


def test_lexical_stats_empty_input():
    assert lexical_stats([], []) == {
        "word_count": 0,
        "type_count": 0,
        "ttr": 0.0,
        "hapax": 0,
        "lexical_density": 0.0,
    }
