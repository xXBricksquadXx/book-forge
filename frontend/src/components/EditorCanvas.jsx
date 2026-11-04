import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';

export default function EditorCanvas() {
  const [aiResponse, setAiResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectionRange, setSelectionRange] = useState(null);

  // Phase 5.5 UI State
  const [isMinimized, setIsMinimized] = useState(false);
  const [persona, setPersona] = useState('creative');
  const [modelName, setModelName] = useState('qwen2.5-coder:3b');

  const dragRef = useRef(null);

  const [availableModels, setAvailableModels] = useState([
    { name: 'qwen2.5-coder:3b' },
  ]);
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await axios.get('http://localhost:11434/api/tags');
        if (res.data && res.data.models) {
          setAvailableModels(res.data.models);
          // Default to the first model in your library if Qwen isn't found
          setModelName(res.data.models[0].name);
        }
      } catch (error) {
        console.error(error);
        setAiResponse('Ollama API not detected, using fallback models.');
      } finally {
        setIsThinking(false);
      }
    };
    fetchModels();
  }, []);

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

  // Dynamic Persona Prompts
  const getSystemContext = () => {
    switch (persona) {
      case 'legal':
        return 'You are a precise legal assistant. Ensure the text uses formal legal terminology, maintains objective tone, and is structured perfectly. Return ONLY the rewritten text. Do not include introductory filler.';
      case 'corporate':
        return 'You are a professional corporate communications expert. Make the text concise, professional, and action-oriented. Return ONLY the rewritten text. Do not include introductory filler.';
      case 'creative':
      default:
        return 'You are an expert creative writing editor helping an author. Return ONLY the rewritten or improved text. Do not include any conversational filler, meta-commentary, or introductory phrases.';
    }
  };

  const handleAskAI = async (instruction) => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');

    if (!selectedText) {
      alert('Highlight a sentence or paragraph on the page first.');
      return;
    }

    setSelectionRange({ from, to });
    setIsThinking(true);
    setAiResponse('');

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ai/suggest', {
        prompt: `Instruction: ${instruction}\n\nText:\n${selectedText}`,
        context: getSystemContext(),
        model: modelName,
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
    if (selectionRange) {
      editor.commands.insertContentAt(
        { from: selectionRange.from, to: selectionRange.to },
        aiResponse,
      );
    } else {
      editor.chain().focus().insertContent(aiResponse).run();
    }
    setAiResponse('');
    setSelectionRange(null);
  };

  const handleExport = async () => {
    if (!editor) return;
    const bookTitle = prompt(
      'Enter your document title for the Master PDF:',
      'My_Document',
    );
    if (!bookTitle) return;

    const documentHTML = editor.getHTML();

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/publish/bind', {
        title: bookTitle,
        chapters: { Document: documentHTML },
      });
      if (res.data.status === 'success') {
        alert(
          `Document successfully bound! Check backend/assets/master_outputs/`,
        );
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
            Header
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

      {/* Draggable Agent with Minimize Feature */}
      <Draggable handle=".drag-handle" nodeRef={dragRef}>
        <div
          className={`agent-panel ${isMinimized ? 'minimized' : ''}`}
          ref={dragRef}
        >
          <div className="drag-handle">
            {/* Renamed to reflect the agnostic nature of the tool */}
            <h3 className="glow-text">Forge Agent</h3>
            <div className="panel-controls">
              <button
                className="minimize-btn"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? '+' : '−'}
              </button>
              <span className="drag-icon">⋮⋮</span>
            </div>
          </div>

          {!isMinimized && (
            <div className="agent-content">
              <div className="agent-config">
                <select
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="agent-select"
                >
                  {availableModels.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.name}
                    </option>
                  ))}
                </select>

                <select
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  className="agent-select"
                >
                  <option value="creative">Creative Editor</option>
                  <option value="legal">Legal Aide</option>
                  <option value="corporate">Corporate Writer</option>
                </select>
              </div>

              <p className="agent-instructions">
                Highlight text on the page, then select an action below.
              </p>

              <div className="agent-actions">
                <button
                  onClick={() =>
                    handleAskAI(
                      'Rewrite this to be more descriptive and engaging.',
                    )
                  }
                  disabled={isThinking}
                >
                  Expand / Polish
                </button>
                <button
                  onClick={() =>
                    handleAskAI(
                      'Fix any grammar issues and make the prose flow naturally.',
                    )
                  }
                  disabled={isThinking}
                >
                  Fix Grammar
                </button>
                <button
                  onClick={() =>
                    handleAskAI(
                      'Rewrite this to fit the selected persona perfectly.',
                    )
                  }
                  disabled={isThinking}
                >
                  Apply Persona
                </button>
              </div>

              <div className="agent-output">
                {isThinking && (
                  <p className="thinking-text">Model is thinking...</p>
                )}
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
          )}
        </div>
      </Draggable>
    </div>
  );
}
