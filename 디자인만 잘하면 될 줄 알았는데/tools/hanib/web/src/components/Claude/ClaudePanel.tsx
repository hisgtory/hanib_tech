import styled from '@emotion/styled';
import { useState, useCallback } from 'react';

interface ClaudePanelProps {
  selectedText: string;
  onInsert: (text: string) => void;
}

const Container = styled.div`
  position: fixed;
  bottom: 60px;
  right: 20px;
  width: 400px;
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  z-index: 1000;
`;

const Header = styled.div`
  padding: 12px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #3c3c3c;
  border-radius: 8px 8px 0 0;
  font-weight: 600;
  color: #cccccc;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Body = styled.div`
  padding: 16px;
`;

const SelectedText = styled.div`
  background: #2d2d2d;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #808080;
  max-height: 80px;
  overflow-y: auto;
  white-space: pre-wrap;
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 80px;
  background: #2d2d2d;
  border: 1px solid #3c3c3c;
  border-radius: 4px;
  padding: 12px;
  color: #cccccc;
  font-size: 13px;
  resize: none;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #0078d4;
  }

  &::placeholder {
    color: #666;
  }
`;

const ResponseArea = styled.div`
  background: #2d2d2d;
  border-radius: 4px;
  padding: 12px;
  margin-top: 12px;
  font-size: 13px;
  color: #cccccc;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  line-height: 1.5;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  background: ${props => props.primary ? '#0078d4' : '#3c3c3c'};
  color: ${props => props.primary ? 'white' : '#cccccc'};

  &:hover {
    background: ${props => props.primary ? '#1e90ff' : '#4a4a4a'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-end;
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 70px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0078d4, #00a8ff);
  border: none;
  cursor: pointer;
  font-size: 24px;
  box-shadow: 0 2px 10px rgba(0,120,212,0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 20px rgba(0,120,212,0.7);
  }
`;

export function ClaudePanel({ selectedText, onInsert }: ClaudePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          context: selectedText,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content') {
                fullResponse += data.text + '\n';
                setResponse(fullResponse);
              } else if (data.type === 'error') {
                setResponse(`Error: ${data.text}`);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      setResponse(`Error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedText]);

  const handleInsert = useCallback(() => {
    if (response) {
      onInsert(response);
      setIsOpen(false);
      setPrompt('');
      setResponse('');
    }
  }, [response, onInsert]);

  if (!isOpen) {
    return (
      <FloatingButton onClick={() => setIsOpen(true)} title="Claude AI">
        🤖
      </FloatingButton>
    );
  }

  return (
    <Container>
      <Header>
        🤖 Claude Assistant
        <span style={{ marginLeft: 'auto', cursor: 'pointer' }} onClick={() => setIsOpen(false)}>
          ✕
        </span>
      </Header>
      <Body>
        {selectedText && (
          <SelectedText>
            <strong>선택된 텍스트:</strong>
            <br />
            {selectedText.slice(0, 200)}{selectedText.length > 200 ? '...' : ''}
          </SelectedText>
        )}

        <TextArea
          placeholder="프롬프트를 입력하세요... (예: 이 내용을 더 친근하게 다듬어줘)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <ButtonRow>
          <Button onClick={() => setIsOpen(false)}>취소</Button>
          <Button primary onClick={handleSend} disabled={isLoading || !prompt.trim()}>
            {isLoading ? '생성 중...' : '보내기'}
          </Button>
        </ButtonRow>

        {response && (
          <>
            <ResponseArea>{response}</ResponseArea>
            <ButtonRow>
              <Button primary onClick={handleInsert}>
                에디터에 삽입
              </Button>
            </ButtonRow>
          </>
        )}
      </Body>
    </Container>
  );
}
