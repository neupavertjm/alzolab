"""Lógica pura para limpiar texto mediante reglas regex acotadas."""

from dataclasses import dataclass

import regex


REGEX_TIMEOUT_SECONDS = 0.05


@dataclass(frozen=True)
class CleaningRule:
    regex: str
    replacement: str = ""
    label: str = "Regla manual"


@dataclass(frozen=True)
class CleaningResult:
    text: str
    replacements: int
    warnings: tuple[str, ...]


PRESETS = (
    {"id": "references", "label": "Quitar referencias [12]", "description": "Elimina llamadas bibliográficas numéricas entre corchetes.", "regex": r"\[\d+(?:\s*[-,–]\s*\d+)*\]", "replacement": ""},
    {"id": "urls", "label": "Quitar URLs", "description": "Elimina direcciones http, https y www.", "regex": r"(?:https?://|www\.)\S+", "replacement": ""},
    {"id": "emails", "label": "Quitar emails", "description": "Elimina direcciones de correo electrónico.", "regex": r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b", "replacement": ""},
    {"id": "join_lines", "label": "Unir líneas", "description": "Convierte saltos simples en espacios y conserva los párrafos.", "regex": r"(?<!\n)\n(?!\n)", "replacement": " "},
    {"id": "isolated_digits", "label": "Quitar dígitos sueltos", "description": "Elimina números aislados, pero no los integrados en palabras.", "regex": r"(?<!\w)\d+(?!\w)", "replacement": ""},
    {"id": "spaces", "label": "Normalizar espacios", "description": "Reduce espacios y tabulaciones repetidos.", "regex": r"[ \t]+", "replacement": " "},
)


def apply_regex_pipeline(text: str, rules: list[CleaningRule], *, timeout: float = REGEX_TIMEOUT_SECONDS) -> CleaningResult:
    """Aplica reglas en orden; una regla inválida o lenta se omite con un aviso."""
    cleaned = text
    replacements = 0
    warnings: list[str] = []
    for index, rule in enumerate(rules, start=1):
        name = rule.label or f"Regla {index}"
        try:
            cleaned, count = regex.subn(rule.regex, rule.replacement, cleaned, timeout=timeout)
            replacements += count
        except TimeoutError:
            warnings.append(f"{name}: se superó el límite de tiempo y la regla se omitió.")
        except regex.error as exc:
            warnings.append(f"{name}: expresión regular inválida ({exc}).")
    return CleaningResult(cleaned, replacements, tuple(warnings))
