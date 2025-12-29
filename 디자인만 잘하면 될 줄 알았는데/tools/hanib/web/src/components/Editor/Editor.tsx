import styled from '@emotion/styled';
import MonacoEditor from '@monaco-editor/react';
import { useRef, useCallback } from 'react';
import type { editor } from 'monaco-editor';

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
  onSelectionChange?: (text: string) => void;
  fileName: string;
}

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  height: 35px;
  background: #3c3c3c;
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 13px;
  color: #cccccc;
  border-bottom: 1px solid #252526;
`;

const EditorWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`;

export function Editor({ content, onChange, onSelectionChange, fileName }: EditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Selection change listener
    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection();
      if (selection && onSelectionChange) {
        const selectedText = editor.getModel()?.getValueInRange(selection) || '';
        onSelectionChange(selectedText);
      }
    });
  }, [onSelectionChange]);

  return (
    <Container>
      <Header>
        📄 {fileName || 'No file selected'}
      </Header>
      <EditorWrapper>
        <MonacoEditor
          height="100%"
          language="markdown"
          theme="vs-dark"
          value={content}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            scrollBeyondLastLine: false,
            padding: { top: 8, bottom: 8 },
            automaticLayout: true,
          }}
        />
      </EditorWrapper>
    </Container>
  );
}
