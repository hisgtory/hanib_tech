import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import MonacoEditor from '@monaco-editor/react';
import { useRef, useCallback, useState } from 'react';
import type { editor } from 'monaco-editor';
import { useToast } from '../Toast';

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
  position: relative;
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideDown = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
`;

const CopyButton = styled.button<{ visible: boolean }>`
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 10px 20px;
  background: #3a3a3a;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  animation: ${props => props.visible ? slideUp : slideDown} 0.25s ease forwards;

  &:hover {
    background: #4a4a4a;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: scale(0.96);
  }
`;

export function Editor({ content, onChange, onSelectionChange, fileName }: EditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [selectedText, setSelectedText] = useState('');
  const { showToast } = useToast();

  const handleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Selection change listener
    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection();
      const text = editor.getModel()?.getValueInRange(selection!) || '';
      setSelectedText(text);
      if (onSelectionChange) {
        onSelectionChange(text);
      }
    });
  }, [onSelectionChange]);

  const handleCopy = useCallback(async () => {
    if (selectedText) {
      await navigator.clipboard.writeText(selectedText);
      showToast('복사되었습니다');
    }
  }, [selectedText, showToast]);

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
        <CopyButton visible={selectedText.length > 0} onClick={handleCopy}>
          복사
        </CopyButton>
      </EditorWrapper>
    </Container>
  );
}
