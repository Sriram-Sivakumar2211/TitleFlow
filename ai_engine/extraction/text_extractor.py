import os
from pathlib import Path
from typing import Tuple, List
import fitz  # PyMuPDF
from PIL import Image

class TextExtractionResult:
    def __init__(self, full_text: str, page_texts: List[str], page_count: int, ocr_applied: bool = False):
        self.full_text = full_text
        self.page_texts = page_texts
        self.page_count = page_count
        self.ocr_applied = ocr_applied

def extract_text_from_file(file_path: str, enable_ocr: bool = True) -> TextExtractionResult:
    """
    Extracts text from PDF or image files.
    Uses PyMuPDF for native PDF text extraction.
    Falls back to OCR if PDF has no embedded text (scanned) or is an image.
    """
    path = Path(file_path)
    ext = path.suffix.lower()

    if ext == ".pdf":
        return _extract_from_pdf(path, enable_ocr)
    elif ext in [".png", ".jpg", ".jpeg", ".tiff"]:
        return _extract_from_image(path, enable_ocr)
    else:
        # Fallback raw read
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            return TextExtractionResult(full_text=content, page_texts=[content], page_count=1)
        except Exception as e:
            return TextExtractionResult(full_text=f"Error reading document: {str(e)}", page_texts=[], page_count=0)

def _extract_from_pdf(pdf_path: Path, enable_ocr: bool) -> TextExtractionResult:
    doc = fitz.open(pdf_path)
    page_texts = []
    total_pages = len(doc)
    ocr_applied = False

    for page_num in range(total_pages):
        page = doc[page_num]
        text = page.get_text("text").strip()
        page_texts.append(text)

    doc.close()
    full_text = "\n\n--- Page Break ---\n\n".join(page_texts).strip()

    # If document has almost no selectable text (scanned document)
    if len(full_text) < 50 and enable_ocr:
        # Attempt OCR
        ocr_text, ocr_page_texts = _perform_pdf_ocr(pdf_path)
        if len(ocr_text) > len(full_text):
            return TextExtractionResult(
                full_text=ocr_text,
                page_texts=ocr_page_texts,
                page_count=total_pages,
                ocr_applied=True
            )

    return TextExtractionResult(
        full_text=full_text,
        page_texts=page_texts,
        page_count=total_pages,
        ocr_applied=ocr_applied
    )

def _extract_from_image(img_path: Path, enable_ocr: bool) -> TextExtractionResult:
    if not enable_ocr:
        return TextExtractionResult(full_text="[Image file: OCR disabled in configuration]", page_texts=[], page_count=1)
    
    try:
        # Try EasyOCR if available
        import easyocr
        reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        result = reader.readtext(str(img_path), detail=0)
        text = " ".join(result)
        return TextExtractionResult(full_text=text, page_texts=[text], page_count=1, ocr_applied=True)
    except Exception:
        try:
            # Try pytesseract if available
            import pytesseract
            img = Image.open(img_path)
            text = pytesseract.image_to_string(img)
            return TextExtractionResult(full_text=text, page_texts=[text], page_count=1, ocr_applied=True)
        except Exception:
            return TextExtractionResult(
                full_text="[Scanned image uploaded - OCR engine processing unavailable on host]",
                page_texts=[],
                page_count=1,
                ocr_applied=False
            )

def _perform_pdf_ocr(pdf_path: Path) -> Tuple[str, List[str]]:
    """Renders PDF pages to images and runs OCR"""
    try:
        import easyocr
        import numpy as np
        reader = easyocr.Reader(['en'], gpu=False, verbose=False)
        doc = fitz.open(pdf_path)
        page_texts = []
        for page in doc:
            pix = page.get_pixmap(dpi=150)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            results = reader.readtext(np.array(img), detail=0)
            page_texts.append(" ".join(results))
        doc.close()
        return "\n\n--- Page Break ---\n\n".join(page_texts), page_texts
    except Exception:
        return "", []
