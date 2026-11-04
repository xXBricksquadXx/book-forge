from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
import uvicorn
import datetime
from core.agent import ask_ollama
from core.scanner import verify_engine
from core.binder import compile_book
from core.audio_prep import clean_for_elevenlabs
from core.database import chapters_col
app = FastAPI(title="The Binder Engine")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class AudioPrepRequest(BaseModel):
    raw_text: str
class BindRequest(BaseModel):
    title: str
    chapters: dict  
    cover_filename: str = None
    theme: str = "book" 
class ChapterModel(BaseModel):
    title: str
    content: str
    project_id: str = "default_project" 
    order_index: int = 0
class AIRequest(BaseModel):
    prompt: str
    context: str = "You are an expert creative writing assistant. Improve the following text for a book chapter."
    model: str = "qwen2.5-coder:3b"
@app.get("/")
def read_root():
    return {"engine": "Binder API Online", "status": "ready"}
@app.get("/api/system/ocr-check")
def check_ocr_status():
    return verify_engine()
@app.post("/api/audio/normalize")
def normalize_text(payload: AudioPrepRequest):
    cleaned_text = clean_for_elevenlabs(payload.raw_text)
    return {"status": "success", "cleaned_text": cleaned_text}
@app.post("/api/ai/suggest")
def get_ai_suggestion(payload: AIRequest):
    suggestion = ask_ollama(
        prompt=payload.prompt,
        system_context=payload.context,
        model=payload.model
    )
    return {"status": "success", "suggestion": suggestion}
@app.post("/api/publish/bind")
def bind_document(payload: BindRequest):
    output_dir = Path(__file__).resolve().parent / "assets" / "master_outputs"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{payload.title.replace(' ', '_')}_Master.pdf"
    cover_path = None
    if payload.cover_filename:
        cover_path = Path(__file__).resolve().parent / "assets" / "temp_scans" / payload.cover_filename
    result = compile_book(
        title=payload.title,
        chapters=payload.chapters,
        output_path=str(output_path),
        cover_path=str(cover_path) if cover_path else None,
        theme=payload.theme 
    )
    return result
@app.post("/api/chapters/save")
async def save_chapter(chapter: ChapterModel):
    """Upserts a chapter. If it exists (by title and project), it updates it. Otherwise, it creates it."""
    chapter_dict = chapter.model_dump()
    chapter_dict["last_updated"] = datetime.datetime.utcnow()
    result = await chapters_col.update_one(
        {"title": chapter.title, "project_id": chapter.project_id},
        {"$set": chapter_dict},
        upsert=True
    )
    return {"status": "success", "message": "Chapter saved successfully"}
@app.get("/api/chapters/list")
async def list_chapters(project_id: str = "default_project"):
    """Returns a list of all chapters for the sidebar file tree."""
    cursor = chapters_col.find({"project_id": project_id}).sort("order_index", 1)
    chapters = await cursor.to_list(length=100)
    for chapter in chapters:
        chapter["_id"] = str(chapter["_id"])
    return {"status": "success", "chapters": chapters}
@app.get("/api/chapters/{chapter_title}")
async def get_chapter(chapter_title: str, project_id: str = "default_project"):
    """Loads a specific chapter's HTML content into the Canvas."""
    chapter = await chapters_col.find_one({"title": chapter_title, "project_id": project_id})
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    chapter["_id"] = str(chapter["_id"])
    return {"status": "success", "chapter": chapter}
@app.delete("/api/chapters/{chapter_title}")
async def delete_chapter(chapter_title: str, project_id: str = "default_project"):
    """Deletes a chapter from the database."""
    result = await chapters_col.delete_one({"title": chapter_title, "project_id": project_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return {"status": "success", "message": "Chapter deleted"}
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)