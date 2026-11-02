import EditorCanvas from './components/EditorCanvas';
import './App.css';
function App() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>Book Forge</h2>
        <div className="nav-links">
          <button className="active-nav">Canvas / Editor</button>
          <button>Mastering Pipeline</button>
          <button>Ollama Assistant</button>
        </div>
      </aside>
      <main className="main-workspace">
        <EditorCanvas />
      </main>
    </div>
  );
}
export default App;
