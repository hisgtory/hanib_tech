import styled from '@emotion/styled';
import { useState, useEffect, useCallback, useRef } from 'react';
import { TreeView } from './components/TreeView/TreeView';
import { Editor, type EditorHandle } from './components/Editor/Editor';
import { Preview } from './components/Preview/Preview';
import { ClaudePanel } from './components/Claude/ClaudePanel';
import { GitPanel } from './components/GitPanel/GitPanel';
import { KeymapGuide } from './components/KeymapGuide/KeymapGuide';
import { ToastProvider } from './components/Toast';
import type { ContentTree } from './types';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  color: #cccccc;
`;

const Header = styled.header`
  height: 40px;
  background: #3c3c3c;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 600;
  border-bottom: 1px solid #252526;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const Sidebar = styled.aside`
  width: 280px;
  background: #252526;
  border-right: 1px solid #3c3c3c;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div`
  height: 35px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #808080;
  background: #2d2d2d;
  border-bottom: 1px solid #3c3c3c;
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const EditorPreviewContainer = styled.div`
  flex: 1;
  display: flex;
`;

const EditorPane = styled.div`
  flex: 1;
  border-right: 1px solid #3c3c3c;
`;

const PreviewPane = styled.div`
  flex: 1;
`;

const Placeholder = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;

  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
`;

const API_BASE = '';

function App() {
  const [tree, setTree] = useState<ContentTree | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showKeymapGuide, setShowKeymapGuide] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<EditorHandle>(null);

  // Load tree
  useEffect(() => {
    fetch(`${API_BASE}/api/tree`)
      .then(res => res.json())
      .then(data => setTree(data))
      .catch(err => console.error('Failed to load tree:', err));
  }, []);

  // Global ? key handler for keymap guide
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input or editor
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' ||
                       target.tagName === 'TEXTAREA' ||
                       target.closest('.monaco-editor');

      if (e.key === '?' && !isTyping) {
        e.preventDefault();
        setShowKeymapGuide(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load file content
  const loadFile = useCallback(async (path: string, name: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/file?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      setContent(data.content);
      setSelectedPath(path);
      setFileName(name);
      setIsDirty(false);
    } catch (err) {
      console.error('Failed to load file:', err);
    }
  }, []);

  // Load file content and focus editor (for Cmd+Enter)
  const loadFileWithFocus = useCallback(async (path: string, name: string) => {
    await loadFile(path, name);
    // Small delay to ensure editor is mounted and content is loaded
    setTimeout(() => {
      editorRef.current?.focus();
    }, 100);
  }, [loadFile]);

  // Auto-save with debounce
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(true);

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      if (selectedPath) {
        try {
          await fetch(`${API_BASE}/api/file`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              path: selectedPath,
              content: newContent,
            }),
          });
          setIsDirty(false);
        } catch (err) {
          console.error('Failed to save file:', err);
        }
      }
    }, 1000); // Save after 1 second of no typing
  }, [selectedPath]);

  // Reload current file (for when Claude modifies it)
  const reloadCurrentFile = useCallback(async () => {
    if (selectedPath) {
      try {
        const res = await fetch(`${API_BASE}/api/file?path=${encodeURIComponent(selectedPath)}`);
        const data = await res.json();
        setContent(data.content);
        setIsDirty(false);
      } catch (err) {
        console.error('Failed to reload file:', err);
      }
    }
  }, [selectedPath]);

  // Context paths for Claude (currently selected file)
  const contextPaths = selectedPath ? [selectedPath] : [];

  return (
    <ToastProvider>
    <AppContainer>
      <Header>
        <Logo>
          📚 Hanib Editor
          {isDirty && <span style={{ color: '#ff9800' }}>•</span>}
        </Logo>
      </Header>

      <MainContent>
        <Sidebar>
          <SidebarHeader>콘텐츠 탐색</SidebarHeader>
          <SidebarContent>
            <TreeView
              tree={tree}
              onSelectFile={loadFile}
              onSelectFileWithFocus={loadFileWithFocus}
              selectedPath={selectedPath}
            />
          </SidebarContent>
        </Sidebar>

        <EditorPreviewContainer>
          <EditorPane>
            {selectedPath ? (
              <Editor
                ref={editorRef}
                content={content}
                onChange={handleContentChange}
                fileName={fileName}
                filePath={selectedPath || ''}
              />
            ) : (
              <Placeholder>
                <div className="icon">📄</div>
                <div>왼쪽 트리에서 파일을 선택하세요</div>
              </Placeholder>
            )}
          </EditorPane>

          <PreviewPane>
            {selectedPath ? (
              <Preview content={content} />
            ) : (
              <Placeholder>
                <div className="icon">👁️</div>
                <div>프리뷰가 여기에 표시됩니다</div>
              </Placeholder>
            )}
          </PreviewPane>
        </EditorPreviewContainer>
      </MainContent>

      <GitPanel onSelectFile={loadFile} />

      <ClaudePanel
        contextPaths={contextPaths}
        onFileChange={reloadCurrentFile}
      />

      <KeymapGuide
        isOpen={showKeymapGuide}
        onClose={() => setShowKeymapGuide(false)}
      />
    </AppContainer>
    </ToastProvider>
  );
}

export default App;
