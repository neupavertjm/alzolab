"""Mejoras de la limpieza: dígitos sueltos, finales de línea y presets nuevos."""

from app.core.cleaning import PRESETS, CleaningRule, apply_regex_pipeline
from app.core.text import normalize_text

PRESET_BY_ID = {preset["id"]: preset for preset in PRESETS}


def _rule(preset_id: str) -> CleaningRule:
    preset = PRESET_BY_ID[preset_id]
    return CleaningRule(regex=preset["regex"], replacement=preset["replacement"], label=preset["label"])


def _clean(text: str, preset_id: str) -> str:
    return apply_regex_pipeline(text, [_rule(preset_id)]).text


def test_isolated_digits_keeps_hyphenated_and_decimals_intact():
    # COVID-19: el 19 va pegado a un guion -> no se toca.
    assert _clean("Estudio sobre COVID-19 hoy", "isolated_digits") == "Estudio sobre COVID-19 hoy"


def test_isolated_digits_removes_decimals_and_thousands_cleanly():
    # Antes dejaba la coma/punto suelta; ahora quita el número entero.
    assert _clean("El valor 3,14 y 1.500 casos", "isolated_digits") == "El valor  y  casos"


def test_isolated_digits_still_removes_plain_numbers():
    assert _clean("En el año 2020 pasó", "isolated_digits") == "En el año  pasó"


def test_isolated_digits_keeps_digits_inside_words():
    assert _clean("versión v2 del modelo", "isolated_digits") == "versión v2 del modelo"


def test_urls_do_not_eat_trailing_punctuation():
    assert _clean("Mira http://x.com.", "urls") == "Mira ."


def test_normalize_text_strips_carriage_returns():
    assert normalize_text("línea1\r\nlínea2\rlínea3") == "línea1\nlínea2\nlínea3"


def test_collapse_newlines_reduces_to_paragraph():
    assert _clean("a\n\n\n\nb", "collapse_newlines") == "a\n\nb"


def test_trim_lines_removes_edge_whitespace():
    assert _clean("  hola  \n  mundo  ", "trim_lines") == "hola\nmundo"
