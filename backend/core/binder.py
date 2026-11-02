import pymupdf as fitz
from pathlib import Path
def compile_book(title: str, chapters: dict, output_path: str, cover_path: str = None) -> dict:
    """Binds text chapters into a master PDF with a clickable sidebar TOC (bookmarks)."""
    doc = fitz.open()
    toc = []  
    current_page = 1
    if cover_path and Path(cover_path).exists():
        img_doc = fitz.open(cover_path)
        cover_pdf = fitz.open("pdf", img_doc.convert_to_pdf())
        doc.insert_pdf(cover_pdf)
        toc.append([1, "Cover", current_page])
        current_page += 1
    for chapter_title, text_content in chapters.items():
        page = doc.new_page()
        toc.append([1, chapter_title, current_page])
        rect = fitz.Rect(50, 50, 545, 792)
        page.insert_textbox(rect, text_content, fontsize=11, fontname="helv")
        current_page += 1
    doc.set_toc(toc)
    doc.save(output_path)
    doc.close()
    return {"status": "success", "file": output_path, "total_pages": current_page - 1}