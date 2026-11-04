import pymupdf as fitz
import os
import tempfile
from pathlib import Path
def compile_book(title: str, chapters: dict, output_path: str, cover_path: str = None) -> dict:
    """Binds HTML chapters into a master PDF using an OS-level tempfile."""
    
    # 1. Generate a true system-level temporary file that Windows manages
    temp_fd, temp_path = tempfile.mkstemp(suffix=".pdf")
    os.close(temp_fd) # Close the raw OS descriptor so PyMuPDF has full access
    
    writer = fitz.DocumentWriter(temp_path)
    
    # CSS to mirror your React Canvas
    pdf_css = """
    body { font-family: "Times New Roman", serif; font-size: 12pt; line-height: 2.0; color: #111111; }
    p { text-indent: 0.5in; margin-top: 0; margin-bottom: 0; }
    h2 { text-align: center; font-size: 24pt; font-weight: bold; margin-top: 0.5in; margin-bottom: 0.5in; text-indent: 0; }
    """
    page_rect = fitz.Rect(0, 0, 612, 792)       
    margin_rect = fitz.Rect(72, 72, 540, 720)   
    toc = []
    current_page = 1
    if cover_path and Path(cover_path).exists():
        toc.append([1, "Cover", current_page])
        current_page += 1
    for chapter_title, html_content in chapters.items():
        toc.append([1, chapter_title, current_page])
        story = fitz.Story(html=html_content, user_css=pdf_css)
        more = 1
        while more:
            dev = writer.begin_page(page_rect)
            more, _ = story.place(margin_rect)
            story.draw(dev)
            writer.end_page()
            if more:
                current_page += 1
        current_page += 1
    writer.close()
    doc = fitz.open()
    if cover_path and Path(cover_path).exists():
        img_doc = fitz.open(cover_path)
        cover_pdf = fitz.open("pdf", img_doc.convert_to_pdf())
        doc.insert_pdf(cover_pdf)
    chapters_doc = fitz.open(temp_path)
    doc.insert_pdf(chapters_doc)
    doc.set_toc(toc)
    doc.save(output_path)
    chapters_doc.close()
    doc.close()
    if os.path.exists(temp_path):
        try:
            os.remove(temp_path)
        except Exception as e:
            print(f"Cleanup warning: {e}")
    return {"status": "success", "file": output_path, "total_pages": current_page - 1}