"""Validación SSRF y límites de red."""

from unittest.mock import patch

import pytest

from app.core.security import UnsafeUrlError, validate_public_url


@pytest.mark.parametrize(
    "url",
    [
        "file:///etc/passwd",
        "http://127.0.0.1/admin",
        "http://localhost/admin",
        "http://169.254.169.254/latest/meta-data",
        "http://user:secret@example.com",
    ],
)
def test_validate_public_url_rejects_unsafe_targets(url):
    with pytest.raises(UnsafeUrlError):
        validate_public_url(url)


def test_validate_public_url_accepts_global_address():
    resolved = [(2, 1, 6, "", ("93.184.216.34", 443))]
    with patch("socket.getaddrinfo", return_value=resolved):
        assert validate_public_url("https://example.com/article") == "https://example.com/article"


def test_validate_public_url_rejects_host_with_mixed_public_private_dns():
    resolved = [
        (2, 1, 6, "", ("93.184.216.34", 80)),
        (2, 1, 6, "", ("10.0.0.2", 80)),
    ]
    with patch("socket.getaddrinfo", return_value=resolved), pytest.raises(UnsafeUrlError):
        validate_public_url("http://example.com")
