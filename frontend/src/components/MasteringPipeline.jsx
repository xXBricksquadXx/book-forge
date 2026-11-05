import { useState } from 'react';
import axios from 'axios';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sub-component for the draggable individual item
function SortableChapterItem({ chapter, index }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: chapter.title });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: transform ? 100 : 'auto', // Pops the item forward while dragging
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style} className="assembly-item">
      <span className="drag-handle-icon" {...attributes} {...listeners}>
        ⋮⋮
      </span>
      <span className="assembly-index">{index + 1}.</span>
      <span className="assembly-title">{chapter.title}</span>
    </div>
  );
}

export default function MasteringPipeline({ chapters, refreshChapters }) {
  const [theme, setTheme] = useState('book');
  const [isBinding, setIsBinding] = useState(false);

  // Configure sensors to allow clicking/dragging with mice, touch, or keyboards
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = chapters.findIndex((chap) => chap.title === active.id);
      const newIndex = chapters.findIndex((chap) => chap.title === over.id);

      const newArray = arrayMove(chapters, oldIndex, newIndex);

      // Build the dictionary payload for the backend: { "Chapter Title": new_order_index }
      const reorderPayload = {};
      newArray.forEach((chap, idx) => {
        reorderPayload[chap.title] = idx + 1;
      });

      try {
        await axios.post('http://127.0.0.1:8000/api/chapters/reorder', {
          chapter_orders: reorderPayload,
        });
        refreshChapters(); // Pull the freshly sorted list from MongoDB
      } catch (error) {
        console.error('Error reordering chapters:', error);
        alert('Failed to save new chapter order to the database.');
      }
    }
  };

  const handleMasterBind = async () => {
    if (chapters.length === 0) return;

    const bookTitle = prompt(
      'Enter a title for your Master PDF (no spaces preferred):',
      'Book_Forge_Master',
    );
    if (!bookTitle) return;

    setIsBinding(true);

    const chapterDict = {};
    chapters.forEach((chap) => {
      chapterDict[chap.title] = chap.content;
    });

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/publish/bind', {
        title: bookTitle,
        chapters: chapterDict,
        theme: theme,
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
          <p className="empty-text">No chapters found in the database.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={chapters.map((c) => c.title)}
              strategy={verticalListSortingStrategy}
            >
              <div className="sortable-list">
                {chapters.map((chap, index) => (
                  <SortableChapterItem
                    key={chap.title}
                    chapter={chap}
                    index={index}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
