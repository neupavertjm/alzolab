"""Controles de red para fuentes remotas proporcionadas por usuarios."""

from ipaddress import ip_address
import socket
from urllib.parse import urljoin, urlparse

import requests


MAX_REMOTE_BYTES = 5 * 1024 * 1024
MAX_REDIRECTS = 4


class UnsafeUrlError(ValueError):
    """La URL apunta a un esquema, host o dirección no públicos."""


class RemoteContentTooLargeError(ValueError):
    """La respuesta remota supera el límite permitido."""


def validate_public_url(url: str) -> str:
    """Rechaza credenciales, hosts locales y direcciones IP no globales."""
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        raise UnsafeUrlError("Solo se permiten URLs públicas http o https.")
    if parsed.username or parsed.password:
        raise UnsafeUrlError("No se permiten credenciales dentro de la URL.")
    try:
        addresses = {
            item[4][0]
            for item in socket.getaddrinfo(parsed.hostname, parsed.port or 443, type=socket.SOCK_STREAM)
        }
    except socket.gaierror as exc:
        raise UnsafeUrlError("No se pudo resolver el host de la URL.") from exc
    if not addresses or any(not ip_address(address).is_global for address in addresses):
        raise UnsafeUrlError("La URL apunta a una red local, reservada o no pública.")
    return url


def fetch_public_url(
    url: str,
    *,
    headers: dict[str, str] | None = None,
    timeout: int = 15,
    max_bytes: int = MAX_REMOTE_BYTES,
) -> bytes:
    """Descarga con límite y revalida cada destino de redirección."""
    current = url
    for _ in range(MAX_REDIRECTS + 1):
        validate_public_url(current)
        with requests.get(
            current,
            timeout=timeout,
            headers=headers,
            stream=True,
            allow_redirects=False,
        ) as response:
            if response.is_redirect or response.is_permanent_redirect:
                location = response.headers.get("location")
                if not location:
                    response.raise_for_status()
                current = urljoin(current, location)
                continue
            response.raise_for_status()
            declared = response.headers.get("content-length")
            if declared and int(declared) > max_bytes:
                raise RemoteContentTooLargeError("La respuesta remota supera 5 MB.")
            chunks = []
            size = 0
            for chunk in response.iter_content(chunk_size=64 * 1024):
                size += len(chunk)
                if size > max_bytes:
                    raise RemoteContentTooLargeError("La respuesta remota supera 5 MB.")
                chunks.append(chunk)
            return b"".join(chunks)
    raise UnsafeUrlError("La URL encadena demasiadas redirecciones.")
