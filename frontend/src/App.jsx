import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import EditorCanvas from './components/EditorCanvas';
import MasteringPipeline from './components/MasteringPipeline';
import './App.css';
function App() {
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [activeView, setActiveView] = useState('editor');
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
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/api/system/upload-scan',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      if (res.data.status === 'success' && res.data.chapters.length > 0) {
        const currentChapterCount = chapters.length;
        for (let i = 0; i < res.data.chapters.length; i++) {
          const incomingChapter = res.data.chapters[i];
          await axios.post('http://127.0.0.1:8000/api/chapters/save', {
            title: incomingChapter.title,
            content: incomingChapter.content,
            project_id: 'default_project',
            order_index: currentChapterCount + i + 1,
          });
        }
        await fetchChapters();
        setActiveView('editor');
        setActiveChapter({
          title: res.data.chapters[0].title,
          content: res.data.chapters[0].content,
          project_id: 'default_project',
          order_index: currentChapterCount + 1,
        });
        event.target.value = null;
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to process the scan.');
    } finally {
      setIsUploading(false);
    }
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
          <button
            className={activeView === 'editor' ? 'active-nav' : ''}
            onClick={() => setActiveView('editor')}
          >
            Canvas / Editor
          </button>
          <button
            className={activeView === 'pipeline' ? 'active-nav' : ''}
            onClick={() => setActiveView('pipeline')}
          >
            Mastering Pipeline
          </button>
        </div>
        {/* Phase 6: Scrivener File Tree (Only relevant when in Editor view) */}
        <div className={`file-tree ${activeView !== 'editor' ? 'dimmed' : ''}`}>
          <div className="file-tree-header">
            <h3>Manuscript</h3>
            <div className="header-actions">
              <button
                className="add-chapter-btn"
                onClick={handleNewChapter}
                disabled={activeView !== 'editor'}
              >
                + New
              </button>
              <button
                className="add-chapter-btn scan-btn"
                onClick={() => fileInputRef.current.click()}
                disabled={activeView !== 'editor' || isUploading}
              >
                {isUploading ? 'Scanning...' : 'Import Scan'}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileUpload}
              />
            </div>
          </div>
          <div className="chapter-list">
            {chapters.map((chap) => (
              <div
                key={chap._id || chap.title}
                className={`chapter-item ${activeChapter?.title === chap.title ? 'active' : ''}`}
              >
                <span
                  onClick={() => {
                    setActiveChapter(chap);
                    setActiveView('editor');
                  }}
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
        {activeView === 'pipeline' ? (
          <MasteringPipeline
            chapters={chapters}
            refreshChapters={fetchChapters}
          />
        ) : activeChapter ? (
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
