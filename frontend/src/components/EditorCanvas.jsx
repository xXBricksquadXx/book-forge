import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
export default function EditorCanvas() {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start authoring your chapter or paste OCR text here...</p>',
    editorProps: {
      attributes: {
        class: 'prose focus:outline-none',
      },
    },
  });
  if (!editor) return null;
  return (
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
      </div>
      <div className="page-sheet">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
