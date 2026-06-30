"""Serialización determinista del corpus y del análisis."""

import csv
from io import StringIO
import json
from typing import Any, Sequence


def export_corpus(documents: Sequence[dict[str, Any]], file_format: str) -> str:
    if file_format == "json":
        return json.dumps(list(documents), ensure_ascii=False, indent=2)
    if file_format == "txt":
        sections = []
        for document in documents:
            header = f"### {document.get('url', document.get('id', 'Documento'))}"
            sections.append(f"{header}\n{document.get('texto', '')}")
        return "\n\n".join(sections)
    if file_format == "csv":
        output = StringIO(newline="")
        writer = csv.DictWriter(output, fieldnames=["id", "modo", "url", "fecha", "texto"])
        writer.writeheader()
        writer.writerows({field: document.get(field, "") for field in writer.fieldnames} for document in documents)
        return output.getvalue()
    raise ValueError("Formato no soportado")


def export_analysis(analysis: dict[str, Any], file_format: str) -> str:
    if file_format == "json":
        return json.dumps(analysis, ensure_ascii=False, indent=2)
    if file_format == "csv":
        output = StringIO(newline="")
        fields = ["token", "lemma", "pos", "tag", "morph"]
        writer = csv.DictWriter(output, fieldnames=fields)
        writer.writeheader()
        writer.writerows({field: token.get(field, "") for field in fields} for token in analysis.get("tokens", []))
        return output.getvalue()
    if file_format == "txt":
        metrics = analysis.get("metrics", {})
        summary = [
            "ANÁLISIS DE CORPUS",
            f"Hash: {analysis.get('corpus_hash', '')}",
            f"Palabras: {metrics.get('words', 0)}",
            f"Tipos: {metrics.get('types', 0)}",
            f"TTR: {metrics.get('ttr', 0):.4f}",
            f"Hapax: {metrics.get('hapax', 0)}",
            f"Densidad léxica: {metrics.get('lexical_density', 0):.4f}",
            "",
            "TOKEN\tLEMA\tPOS\tTAG\tMORFOLOGÍA",
        ]
        summary.extend(
            "\t".join(str(token.get(field, "")) for field in ("token", "lemma", "pos", "tag", "morph"))
            for token in analysis.get("tokens", [])
        )
        return "\n".join(summary)
    raise ValueError("Formato no soportado")
