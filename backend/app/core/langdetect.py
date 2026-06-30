"""Detección ligera de idioma (es/en) por palabras funcionales.

El laboratorio solo soporta español e inglés, así que en lugar de añadir una
dependencia de detección genérica, se compara la frecuencia de palabras
funcionales muy comunes de cada idioma. Es determinista, sin dependencias extra
y suficiente para avisar cuando el corpus no coincide con el modelo elegido.
"""

import regex

# Palabras funcionales frecuentes y poco ambiguas de cada idioma.
_ES_WORDS = frozenset(
    "de la que el en y a los del las un por con no una su para es al lo como más "
    "o pero sus le ya se me sí porque esta entre cuando muy sin sobre".split()
)
_EN_WORDS = frozenset(
    "the of and to in is that for it as was with be by on not this are or an at "
    "from but his they you have had which one will their".split()
)

_WORD_RE = regex.compile(r"\p{L}+")
MIN_WORDS = 8  # por debajo de esto hay poca señal para decidir


def detect_language(text: str) -> str | None:
    """Devuelve 'es', 'en' o None si no hay señal suficiente o hay empate."""
    words = _WORD_RE.findall((text or "").lower())
    if len(words) < MIN_WORDS:
        return None
    es_hits = sum(1 for word in words if word in _ES_WORDS)
    en_hits = sum(1 for word in words if word in _EN_WORDS)
    if es_hits == en_hits:
        return None
    return "es" if es_hits > en_hits else "en"
