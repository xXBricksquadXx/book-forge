import { useState, useEffect } from 'react';
import axios from 'axios';
import EditorCanvas from './components/EditorCanvas';
import './App.css';
function App() {
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const fetchChapters = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/chapters/list');
      setChapters(res.data.chapters);
      setActiveChapter((prevActive) => {
        if (res.data.chapters.length > 0 && !prevActive) {
          return res.data.chapters[0];
        }
        return prevActive;
      });
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };
  useEffect(() => {
    const initLoad = async () => {
      await fetchChapters();
    };
    initLoad();
  }, []);
  const handleNewChapter = () => {
    const title = prompt(
      "Enter a title for the new chapter (e.g., 'Chapter 2'):",
    );
    if (!title) return;
    const newChapter = {
      title: title,
      content: `<h2>${title}</h2><p>Start writing here...</p>`,
      project_id: 'default_project',
      order_index: chapters.length + 1,
    };
    setActiveChapter(newChapter);
  };
  const handleDeleteChapter = async (title) => {
    if (!window.confirm(`Are you sure you want to delete ${title}?`)) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/chapters/${title}`);
      if (activeChapter && activeChapter.title === title) {
        setActiveChapter(null);
      }
      fetchChapters();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Failed to delete chapter.');
    }
  };
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>Book Forge</h2>
        <div className="nav-links">
          <button className="active-nav">Canvas / Editor</button>
          <button>Mastering Pipeline</button>
        </div>
        {/* Phase 6: Scrivener File Tree */}
        <div className="file-tree">
          <div className="file-tree-header">
            <h3>Manuscript</h3>
            <button className="add-chapter-btn" onClick={handleNewChapter}>
              + New
            </button>
          </div>
          <div className="chapter-list">
            {chapters.map((chap) => (
              <div
                key={chap._id || chap.title}
                className={`chapter-item ${activeChapter?.title === chap.title ? 'active' : ''}`}
              >
                <span
                  onClick={() => setActiveChapter(chap)}
                  className="chapter-title"
                >
                  {chap.title}
                </span>
                <button
                  className="delete-chapter-btn"
                  onClick={() => handleDeleteChapter(chap.title)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
      <main className="main-workspace">
        {}
        {activeChapter ? (
          <EditorCanvas
            activeChapter={activeChapter}
            refreshSidebar={fetchChapters}
          />
        ) : (
          <div className="empty-state">
            <h2 className="glow-text">No Chapter Selected</h2>
            <p>
              Select a chapter from the sidebar or create a new one to begin
              forging.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
export default App;
