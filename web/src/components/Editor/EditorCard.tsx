import styled from '@emotion/styled';
import MonacoEditor from '@monaco-editor/react';
import { useRef, useCallback, useState, useEffect } from 'react';
import type { editor } from 'monaco-editor';
import type { BookFile } from '../../types';

interface EditorCardProps {
  file: BookFile;
  content: string;
  onContentChange: (path: string, content: string) => void;
}

const Card = styled.div`
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
`;

const Header = styled.div`
  height: 40px;
  background: #2d2d2d;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 12px;
  color: #cccccc;
  border-bottom: 1px solid #3c3c3c;
  gap: 8px;
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FileName = styled.span`
  font-weight: 600;
  font-size: 13px;
`;

const FilePath = styled.span`
  color: #808080;
  font-size: 11px;
`;

const StatusBadge = styled.span<{ dirty?: boolean }>`
  margin-left: auto;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  background: ${props => props.dirty ? '#ff9800' : '#4caf50'};
  color: #fff;
`;

const EditorWrapper = styled.div<{ height: number }>`
  height: ${props => props.height}px;
  min-height: 100px;
`;

const API_BASE = '';

export function EditorCard({ file, content, onContentChange }: EditorCardProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [localContent, setLocalContent] = useState(content);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [editorHeight, setEditorHeight] = useState(300);

  // Sync content from props
  useEffect(() => {
    setLocalContent(content);
    setIsDirty(false);
  }, [content]);

  // Calculate height based on line count (no max limit for outer scroll)
  useEffect(() => {
    const lineCount = localContent.split('\n').length;
    const lineHeight = 20; // Approximate line height
    const padding = 40;
    const calculatedHeight = Math.max(100, lineCount * lineHeight + padding);
    setEditorHeight(calculatedHeight);
  }, [localContent]);

  const handleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  }, []);

  const handleChange = useCallback((value: string | undefined) => {
    const newContent = value || '';
    setLocalContent(newContent);
    setIsDirty(true);
    onContentChange(file.path, newContent);

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Auto-save after 1 second
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await fetch(`${API_BASE}/api/file`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: file.path,
            content: newContent,
          }),
        });
        setIsDirty(false);
      } catch (err) {
        console.error('Failed to save file:', err);
      } finally {
        setIsSaving(false);
      }
    }, 1000);
  }, [file.path, onContentChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const getFileIcon = (fileName: string) => {
    if (fileName.includes('conversation')) return '💬';
    if (fileName.includes('yama')) return '⭐';
    if (fileName.includes('body')) return '📄';
    return '📄';
  };

  return (
    <Card>
      <Header>
        <span>{getFileIcon(file.fileName)}</span>
        <FileInfo>
          <FileName>{file.fileName}</FileName>
          <FilePath>{file.title}</FilePath>
        </FileInfo>
        <StatusBadge dirty={isDirty}>
          {isSaving ? '저장 중...' : isDirty ? '수정됨' : '저장됨'}
        </StatusBadge>
      </Header>
      <EditorWrapper height={editorHeight}>
        <MonacoEditor
          height="100%"
          language="markdown"
          theme="vs-dark"
          value={localContent}
          onChange={handleChange}
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
    </Card>
  );
}
