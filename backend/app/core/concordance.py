"""Tokenización ligera y concordancias KWIC."""

from dataclasses import dataclass
import regex


WORD_PATTERN = regex.compile(r"[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*")


@dataclass(frozen=True)
class KwicResult:
    left: str
    node: str
    right: str


def tokenize_words(text: str) -> list[str]:
    return WORD_PATTERN.findall(text)


def kwic(text: str, query: str, window: int = 7, max_results: int = 100) -> list[KwicResult]:
    """Busca una palabra o frase sin distinguir mayúsculas y devuelve contexto."""
    if window < 0 or max_results < 1:
        raise ValueError("window debe ser >= 0 y max_results >= 1")
    words = tokenize_words(text)
    needle = tokenize_words(query)
    if not needle:
        return []
    folded = [word.casefold() for word in words]
    target = [word.casefold() for word in needle]
    results = []
    size = len(target)
    for index in range(len(words) - size + 1):
        if folded[index : index + size] != target:
            continue
        results.append(
            KwicResult(
                left=" ".join(words[max(0, index - window) : index]),
                node=" ".join(words[index : index + size]),
                right=" ".join(words[index + size : index + size + window]),
            )
        )
        if len(results) >= max_results:
            break
    return results
