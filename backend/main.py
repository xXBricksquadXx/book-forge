from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from core.scanner import verify_engine
from core.binder import compile_book
from core.audio_prep import clean_for_elevenlabs
from pathlib import Path
import uvicorn
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
        cover_path=str(cover_path) if cover_path else None
    )
    return result
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)