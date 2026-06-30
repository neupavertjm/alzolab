"""Contrato de concordancias KWIC."""

from pydantic import BaseModel, Field

from app.schemas.analysis import AnalysisDocument


class ConcordanceDocument(AnalysisDocument):
    label: str = "Documento"


class ConcordanceRequest(BaseModel):
    documents: list[ConcordanceDocument] = Field(min_length=1, max_length=50)
    query: str = Field(min_length=1, max_length=100)
    window: int = Field(default=7, ge=0, le=30)
    max_results: int = Field(default=100, ge=1, le=500)


class ConcordanceResult(BaseModel):
    document_id: str
    document_label: str
    left: str
    node: str
    right: str


class ConcordanceResponse(BaseModel):
    results: list[ConcordanceResult]
    total: int
