import styled from '@emotion/styled';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const HeaderActions = styled.div`
  margin-left: auto;
  display: flex;
  gap: 8px;
`;

const HeaderButton = styled.button`
  background: #0078d4;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #1a86d9;
  }

  &:disabled {
    background: #555;
    cursor: not-allowed;
  }
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
  const location = useLocation();
  const navigate = useNavigate();

  const [tree, setTree] = useState<ContentTree | null>(null);
  const [fileName, setFileName] = useState('');
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [showKeymapGuide, setShowKeymapGuide] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editorRef = useRef<EditorHandle>(null);

  // Derive current path from URL
  const currentPath = location.pathname === '/' || location.pathname === '/all-preview'
    ? null
    : decodeURIComponent(location.pathname.slice(1)); // Remove leading /

  const isAllPreview = location.pathname === '/all-preview';
  const searchParams = new URLSearchParams(location.search);
  const isMergedView = searchParams.get('merged') === 'true';

  // Load tree
  useEffect(() => {
    fetch(`${API_BASE}/api/tree`)
      .then(res => res.json())
      .then(data => setTree(data))
      .catch(err => console.error('Failed to load tree:', err));
  }, []);

  // Load content based on URL
  useEffect(() => {
    if (isAllPreview) {
      // Load full book
      fetch(`${API_BASE}/api/book/merged`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setContent(data.content);
            setFileName('📚 전체 책 보기');
            setIsDirty(false);
          }
        })
        .catch(err => console.error('Failed to load merged book:', err));
    } else if (currentPath && isMergedView) {
      // Load merged episode view
      fetch(`${API_BASE}/api/episode/merged?path=${encodeURIComponent(currentPath)}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setContent(data.content);
            setFileName(`${currentPath.split('/').pop()} (전체 보기)`);
            setIsDirty(false);
          }
        })
        .catch(err => console.error('Failed to load merged episode:', err));
    } else if (currentPath) {
      // Load specific file
      fetch(`${API_BASE}/api/file?path=${encodeURIComponent(currentPath)}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            setContent(data.content);
            setFileName(currentPath.split('/').pop() || '');
            setIsDirty(false);
          }
        })
        .catch(err => console.error('Failed to load file:', err));
    } else {
      // Home - clear content
      setContent('');
      setFileName('');
    }
  }, [currentPath, isAllPreview, isMergedView]);

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

  // Navigate to file (replaces loadFile)
  const selectFile = useCallback((path: string, _name: string) => {
    navigate(`/${encodeURIComponent(path)}`);
  }, [navigate]);

  // Navigate to file and focus editor (for Cmd+Enter)
  const selectFileWithFocus = useCallback((path: string, _name: string) => {
    navigate(`/${encodeURIComponent(path)}`);
    // Small delay to ensure editor is mounted and content is loaded
    setTimeout(() => {
      editorRef.current?.focus();
    }, 100);
  }, [navigate]);

  // Navigate to episode merged view (for Cmd+Click on episode)
  const selectEpisodeMerged = useCallback((path: string, _name: string) => {
    // Episode merged view - use query param to indicate merged
    navigate(`/${encodeURIComponent(path)}?merged=true`);
  }, [navigate]);

  // Navigate to full book view
  const goToAllPreview = useCallback(() => {
    navigate('/all-preview');
  }, [navigate]);

  // Auto-save with debounce (only for single file view, not merged views)
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    setIsDirty(true);

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save (only for regular file view)
    saveTimeoutRef.current = setTimeout(async () => {
      if (currentPath && !isMergedView && !isAllPreview) {
        try {
          await fetch(`${API_BASE}/api/file`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              path: currentPath,
              content: newContent,
            }),
          });
          setIsDirty(false);
        } catch (err) {
          console.error('Failed to save file:', err);
        }
      }
    }, 1000); // Save after 1 second of no typing
  }, [currentPath, isMergedView, isAllPreview]);

  // Reload current file (for when Claude modifies it)
  const reloadCurrentFile = useCallback(async () => {
    if (currentPath && !isMergedView && !isAllPreview) {
      try {
        const res = await fetch(`${API_BASE}/api/file?path=${encodeURIComponent(currentPath)}`);
        const data = await res.json();
        setContent(data.content);
        setIsDirty(false);
      } catch (err) {
        console.error('Failed to reload file:', err);
      }
    }
  }, [currentPath, isMergedView, isAllPreview]);

  // Context paths for Claude (currently selected file)
  const contextPaths = currentPath ? [currentPath] : [];

  return (
    <ToastProvider>
    <AppContainer>
      <Header>
        <Logo>
          📚 Hanib Editor
          {isDirty && <span style={{ color: '#ff9800' }}>•</span>}
        </Logo>
        <HeaderActions>
          <HeaderButton onClick={goToAllPreview}>
            📖 전체 보기
          </HeaderButton>
        </HeaderActions>
      </Header>

      <MainContent>
        <Sidebar>
          <SidebarHeader>콘텐츠 탐색</SidebarHeader>
          <SidebarContent>
            <TreeView
              tree={tree}
              onSelectFile={selectFile}
              onSelectFileWithFocus={selectFileWithFocus}
              onSelectEpisodeMerged={selectEpisodeMerged}
              selectedPath={currentPath}
            />
          </SidebarContent>
        </Sidebar>

        <EditorPreviewContainer>
          <EditorPane>
            {currentPath || content ? (
              <Editor
                ref={editorRef}
                content={content}
                onChange={handleContentChange}
                fileName={fileName}
                filePath={currentPath || ''}
              />
            ) : (
              <Placeholder>
                <div className="icon">📄</div>
                <div>왼쪽 트리에서 파일을 선택하세요</div>
              </Placeholder>
            )}
          </EditorPane>

          <PreviewPane>
            {currentPath || content ? (
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

      <GitPanel onSelectFile={selectFile} />

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
