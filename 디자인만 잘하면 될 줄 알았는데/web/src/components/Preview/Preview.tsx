import styled from '@emotion/styled';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useMemo } from 'react';

interface PreviewProps {
  content: string;
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

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #2d2d2d;
  color: #cccccc;
  font-family: 'Pretendard', -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1.6;

  h1, h2, h3, h4, h5, h6 {
    color: #ffffff;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
  }

  h1 { font-size: 1.8em; border-bottom: 1px solid #3c3c3c; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; }
  h3 { font-size: 1.2em; }

  p { margin: 0.8em 0; }

  code {
    background: #1e1e1e;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9em;
  }

  pre {
    background: #1e1e1e;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;

    code {
      background: none;
      padding: 0;
    }
  }

  ul, ol {
    padding-left: 1.5em;
    margin: 0.5em 0;
  }

  li { margin: 0.3em 0; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
  }

  th, td {
    border: 1px solid #3c3c3c;
    padding: 8px 12px;
    text-align: left;
  }

  th {
    background: #1e1e1e;
    font-weight: 600;
  }

  blockquote {
    border-left: 3px solid #0078d4;
    margin: 1em 0;
    padding: 0.5em 1em;
    background: rgba(0, 120, 212, 0.1);
  }

  hr {
    border: none;
    border-top: 1px solid #3c3c3c;
    margin: 1.5em 0;
  }
`;

// Custom components for special markdown syntax
const Conversation = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
`;

const ChatBubble = styled.div<{ speaker: 'hanib' | 'n' }>`
  max-width: 85%;
  padding: 12px 16px;
  border-radius: 16px;
  align-self: ${props => props.speaker === 'hanib' ? 'flex-start' : 'flex-end'};
  background: ${props => props.speaker === 'hanib' ? '#e3f2fd' : '#f3e5f5'};
  color: #1e1e1e;
`;

const Speaker = styled.div`
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #666;
`;

const YamaBox = styled.div`
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  color: #1e1e1e;
  font-weight: 500;
  text-align: center;
  font-size: 1.1em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const CalloutBox = styled.div<{ type: string }>`
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  background: ${props => {
    switch (props.type) {
      case 'tip': return 'rgba(76, 175, 80, 0.15)';
      case 'warning': return 'rgba(255, 152, 0, 0.15)';
      case 'quote': return 'rgba(0, 120, 212, 0.1)';
      default: return 'rgba(100, 100, 100, 0.1)';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'tip': return '#4caf50';
      case 'warning': return '#ff9800';
      case 'quote': return '#0078d4';
      default: return '#808080';
    }
  }};
`;

const IllustPlaceholder = styled.div`
  background: linear-gradient(45deg, #3c3c3c, #4a4a4a);
  border: 2px dashed #666;
  border-radius: 8px;
  padding: 40px;
  margin: 16px 0;
  text-align: center;
  color: #999;

  .id {
    font-family: monospace;
    font-size: 12px;
    background: #1e1e1e;
    padding: 4px 8px;
    border-radius: 4px;
    display: inline-block;
    margin-bottom: 8px;
  }

  .desc {
    font-size: 14px;
  }
`;

const Highlight = styled.mark`
  background: rgba(255, 235, 59, 0.4);
  padding: 0 4px;
  border-radius: 2px;
`;

export function Preview({ content }: PreviewProps) {
  // Process custom syntax
  const processedContent = useMemo(() => {
    if (!content) return '';
    let result = content;

    // Process :::conversation blocks
    result = result.replace(
      /:::conversation\n([\s\S]*?):::/g,
      (_, inner) => {
        const lines = inner.trim().split('\n');
        const bubbles = lines
          .filter((l: string) => l.startsWith('**'))
          .map((l: string) => {
            const match = l.match(/\*\*(.+?)\*\*:\s*(.*)/);
            if (match) {
              const speaker = match[1].toLowerCase().includes('한입') ? 'hanib' : 'n';
              return `<div class="chat-bubble chat-${speaker}"><div class="chat-speaker">${match[1]}</div>${match[2]}</div>`;
            }
            return '';
          })
          .join('');
        return `<div class="conversation">${bubbles}</div>`;
      }
    );

    // Process :::yama blocks
    result = result.replace(
      /:::yama\n([\s\S]*?):::/g,
      (_, inner) => `<div class="yama-box">${inner.trim()}</div>`
    );

    // Process :::callout blocks
    result = result.replace(
      /:::callout\[(.+?)\]\n([\s\S]*?):::/g,
      (_, type, inner) => `<div class="callout-box" data-type="${type}">${inner.trim()}</div>`
    );

    // Process [illust: ...] directives
    result = result.replace(
      /\[illust:\s*ID="([^"]+)"\s*DESC="([^"]+)"\]/g,
      (_, id, desc) => `<div class="illust-placeholder"><div class="id">${id}</div><div class="desc">${desc}</div></div>`
    );

    // Process ==highlight==
    result = result.replace(
      /==(.+?)==/g,
      '<mark>$1</mark>'
    );

    return result;
  }, [content]);

  return (
    <Container>
      <Header>👁️ Preview</Header>
      <Content>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            // Custom renderers for our special elements
            div: ({ className, children, ...props }) => {
              if (className === 'conversation') {
                return <Conversation>{children}</Conversation>;
              }
              if (className?.startsWith('chat-bubble')) {
                const speaker = className.includes('hanib') ? 'hanib' : 'n';
                return <ChatBubble speaker={speaker}>{children}</ChatBubble>;
              }
              if (className === 'chat-speaker') {
                return <Speaker>{children}</Speaker>;
              }
              if (className === 'yama-box') {
                return <YamaBox>{children}</YamaBox>;
              }
              if (className === 'callout-box') {
                const type = (props as { 'data-type'?: string })['data-type'] || 'tip';
                return <CalloutBox type={type}>{children}</CalloutBox>;
              }
              if (className === 'illust-placeholder') {
                return <IllustPlaceholder>{children}</IllustPlaceholder>;
              }
              if (className === 'id' || className === 'desc') {
                return <div className={className}>{children}</div>;
              }
              return <div className={className} {...props}>{children}</div>;
            },
            mark: ({ children }) => <Highlight>{children}</Highlight>,
          }}
        >
          {processedContent}
        </ReactMarkdown>
      </Content>
    </Container>
  );
}
