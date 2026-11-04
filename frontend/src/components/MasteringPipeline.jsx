import { useState } from 'react';
import axios from 'axios';

export default function MasteringPipeline({ chapters }) {
  const [theme, setTheme] = useState('book');
  const [isBinding, setIsBinding] = useState(false);

  const handleMasterBind = async () => {
    if (chapters.length === 0) return;

    const bookTitle = prompt(
      'Enter a title for your Master PDF (no spaces preferred):',
      'Book_Forge_Master',
    );
    if (!bookTitle) return;

    setIsBinding(true);

    // Format the array of chapters into the dictionary structure the backend expects
    const chapterDict = {};
    chapters.forEach((chap) => {
      chapterDict[chap.title] = chap.content;
    });

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/publish/bind', {
        title: bookTitle,
        chapters: chapterDict,
        theme: theme, // Passing the selected theme to Python
      });

      if (res.data.status === 'success') {
        alert(
          `Document bound successfully! Check backend/assets/master_outputs/`,
        );
      }
    } catch (error) {
      console.error('Binding error:', error);
      alert('Error connecting to the Binder Engine.');
    } finally {
      setIsBinding(false);
    }
  };

  return (
    <div className="pipeline-dashboard">
      <div className="pipeline-header">
        <h2 className="glow-text">The Assembly Room</h2>
        <p>
          Drag and drop your chapters to reorder them, select a global
          formatting theme, and forge your master document.
        </p>
      </div>

      <div className="pipeline-controls">
        <div className="theme-selector">
          <label>Global Document Theme:</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="agent-select"
          >
            <option value="book">
              Paperback Book (Double Spaced, Indented)
            </option>
            <option value="corporate">
              Corporate Memo (Single Spaced, Block)
            </option>
            <option value="legal">
              Legal Document (Numbered, Strict Margins)
            </option>
            <option value="notes">Simple Notes (Minimalist)</option>
          </select>
        </div>

        <button
          className="apply-btn"
          onClick={handleMasterBind}
          disabled={chapters.length === 0 || isBinding}
          style={{ width: 'auto', padding: '10px 24px' }}
        >
          {isBinding ? 'Binding...' : 'Forge Master PDF'}
        </button>
      </div>

      <div className="chapter-assembly-list">
        <h3>Manuscript Order ({chapters.length} Chapters)</h3>
        {chapters.length === 0 ? (
          <p className="empty-text">
            No chapters found in the database. Go to the Canvas and save some
            work first.
          </p>
        ) : (
          <div className="sortable-list">
            {chapters.map((chap, index) => (
              <div key={chap._id} className="assembly-item">
                <span className="drag-handle-icon">⋮⋮</span>
                <span className="assembly-index">{index + 1}.</span>
                <span className="assembly-title">{chap.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
