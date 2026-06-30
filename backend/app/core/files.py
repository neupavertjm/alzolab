"""Parseo de archivos subidos (.txt / .pdf / .docx) a texto plano.

Desacoplado del framework: a diferencia del prototipo Streamlit (que recibía un
`uploaded_file`), aquí trabajamos con `filename` + `data: bytes`, lo que permite
probarlo sin servidor y sirve igual para FastAPI (`UploadFile.read()`).
"""

import io

import docx
import pypdf

SUPPORTED_EXTENSIONS = ("txt", "pdf", "docx")


def parse_upload(filename, data):
    """Extrae el texto de un archivo dado su nombre y sus bytes.

    Soporta .txt (utf-8 con respaldo latin-1), .pdf (PyPDF2) y .docx (python-docx).
    Devuelve "" si el formato no se soporta o la lectura falla; el llamador avisa
    al usuario.
    """
    extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    try:
        if extension == "txt":
            try:
                return data.decode("utf-8")
            except UnicodeDecodeError:
                return data.decode("latin-1")

        if extension == "pdf":
            reader = pypdf.PdfReader(io.BytesIO(data))
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text

        if extension == "docx":
            document = docx.Document(io.BytesIO(data))
            return "\n".join(para.text for para in document.paragraphs)

    except Exception:
        return ""

    return ""
