import io
import base64
from pathlib import Path
from typing import Optional


def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        from pypdf import PdfReader
        reader = PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text.strip()[:4000]  # limit to 4000 chars
    except Exception as e:
        return f"Could not read PDF: {e}"


def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        return text.strip()[:4000]
    except Exception as e:
        return f"Could not read DOCX: {e}"


def extract_text_from_txt(file_bytes: bytes) -> str:
    try:
        return file_bytes.decode("utf-8", errors="ignore").strip()[:4000]
    except Exception as e:
        return f"Could not read text file: {e}"


def image_to_base64(file_bytes: bytes) -> str:
    return base64.b64encode(file_bytes).decode("utf-8")


def parse_file(filename: str, file_bytes: bytes) -> dict:
    ext = Path(filename).suffix.lower()

    if ext == ".pdf":
        return {
            "type": "text",
            "content": extract_text_from_pdf(file_bytes),
            "filename": filename,
        }
    elif ext in (".docx", ".doc"):
        return {
            "type": "text",
            "content": extract_text_from_docx(file_bytes),
            "filename": filename,
        }
    elif ext == ".txt":
        return {
            "type": "text",
            "content": extract_text_from_txt(file_bytes),
            "filename": filename,
        }
    elif ext in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
        return {
            "type": "image",
            "content": image_to_base64(file_bytes),
            "media_type": f"image/{'jpeg' if ext in ('.jpg', '.jpeg') else ext[1:]}",
            "filename": filename,
        }
    else:
        return {
            "type": "unsupported",
            "content": "",
            "filename": filename,
        }