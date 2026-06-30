"""Modelos Pydantic de la fase de Importar.

El contrato entre frontend y backend es JSON tipado: nada de serializar a
strings y re-parsear. Cada documento extraído viaja como `CorpusEntry`.
"""

from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field

Language = Literal["es", "en"]


class WebMethod(str, Enum):
    """Método de extracción para páginas web."""

    trafilatura = "trafilatura"  # automático, mejor para artículos/noticias
    justext = "justext"
    beautifulsoup = "beautifulsoup"


class CorpusEntry(BaseModel):
    """Un documento extraído, homogéneo sea cual sea la fuente."""

    id: str
    modo: str = Field(description="Fuente o método de extracción")
    url: str = Field(description="Identificador legible: URL, 'Wiki:término' o archivo")
    fecha: str
    texto: str


class ExtractResult(BaseModel):
    """Respuesta de cualquier endpoint de extracción.

    `entries` son los documentos obtenidos (ya deduplicados); `warnings` recoge
    las fuentes que no devolvieron texto, para mostrarlas sin abortar el lote.
    """

    entries: list[CorpusEntry]
    warnings: list[str] = []


class WebExtractRequest(BaseModel):
    urls: list[str] = Field(min_length=1, max_length=20)
    method: WebMethod = WebMethod.trafilatura
    lang: Language = "es"  # solo afecta a la stoplist de jusText


class WikipediaExtractRequest(BaseModel):
    queries: list[str] = Field(min_length=1, max_length=20)
    lang: str = "es"
