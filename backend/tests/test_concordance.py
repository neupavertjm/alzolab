"""Casos deterministas de KWIC."""

from app.core.concordance import kwic, tokenize_words


def test_tokenize_words_keeps_hyphen_and_apostrophe():
    assert tokenize_words("lingüística de corpus, NLP-based y l'esprit") == [
        "lingüística", "de", "corpus", "NLP-based", "y", "l'esprit"
    ]


def test_kwic_window_and_case_insensitive_match():
    results = kwic("Uno dos Corpus cuatro cinco. corpus final", "CORPUS", window=2)
    assert results[0].left == "Uno dos"
    assert results[0].node == "Corpus"
    assert results[0].right == "cuatro cinco"
    assert results[1].left == "cuatro cinco"
    assert results[1].right == "final"


def test_kwic_limit_phrase_and_missing_word():
    assert len(kwic("a b a b a b", "a b", max_results=2)) == 2
    assert kwic("texto breve", "ausente") == []
