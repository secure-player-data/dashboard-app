import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Undo,
  Redo,
  Minus,
  Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const MenuBar = () => {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  editor.getHTML();

  const isActive = 'bg-border';
  const baseStyle =
    'border-[1.5px] p-1 px-2 rounded-sm hover:bg-muted/50 flex items-center';

  return (
    <div className="control-group tiptap">
      <div className="button-group flex gap-2 flex-wrap mt-1 mb-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`${baseStyle} ${editor.isActive('bold') ? isActive : ''}`}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`${baseStyle} ${editor.isActive('italic') ? isActive : ''}`}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={`${baseStyle} ${editor.isActive('strike') ? isActive : ''}`}
        >
          <Strikethrough size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={`${baseStyle} ${editor.isActive('code') ? isActive : ''}`}
        >
          <Code size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={`${baseStyle}`}
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          className={`${baseStyle}`}
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          className={`${baseStyle}`}
        >
          <Redo size={16} />
        </button>
      </div>
    </div>
  );
};

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false,
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false,
    },
  }),
];

const TiptapEditor = ({ onChange }: { onChange: (hmtl: string) => void }) => {
  return (
    <EditorProvider
      slotBefore={<MenuBar />}
      extensions={extensions}
      editorProps={{
        attributes: {
          class: 'min-h-[300px] p-4 border border-text-muted rounded-md',
          placeholder: 'Start typing here...',
        },
      }}
      onUpdate={(e) => onChange(e.editor.getHTML())}
    ></EditorProvider>
  );
};

export const TiptapPreview = ({ blob }: { blob: Blob }) => {
  const [content, setContent] = useState<string>('');
  const [showEditor, setShowEditor] = useState<boolean>(false);

  useEffect(() => {
    const loadContent = async () => {
      const text = await blob.text();
      setContent(text);
      setShowEditor(true);
    };

    loadContent();
  }, [blob]);

  if (!showEditor) {
    return <Loader2 className="size-4 animate-spin" />;
  }

  return (
    <EditorProvider
      extensions={extensions}
      editable={false}
      content={content}
    ></EditorProvider>
  );
};

export default TiptapEditor;
