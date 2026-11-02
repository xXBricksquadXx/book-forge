import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState, useRef } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
export default function EditorCanvas() {
  const [aiResponse, setAiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const dragRef = useRef(null);
  const editor = useEditor({
    extensions: [StarterKit],
    content:
      '<h2>Chapter 1: The Beginning</h2><p>Start authoring your story here. Highlight any text and use the Agent Panel to improve it.</p>',
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none',
      },
    },
  });
  const handleAskAI = async (instruction) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
    if (!selectedText) {
      alert('Highlight a sentence or paragraph on the page first.');
      return;
    }
    setIsThinking(true);
    setAiResponse('');
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ai/suggest', {
        prompt: `Instruction: ${instruction}\n\nText:\n${selectedText}`,
        context:
          'You are an expert creative writing editor helping an author. Return ONLY the rewritten or improved text. Do not include any conversational filler, meta-commentary, or introductory phrases.',
        model: 'qwen2.5-coder:3b',
      });
      setAiResponse(res.data.suggestion);
    } catch (error) {
      console.error(error);
      setAiResponse('Error communicating with the local API.');
    } finally {
      setIsThinking(false);
    }
  };
  const applySuggestion = () => {
    editor.chain().focus().insertContent(aiResponse).run();
    setAiResponse('');
  };
  const handleExport = async () => {
    if (!editor) return;
    const bookTitle = prompt(
      'Enter your book title for the Master PDF:',
      'My_Original_Story',
    );
    if (!bookTitle) return;
    const documentHTML = editor.getHTML();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/publish/bind', {
        title: bookTitle,
        chapters: {
          'Chapter 1': documentHTML,
        },
      });
      if (res.data.status === 'success') {
        alert(`Book successfully bound! Check backend/assets/master_outputs/`);
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to the Binder Engine.');
    }
  };
  if (!editor) return null;
  return (
    <div className="workspace-grid">
      <div className="canvas-container">
        <div className="toolbar">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'active' : ''}
          >
            Bold
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'active' : ''}
          >
            Italic
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
          >
            Chapter Header
          </button>
          <button
            onClick={handleExport}
            style={{ marginLeft: 'auto', backgroundColor: '#2e7d32' }}
          >
            Publish Master PDF
          </button>
        </div>
        <div className="page-sheet">
          <EditorContent editor={editor} />
        </div>
      </div>
      {}
      <Draggable handle=".drag-handle" nodeRef={dragRef}>
        <div className="agent-panel" ref={dragRef}>
          <div className="drag-handle">
            <h3 className="glow-text">Ollama Agent</h3>
            <span className="drag-icon">⋮⋮</span>
          </div>
          <p className="agent-instructions">
            Highlight text on the page, then select an action below.
          </p>
          <div className="agent-actions">
            <button
              onClick={() =>
                handleAskAI('Rewrite this to be more descriptive and engaging.')
              }
              disabled={isThinking}
            >
              Expand & Describe
            </button>
            <button
              onClick={() =>
                handleAskAI(
                  'Fix any grammar issues and make the prose flow naturally.',
                )
              }
              disabled={isThinking}
            >
              Polish Grammar
            </button>
            <button
              onClick={() =>
                handleAskAI(
                  'Make this dialogue sound more natural, dramatic, and realistic.',
                )
              }
              disabled={isThinking}
            >
              Punch Up Dialogue
            </button>
          </div>
          <div className="agent-output">
            {isThinking && <p className="thinking-text">Qwen is thinking...</p>}
            {!isThinking && aiResponse && (
              <>
                <div className="suggestion-box">{aiResponse}</div>
                <button className="apply-btn" onClick={applySuggestion}>
                  Replace Text on Page
                </button>
              </>
            )}
          </div>
        </div>
      </Draggable>
    </div>
  );
}
