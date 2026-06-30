"""Helpers de texto compartidos por todas las fuentes de ingesta.

Funciones puras y deterministas (salvo `build_entry`, que sella id/fecha): la
normalización y el deduplicado viven en un único sitio para que todas las
fuentes (web, Wikipedia, archivos) produzcan documentos homogéneos.
"""

import hashlib
import unicodedata
import uuid
from datetime import datetime


def normalize_text(text):
    """Normaliza a la forma NFKC y unifica los finales de línea.

    NFKC unifica variantes Unicode equivalentes (ligaduras, anchos, acentos
    compuestos). Además, los retornos de carro (\\r de Windows/Mac) se convierten
    a \\n para que la limpieza por líneas no deje basura con texto CRLF.
    """
    normalized = unicodedata.normalize("NFKC", text or "")
    return normalized.replace("\r\n", "\n").replace("\r", "\n")


def build_entry(mode, source, text):
    """Construye un documento de corpus homogéneo.

    `mode` es la fuente/método ("Wikipedia", "trafilatura", "Archivo"…),
    `source` su identificador legible (URL, "Wiki:término", nombre de archivo).
    El texto se normaliza (NFKC) en este único punto de entrada.
    """
    return {
        "id": uuid.uuid4().hex[:10],
        "modo": mode,
        "url": source,
        "fecha": datetime.now().isoformat(timespec="seconds"),
        "texto": normalize_text(text),
    }


def remove_duplicates(entries):
    """Elimina documentos con texto idéntico (hash MD5 de `texto`), conservando
    el primero de cada grupo y el orden de aparición."""
    seen = set()
    unique = []
    for entry in entries:
        digest = hashlib.md5(entry.get("texto", "").encode("utf-8")).hexdigest()
        if digest not in seen:
            seen.add(digest)
            unique.append(entry)
    return unique
