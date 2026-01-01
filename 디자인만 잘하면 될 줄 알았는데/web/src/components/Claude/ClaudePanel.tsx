import styled from '@emotion/styled';
import { useState, useCallback, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ClaudePanelProps {
  contextPaths: string[];  // File paths as context
  onFileChange?: () => void;  // Callback when files might have changed
}

const Container = styled.div`
  position: fixed;
  bottom: 60px;
  right: 20px;
  width: 500px;
  height: 600px;
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 12px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #3c3c3c;
  font-weight: 600;
  color: #cccccc;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const CloseButton = styled.span`
  margin-left: auto;
  cursor: pointer;
  opacity: 0.6;
  &:hover { opacity: 1; }
`;

const ContextBar = styled.div`
  padding: 8px 12px;
  background: #252526;
  border-bottom: 1px solid #3c3c3c;
  font-size: 11px;
  color: #808080;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
  flex-shrink: 0;
`;

const ContextChip = styled.span`
  background: #1e3a5f;
  color: #4fc3f7;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div<{ role: 'user' | 'assistant' }>`
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  align-self: ${props => props.role === 'user' ? 'flex-end' : 'flex-start'};
  background: ${props => props.role === 'user' ? '#0078d4' : '#3c3c3c'};
  color: ${props => props.role === 'user' ? 'white' : '#cccccc'};
`;

const InputArea = styled.div`
  padding: 12px;
  background: #2d2d2d;
  border-top: 1px solid #3c3c3c;
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const TextArea = styled.textarea`
  flex: 1;
  background: #1e1e1e;
  border: 1px solid #3c3c3c;
  border-radius: 8px;
  padding: 10px 12px;
  color: #cccccc;
  font-size: 13px;
  resize: none;
  font-family: inherit;
  min-height: 40px;
  max-height: 120px;

  &:focus {
    outline: none;
    border-color: #0078d4;
  }

  &::placeholder {
    color: #666;
  }
`;

const SendButton = styled.button`
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  background: #0078d4;
  color: white;
  align-self: flex-end;

  &:hover:not(:disabled) {
    background: #1e90ff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 70px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0078d4, #00a8ff);
  border: none;
  cursor: pointer;
  font-size: 24px;
  box-shadow: 0 4px 16px rgba(0,120,212,0.4);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 24px rgba(0,120,212,0.6);
  }
`;

const StreamingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #3c3c3c;
  border-radius: 12px;
  align-self: flex-start;
  font-size: 13px;
  color: #999;

  .dots {
    display: flex;
    gap: 4px;
  }

  .dot {
    width: 6px;
    height: 6px;
    background: #0078d4;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
  }

  .dot:nth-of-type(1) { animation-delay: -0.32s; }
  .dot:nth-of-type(2) { animation-delay: -0.16s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  text-align: center;
  padding: 32px;

  .icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #999;
  }

  .desc {
    font-size: 13px;
    line-height: 1.5;
  }
`;

export function ClaudePanel({ contextPaths, onFileChange }: ClaudePanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage.content,
          filePaths: contextPaths,
        }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content' && data.text) {
                fullContent += data.text + '\n';
                setStreamingContent(fullContent);
              } else if (data.type === 'done') {
                // Notify that files might have changed
                onFileChange?.();
              }
            } catch {}
          }
        }
      }

      // Add assistant message
      if (fullContent.trim()) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: fullContent.trim(),
          timestamp: new Date(),
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `오류가 발생했습니다: ${err}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  }, [input, isStreaming, contextPaths, onFileChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  if (!isOpen) {
    return (
      <FloatingButton onClick={() => setIsOpen(true)} title="Claude Chat">
        🤖
      </FloatingButton>
    );
  }

  return (
    <Container>
      <Header>
        🤖 Claude Chat
        <CloseButton onClick={() => setIsOpen(false)}>✕</CloseButton>
      </Header>

      {contextPaths.length > 0 && (
        <ContextBar>
          <span>📎 컨텍스트:</span>
          {contextPaths.map(path => (
            <ContextChip key={path}>
              {path.split('/').pop()}
            </ContextChip>
          ))}
        </ContextBar>
      )}

      <MessagesContainer>
        {messages.length === 0 && !isStreaming ? (
          <EmptyState>
            <div className="icon">💬</div>
            <div className="title">Claude와 대화하세요</div>
            <div className="desc">
              파일 수정을 요청하면 Claude가<br />
              직접 파일을 수정합니다.
            </div>
          </EmptyState>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} role={msg.role}>
                {msg.content}
              </MessageBubble>
            ))}
            {isStreaming && (
              streamingContent ? (
                <MessageBubble role="assistant">
                  {streamingContent}
                </MessageBubble>
              ) : (
                <StreamingIndicator>
                  <div className="dots">
                    <div className="dot" />
                    <div className="dot" />
                    <div className="dot" />
                  </div>
                  응답 중...
                </StreamingIndicator>
              )
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputArea>
        <TextArea
          placeholder="메시지를 입력하세요... (Shift+Enter: 줄바꿈)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isStreaming}
          rows={1}
        />
        <SendButton onClick={handleSend} disabled={isStreaming || !input.trim()}>
          {isStreaming ? '...' : '전송'}
        </SendButton>
      </InputArea>
    </Container>
  );
}
