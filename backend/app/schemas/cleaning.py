"""Contrato JSON de la fase Limpiar."""

from pydantic import BaseModel, Field


class RegexRule(BaseModel):
    regex: str = Field(min_length=1, max_length=500)
    replacement: str = Field(default="", max_length=500)
    label: str = Field(default="Regla manual", max_length=100)


class CleanDocument(BaseModel):
    id: str
    text: str = Field(max_length=500_000)


class CleanRequest(BaseModel):
    documents: list[CleanDocument] = Field(min_length=1, max_length=100)
    rules: list[RegexRule] = Field(min_length=1, max_length=20)


class CleanedDocument(BaseModel):
    id: str
    before: str
    after: str
    changed: bool
    replacements: int


class CleanResponse(BaseModel):
    documents: list[CleanedDocument]
    warnings: list[str]


class CleaningPreset(BaseModel):
    id: str
    label: str
    description: str
    regex: str
    replacement: str
