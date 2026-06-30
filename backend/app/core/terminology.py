"""Extracción genérica de candidatos y cálculo C-value."""

from collections import Counter
from dataclasses import dataclass
from math import log2
from typing import Sequence

from app.core.analysis import AnalyzedToken


CANDIDATE_POS = frozenset({"ADJ", "NOUN", "PROPN"})
NOMINAL_POS = frozenset({"NOUN", "PROPN"})


@dataclass(frozen=True)
class TermResult:
    term: str
    cvalue: float
    frequency: int
    words: int
    nested_in: int


def extract_term_candidates(
    tokens: Sequence[AnalyzedToken], min_words: int = 2, max_words: int = 5
) -> Counter[str]:
    """Cuenta n-gramas nominales contiguos usando lemas normalizados."""
    if not 1 <= min_words <= max_words:
        raise ValueError("Se requiere 1 <= min_words <= max_words")
    candidates: Counter[str] = Counter()
    chunk: list[AnalyzedToken] = []

    def consume(items: list[AnalyzedToken]) -> None:
        for size in range(min_words, max_words + 1):
            for start in range(len(items) - size + 1):
                window = items[start : start + size]
                if not any(token.pos in NOMINAL_POS for token in window):
                    continue
                term = " ".join(token.lemma.casefold() for token in window)
                candidates[term] += 1

    for token in tokens:
        if token.pos in CANDIDATE_POS and token.token.isalpha():
            chunk.append(token)
        else:
            consume(chunk)
            chunk = []
    consume(chunk)
    return candidates


def _contains_term(container: tuple[str, ...], nested: tuple[str, ...]) -> bool:
    return any(
        container[index : index + len(nested)] == nested
        for index in range(len(container) - len(nested) + 1)
    )


def compute_cvalue(frequencies: dict[str, int] | Counter[str]) -> list[TermResult]:
    """Calcula C-value con ajuste por frecuencia media de términos contenedores."""
    tokenized = {term: tuple(term.split()) for term in frequencies}
    results: list[TermResult] = []
    for term, frequency in frequencies.items():
        words = tokenized[term]
        containers = [
            other
            for other, other_words in tokenized.items()
            if len(other_words) > len(words) and _contains_term(other_words, words)
        ]
        adjusted_frequency = float(frequency)
        if containers:
            adjusted_frequency -= sum(frequencies[other] for other in containers) / len(containers)
        cvalue = log2(len(words)) * max(0.0, adjusted_frequency) if len(words) > 1 else 0.0
        results.append(
            TermResult(
                term=term,
                cvalue=cvalue,
                frequency=frequency,
                words=len(words),
                nested_in=len(containers),
            )
        )
    return sorted(results, key=lambda item: (-item.cvalue, -item.frequency, item.term))


def extract_terminology(
    tokens: Sequence[AnalyzedToken],
    min_words: int = 2,
    max_words: int = 5,
    min_frequency: int = 2,
    top_n: int = 100,
) -> list[TermResult]:
    frequencies = extract_term_candidates(tokens, min_words, max_words)
    filtered = Counter({term: count for term, count in frequencies.items() if count >= min_frequency})
    return compute_cvalue(filtered)[:top_n]
