"""Tests del parseo de archivos subidos."""

from app.core.files import parse_upload


def test_parse_txt_utf8():
    assert parse_upload("nota.txt", "café y ñoño".encode("utf-8")) == "café y ñoño"


def test_parse_txt_latin1_fallback():
    # Bytes válidos en latin-1 pero no en utf-8: debe caer al respaldo.
    assert parse_upload("nota.txt", "café".encode("latin-1")) == "café"


def test_parse_unsupported_extension_returns_empty():
    assert parse_upload("imagen.png", b"\x89PNG") == ""


def test_parse_no_extension_returns_empty():
    assert parse_upload("sinextension", b"datos") == ""
