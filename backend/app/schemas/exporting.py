"""Contrato de exportación de corpus y análisis."""

from enum import Enum

from pydantic import BaseModel, Field, model_validator

from app.schemas.analysis import AnalyzeResponse


class ExportKind(str, Enum):
    corpus = "corpus"
    analysis = "analysis"


class ExportFormat(str, Enum):
    txt = "txt"
    json = "json"
    csv = "csv"


class ExportDocument(BaseModel):
    id: str
    modo: str
    url: str
    fecha: str
    texto: str = Field(max_length=500_000)


class ExportRequest(BaseModel):
    kind: ExportKind
    format: ExportFormat
    documents: list[ExportDocument] = Field(default_factory=list, max_length=100)
    analysis: AnalyzeResponse | None = None

    @model_validator(mode="after")
    def validate_payload(self) -> "ExportRequest":
        if self.kind == ExportKind.corpus and not self.documents:
            raise ValueError("La exportación de corpus requiere documentos.")
        if self.kind == ExportKind.analysis and self.analysis is None:
            raise ValueError("La exportación de análisis requiere un resultado.")
        return self
