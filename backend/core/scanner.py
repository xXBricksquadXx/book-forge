import os
import pytesseract
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
def extract_text(image_path: str) -> str:
    """Raw OCR extraction pipeline."""
    return pytesseract.image_to_string(Image.open(image_path))