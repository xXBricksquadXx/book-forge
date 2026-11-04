# Book Forge

<div align="center">
  <!-- Replace banner.png with your professional header image in the public folder -->
  <img src="./frontend/public/banner.png" alt="Book Forge Banner" width="100%">

**A Dual-Engine AI Publishing & Authoring Environment**

</div>

---

## Purpose & Intent

Book Forge is a local, privacy-first writing and document mastery platform. Originally designed for authoring and structuring 200–300 page book manuscripts using a Scrivener-style architecture, its strict architectural formatting and AI integration make it equally powerful for corporate drafting, legal documentation, and technical reports.

It combines a React-based word processor with a Python PyMuPDF backend, allowing users to draft in a clean, distraction-free interface while a local LLM agent acts as a collaborative editor.

When the draft is ready, the backend pulls the ordered chapters from a local database and binds the HTML into a professionally formatted Master PDF.

## Core Features

- **The Canvas:** A headless Tiptap React editor with an auto-save buffer to prevent data loss.
- **Scrivener-Style File Tree:** A dynamic sidebar backed by MongoDB to organize manuscripts chapter by chapter, preventing DOM performance degradation on massive documents.
- **Draggable AI Agent:** A free-floating, collapsible UI panel dynamically connected to your local Ollama models (e.g., `qwen2.5-coder:3b`). Execute precise, coordinate-based text rewrites, dialogue punch-ups, and grammar polishing without losing focus. Includes dynamic "Personas" for creative, corporate, or legal tones.
- **The Binder Engine:** A FastAPI Python backend utilizing `fitz.DocumentWriter` to safely render HTML/CSS directly into physical PDF files with automatically generated Tables of Contents.
- **100% Local Privacy:** No cloud dependencies for AI processing, data storage, or document rendering.

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

Open your first terminal and initialize the Python backend. Ensure your `.env` file contains `MONGO_URI="mongodb://localhost:27017"`

**PowerShell:**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
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

- Open the Authoring Canvas in your browser.

- Use the sidebar to create a + New chapter.

- Draft your document or paste in existing raw text. (Your work is auto-saved to a local browser buffer as you type).

- Highlight any text you wish to improve, configure the Forge Agent's persona, and choose an editing action.

- Click Save to Database to permanently write the chapter to MongoDB.

- Click Bind Current Chapter to render a local PDF of your active screen.

- Your finished PDF will be saved in:

```text
backend/assets/master_outputs/
```

---

## Roadmap & TL;DR

[x]: Vite/React shell, headless Tiptap canvas, and portable Tesseract OCR binary staging.

[x]: Free-floating draggable Ollama agent with dynamic model mapping and coordinate-based text replacement.

[x]: MongoDB database integration, Scrivener-style sidebar file tree, and CRUD functionality.

[ ](Mastering Pipeline): Build the Assembly Room dashboard to drag-and-drop chapter ordering, select global CSS themes (Book, Corporate, Legal), and compile the final multi-chapter PDF.

## [ ](The OCR Bridge): Connect the frontend to the staged Tesseract binary, allowing users to upload physical page scans and automatically convert them into editable MongoDB chapters.

### _Book Forge — Write locally. Edit intelligently. Publish professionally._
