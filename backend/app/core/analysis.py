"""Análisis lingüístico estructurado y caché LRU por corpus."""

from collections import Counter, OrderedDict
from dataclasses import dataclass
from hashlib import sha256
from threading import Lock
from typing import Any, Sequence


CONTENT_POS = frozenset({"ADJ", "ADV", "NOUN", "PROPN", "VERB"})
CACHE_MAX_ENTRIES = 8


@dataclass(frozen=True)
class AnalyzedToken:
    token: str
    lemma: str
    pos: str
    tag: str
    morph: str


@dataclass(frozen=True)
class AnalysisData:
    corpus_hash: str
    tokens: tuple[AnalyzedToken, ...]
    word_count: int
    type_count: int
    ttr: float
    hapax: int
    lexical_density: float
    pos_distribution: tuple[tuple[str, int], ...]
    lemmas: tuple[tuple[str, int], ...]
    bigrams: tuple[tuple[str, int], ...]
    trigrams: tuple[tuple[str, int], ...]


class ModelUnavailableError(RuntimeError):
    """El modelo configurado no está instalado o no puede cargarse."""


_MODEL: Any | None = None
_MODEL_LOCK = Lock()
_CACHE: OrderedDict[str, AnalysisData] = OrderedDict()
_CACHE_LOCK = Lock()


def top_ngrams(words: Sequence[str], n: int, top_n: int = 20) -> list[tuple[str, int]]:
    """Devuelve los n-gramas más frecuentes con desempate alfabético estable."""
    if n < 1:
        raise ValueError("n debe ser mayor o igual que 1")
    normalized = [word.casefold() for word in words if word]
    counts = Counter(" ".join(normalized[index : index + n]) for index in range(len(normalized) - n + 1))
    return sorted(counts.items(), key=lambda item: (-item[1], item[0]))[:top_n]


def lexical_stats(words: Sequence[str], pos_tags: Sequence[str]) -> dict[str, float | int]:
    """Calcula TTR, hapax y densidad léxica sobre palabras ya filtradas."""
    if len(words) != len(pos_tags):
        raise ValueError("words y pos_tags deben tener la misma longitud")
    normalized = [word.casefold() for word in words]
    total = len(normalized)
    if not total:
        return {"word_count": 0, "type_count": 0, "ttr": 0.0, "hapax": 0, "lexical_density": 0.0}
    frequencies = Counter(normalized)
    content_words = sum(pos in CONTENT_POS for pos in pos_tags)
    return {
        "word_count": total,
        "type_count": len(frequencies),
        "ttr": len(frequencies) / total,
        "hapax": sum(count == 1 for count in frequencies.values()),
        "lexical_density": content_words / total,
    }


def _get_model() -> Any:
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    with _MODEL_LOCK:
        if _MODEL is not None:
            return _MODEL
        try:
            import spacy

            _MODEL = spacy.load("es_core_news_sm", disable=["ner"])
        except (ImportError, OSError) as exc:
            raise ModelUnavailableError("No se pudo cargar el modelo es_core_news_sm.") from exc
    return _MODEL


def _compute_analysis(text: str, corpus_hash: str) -> AnalysisData:
    nlp = _get_model()
    if len(text) >= nlp.max_length:
        nlp.max_length = len(text) + 1_000
    doc = nlp(text)
    tokens = tuple(
        AnalyzedToken(token=token.text, lemma=token.lemma_, pos=token.pos_, tag=token.tag_, morph=str(token.morph))
        for token in doc
        if not token.is_space
    )
    word_tokens = [token for token in doc if token.is_alpha]
    words = [token.text for token in word_tokens]
    pos_tags = [token.pos_ for token in word_tokens]
    metrics = lexical_stats(words, pos_tags)
    pos_counts = Counter(token.pos_ for token in word_tokens)
    lemma_words = [token.lemma_.casefold() for token in word_tokens if not token.is_stop]
    lemma_counts = sorted(Counter(lemma_words).items(), key=lambda item: (-item[1], item[0]))[:30]

    return AnalysisData(
        corpus_hash=corpus_hash,
        tokens=tokens,
        word_count=int(metrics["word_count"]),
        type_count=int(metrics["type_count"]),
        ttr=float(metrics["ttr"]),
        hapax=int(metrics["hapax"]),
        lexical_density=float(metrics["lexical_density"]),
        pos_distribution=tuple(sorted(pos_counts.items(), key=lambda item: (-item[1], item[0]))),
        lemmas=tuple(lemma_counts),
        bigrams=tuple(top_ngrams(lemma_words, 2)),
        trigrams=tuple(top_ngrams(lemma_words, 3)),
    )


def analyze_text(text: str) -> tuple[AnalysisData, bool]:
    """Analiza texto o devuelve el resultado cacheado para su SHA-256."""
    corpus_hash = sha256(text.encode("utf-8")).hexdigest()
    with _CACHE_LOCK:
        cached = _CACHE.get(corpus_hash)
        if cached is not None:
            _CACHE.move_to_end(corpus_hash)
            return cached, True

    result = _compute_analysis(text, corpus_hash)
    with _CACHE_LOCK:
        _CACHE[corpus_hash] = result
        _CACHE.move_to_end(corpus_hash)
        while len(_CACHE) > CACHE_MAX_ENTRIES:
            _CACHE.popitem(last=False)
    return result, False


def clear_analysis_cache() -> None:
    """Vacía la caché; útil en tests y tareas de mantenimiento."""
    with _CACHE_LOCK:
        _CACHE.clear()
