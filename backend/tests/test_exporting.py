"""Serialización y cabeceras de descarga."""

import csv
from io import StringIO

from app.core.exporting import export_analysis, export_corpus


DOCUMENTS = [{"id": "1", "modo": "Archivo", "url": "uno.txt", "fecha": "2026", "texto": "café"}]


def test_export_corpus_all_formats():
    assert "### uno.txt\ncafé" == export_corpus(DOCUMENTS, "txt")
    assert '"texto": "café"' in export_corpus(DOCUMENTS, "json")
    rows = list(csv.DictReader(StringIO(export_corpus(DOCUMENTS, "csv"))))
    assert rows[0]["texto"] == "café"


def test_export_analysis_csv_has_structured_token_columns():
    analysis = {"tokens": [{"token": "Gatos", "lemma": "gato", "pos": "NOUN", "tag": "NOUN", "morph": "Number=Plur"}]}
    row = next(csv.DictReader(StringIO(export_analysis(analysis, "csv"))))
    assert row["lemma"] == "gato"
    assert row["pos"] == "NOUN"
