# Book Forge

<div align="center">
  <!-- Replace banner.png with your professional header image in the public folder -->
  <img src="./frontend/public/banner.png" alt="Book Forge Banner" width="100%">

**A Dual-Engine AI Publishing & Authoring Environment**

</div>

---

## Purpose & Intent

Book Forge is a local, privacy-first writing and document mastery platform. Originally designed for authoring and structuring 200–300 page book manuscripts, its strict architectural formatting and AI integration make it equally powerful for corporate drafting, legal documentation, and technical reports.

It combines a React-based word processor with a Python PyMuPDF backend, allowing users to draft in a clean, distraction-free interface while a local LLM agent acts as a collaborative editor.

When the draft is ready, the backend binds the HTML canvas into a professionally formatted, double-spaced Master PDF.

## Core Features

- **The Canvas:** A headless Tiptap React editor enforcing traditional print formatting, including double-spacing, 0.5-inch paragraph indents, and centered headers.

- **Draggable AI Agent:** A free-floating UI panel connected directly to a local Ollama instance (`qwen2.5-coder:3b`), allowing for precise, coordinate-based text rewrites, dialogue punch-ups, and grammar polishing without losing focus.

- **The Binder Engine:** A FastAPI Python backend utilizing `fitz.DocumentWriter` to render HTML/CSS directly into physical PDF files with automatically generated Tables of Contents.

- **100% Local Privacy:** No cloud dependencies for AI processing or document rendering.

---

## Prerequisites

Before installing Book Forge, ensure the following dependencies are installed:

- **Node.js:** v18 or newer
- **Python:** 3.10 or newer
- **Ollama:** Installed and running locally with the `qwen2.5-coder:3b` model pulled.

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YourUsername/book-forge.git
cd book-forge
```

### 2. Start the Binder Engine (Backend)

Open your first terminal and initialize the Python backend.

**PowerShell:**

```powershell
cd backend

python -m venv .venv

.\.venv\Scripts\activate

pip install fastapi uvicorn pymupdf pydantic requests

python main.py
```

The API will start at:

`http://127.0.0.1:8000`

### 3. Start the Authoring Canvas (Frontend)

Open a second terminal window and initialize the React interface.

**PowerShell:**

```powershell
cd frontend

npm install

npm run dev
```

The Authoring Canvas will start at:

`http://localhost:5173`

---

## Usage

1. Open the Authoring Canvas in your browser.
2. Draft your document or paste in existing raw text.
3. Highlight any text you wish to improve.
4. Drag the Ollama Agent next to the selected text and choose an editing action.
5. Click **Publish Master PDF** in the toolbar to automatically compile and bind your document.

Your finished PDF will be saved in:

```text
backend/assets/master_outputs/
```

---

**Book Forge — Write locally. Edit intelligently. Publish professionally.**
