import os
import io
import pytesseract
import pdfplumber
from pathlib import Path
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent.parent
TESSERACT_PATH = BASE_DIR / "bin" / "tesseract" / "tesseract.exe"
pytesseract.pytesseract.tesseract_cmd = str(TESSERACT_PATH)

def verify_engine() -> dict:
    """Verifies the local OCR binary is detected and operational."""
    if not TESSERACT_PATH.exists():
        return {"status": "error", "message": f"Tesseract not found at {TESSERACT_PATH}"}
    try:
        version = pytesseract.get_tesseract_version()
        return {"status": "success", "version": str(version), "path": str(TESSERACT_PATH)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Routes the file to the correct parser based on extension."""
    text = ""
    ext = filename.lower().split('.')[-1]
    
    if ext == 'pdf':
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
    elif ext in ['png', 'jpg', 'jpeg']:
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        
    return text.strip()