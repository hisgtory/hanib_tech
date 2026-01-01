import styled from '@emotion/styled';
import { useState, useEffect, useCallback } from 'react';
import type { RepoStatus } from '../../types';

interface GitPanelProps {
  onSelectFile?: (path: string, name: string) => void;
}

const Container = styled.div`
  background: #252526;
  border-top: 1px solid #3c3c3c;
`;

const MainRow = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 16px;
`;

const FilesRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  gap: 8px;
  border-top: 1px solid #3c3c3c;
  flex-wrap: wrap;
`;

const FileChip = styled.button<{ status: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 11px;
  background: ${props => {
    if (props.status === 'M') return '#5a4a2d';
    if (props.status === 'A' || props.status === '?') return '#2d5a2d';
    if (props.status === 'D') return '#5a2d2d';
    return '#3c3c3c';
  }};
  color: #cccccc;

  &:hover {
    filter: brightness(1.2);
  }

  .status {
    font-weight: 600;
    color: ${props => {
      if (props.status === 'M') return '#ffc107';
      if (props.status === 'A' || props.status === '?') return '#4caf50';
      if (props.status === 'D') return '#f44336';
      return '#808080';
    }};
  }
`;

const BranchBadge = styled.div<{ clean: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: ${props => props.clean ? '#2d5a2d' : '#5a4a2d'};
  border-radius: 4px;
  font-size: 12px;
  color: #cccccc;
`;

const CommitInput = styled.input`
  flex: 1;
  max-width: 400px;
  height: 30px;
  background: #3c3c3c;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  padding: 0 12px;
  color: #cccccc;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: #0078d4;
  }

  &::placeholder {
    color: #666;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'default' }>`
  height: 30px;
  padding: 0 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.variant === 'primary' ? '#0078d4' : '#3c3c3c'};
  color: ${props => props.variant === 'primary' ? 'white' : '#cccccc'};

  &:hover {
    background: ${props => props.variant === 'primary' ? '#1e90ff' : '#4a4a4a'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Status = styled.span`
  font-size: 12px;
  color: #808080;
`;

const ErrorText = styled.span`
  font-size: 12px;
  color: #f44336;
`;

export function GitPanel({ onSelectFile }: GitPanelProps) {
  const [status, setStatus] = useState<RepoStatus | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/git/status');
      const data = await res.json();
      setStatus(data);
      setError('');
    } catch (err) {
      setError('Git 상태를 가져올 수 없습니다');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleCommit = useCallback(async () => {
    if (!commitMessage.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      // Add all changes
      await fetch('/api/git/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: ['.'] }),
      });

      // Commit
      const res = await fetch('/api/git/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: commitMessage }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Commit failed');
      }

      setCommitMessage('');
      fetchStatus();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, [commitMessage, fetchStatus]);

  const handlePush = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/git/push', {
        method: 'POST',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Push failed');
      }

      fetchStatus();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsLoading(false);
    }
  }, [fetchStatus]);

  const handleFileClick = useCallback((filePath: string) => {
    if (onSelectFile) {
      const fileName = filePath.split('/').pop() || filePath;
      onSelectFile(filePath, fileName);
    }
  }, [onSelectFile]);

  if (!status?.hasRepo) {
    return (
      <Container>
        <MainRow>
          <Status>Git 저장소가 아닙니다</Status>
        </MainRow>
      </Container>
    );
  }

  const hasChanges = status.files && status.files.length > 0;

  return (
    <Container>
      <MainRow>
        <BranchBadge clean={status.clean}>
          🌿 {status.branch}
          {status.clean ? ' ✓' : ` (${status.files?.length || 0} changes)`}
          {status.ahead > 0 && ` ↑${status.ahead}`}
          {status.behind > 0 && ` ↓${status.behind}`}
        </BranchBadge>

        <CommitInput
          type="text"
          placeholder="커밋 메시지..."
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCommit()}
          disabled={status.clean || isLoading}
        />

        <Button
          onClick={handleCommit}
          disabled={status.clean || !commitMessage.trim() || isLoading}
        >
          {isLoading ? '...' : 'Commit'}
        </Button>

        <Button
          variant="primary"
          onClick={handlePush}
          disabled={isLoading || (status.clean && status.ahead === 0)}
        >
          Push
        </Button>

        {error && <ErrorText>{error}</ErrorText>}
      </MainRow>

      {hasChanges && (
        <FilesRow>
          {status.files.map((file) => (
            <FileChip
              key={file.path}
              status={file.status}
              onClick={() => handleFileClick(file.path)}
              title={file.path}
            >
              <span className="status">{file.status}</span>
              <span>{file.path.split('/').pop()}</span>
            </FileChip>
          ))}
        </FilesRow>
      )}
    </Container>
  );
}
