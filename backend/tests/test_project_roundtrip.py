"""El JSON exportado del corpus debe poder reimportarse en el frontend.

El import del cliente (sanitizeEntries) exige que cada documento tenga, como
cadenas, los campos id/modo/url/fecha/texto. Este test ancla ese contrato para
que un cambio en la exportación no rompa el import sin avisar.
"""

import json

from app.core.exporting import export_corpus

REQUIRED_FIELDS = ("id", "modo", "url", "fecha", "texto")


def test_corpus_json_export_is_reimportable():
    docs = [
        {"id": "a1", "modo": "Wikipedia", "url": "Wiki:corpus", "fecha": "2026-01-01T00:00:00", "texto": "hola"},
        {"id": "b2", "modo": "Archivo", "url": "notas.txt", "fecha": "2026-01-01T00:00:00", "texto": "mundo"},
    ]
    parsed = json.loads(export_corpus(docs, "json"))
    assert isinstance(parsed, list) and len(parsed) == 2
    for item in parsed:
        assert all(isinstance(item.get(field), str) for field in REQUIRED_FIELDS)
