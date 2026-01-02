import styled from '@emotion/styled';
import { useState, useEffect, useCallback, useRef } from 'react';
import { EditorCard } from './EditorCard';
import { Preview } from '../Preview/Preview';
import type { BookFile } from '../../types';

const SplitContainer = styled.div`
  height: 100%;
  display: flex;
`;

const EditorPane = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #1e1e1e;
  border-right: 1px solid #3c3c3c;
`;

const PreviewPane = styled.div`
  flex: 1;
  overflow-y: auto;
  position: sticky;
  top: 0;
  height: 100%;
`;

const Header = styled.div`
  padding: 16px;
  margin-bottom: 16px;
  background: #2d2d2d;
  border-radius: 8px;
  border: 1px solid #3c3c3c;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px 0;
`;

const Stats = styled.div`
  font-size: 13px;
  color: #808080;
`;

const LoadingContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #808080;
  font-size: 14px;
`;

const SectionHeader = styled.div`
  padding: 12px 16px;
  margin: 24px 0 12px 0;
  background: #252526;
  border-radius: 6px;
  border-left: 4px solid #0078d4;
  font-size: 14px;
  font-weight: 600;
  color: #cccccc;

  &:first-of-type {
    margin-top: 0;
  }
`;

interface FileWithContent extends BookFile {
  content: string;
  loaded: boolean;
}

const API_BASE = '';

export function VirtualizedBookView() {
  const [files, setFiles] = useState<FileWithContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const contentCache = useRef<Map<string, string>>(new Map());
  const editorPaneRef = useRef<HTMLDivElement>(null);

  // Load a single file
  const loadFile = useCallback(async (path: string) => {
    if (contentCache.current.has(path)) {
      return contentCache.current.get(path)!;
    }

    try {
      const res = await fetch(`${API_BASE}/api/file?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (!data.error) {
        contentCache.current.set(path, data.content);
        return data.content;
      }
    } catch (err) {
      console.error(`Failed to load file ${path}:`, err);
    }
    return '';
  }, []);

  // Fetch file list
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/book/files`);
        const data = await res.json();

        if (data.error) {
          setError(data.error);
          return;
        }

        const filesWithContent: FileWithContent[] = data.files.map((f: BookFile) => ({
          ...f,
          content: '',
          loaded: false,
        }));

        setFiles(filesWithContent);

        // Load first 3 files immediately
        for (let i = 0; i < Math.min(3, filesWithContent.length); i++) {
          const content = await loadFile(filesWithContent[i].path);
          setFiles(prev => prev.map((f, idx) =>
            idx === i ? { ...f, content, loaded: true } : f
          ));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [loadFile]);

  // Load more files as user scrolls
  useEffect(() => {
    if (files.length === 0) return;

    const loadBuffer = 3;
    const start = Math.max(0, focusedIndex - loadBuffer);
    const end = Math.min(files.length, focusedIndex + loadBuffer + 1);

    const loadFilesInRange = async () => {
      for (let i = start; i < end; i++) {
        const file = files[i];
        if (file.loaded) continue;

        const content = await loadFile(file.path);
        setFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, content, loaded: true } : f
        ));
      }
    };

    loadFilesInRange();
  }, [focusedIndex, files, loadFile]);

  // Track which editor is in view
  useEffect(() => {
    const pane = editorPaneRef.current;
    if (!pane) return;

    const handleScroll = () => {
      const cards = pane.querySelectorAll('[data-file-index]');
      const paneRect = pane.getBoundingClientRect();
      const paneCenter = paneRect.top + paneRect.height / 3;

      let closestIndex = 0;
      let closestDistance = Infinity;

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const distance = Math.abs(cardCenter - paneCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = parseInt(card.getAttribute('data-file-index') || '0', 10);
        }
      });

      setFocusedIndex(closestIndex);
    };

    pane.addEventListener('scroll', handleScroll, { passive: true });
    return () => pane.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle content change from EditorCard
  const handleContentChange = useCallback((path: string, content: string) => {
    contentCache.current.set(path, content);
    // Update files state to reflect in preview
    setFiles((prev) =>
      prev.map((f) => (f.path === path ? { ...f, content } : f))
    );
  }, []);

  // Group files by episode for section headers
  const getEpisodeKey = (file: BookFile) => `${file.part}|${file.week}|${file.episode}`;

  if (loading) {
    return <LoadingContainer>파일 목록을 불러오는 중...</LoadingContainer>;
  }

  if (error) {
    return <LoadingContainer>오류: {error}</LoadingContainer>;
  }

  let lastEpisodeKey = '';
  const focusedFile = files[focusedIndex];

  return (
    <SplitContainer>
      <EditorPane ref={editorPaneRef}>
        <Header>
          <Title>전체 책 보기</Title>
          <Stats>
            총 {files.length}개 파일 | 현재: {focusedFile?.fileName || '-'}
          </Stats>
        </Header>

        {files.map((file, index) => {
          const episodeKey = getEpisodeKey(file);
          const showSectionHeader = episodeKey !== lastEpisodeKey;
          lastEpisodeKey = episodeKey;

          return (
            <div key={file.path} data-file-index={index}>
              {showSectionHeader && (
                <SectionHeader>
                  📝 {file.episode}
                </SectionHeader>
              )}
              {file.loaded ? (
                <EditorCard
                  file={file}
                  content={file.content}
                  onContentChange={handleContentChange}
                />
              ) : (
                <div style={{
                  height: 200,
                  background: '#252526',
                  border: '1px dashed #3c3c3c',
                  borderRadius: 8,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#555',
                  fontSize: 12,
                }}>
                  파일 로딩 중...
                </div>
              )}
            </div>
          );
        })}
      </EditorPane>

      <PreviewPane>
        <Preview content={focusedFile?.content || ''} />
      </PreviewPane>
    </SplitContainer>
  );
}
