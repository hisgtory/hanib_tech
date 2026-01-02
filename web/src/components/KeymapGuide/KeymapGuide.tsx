import styled from '@emotion/styled';
import { useEffect, useCallback } from 'react';

interface KeymapGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #2d2d2d;
  border-radius: 12px;
  padding: 24px;
  max-width: 480px;
  width: 90%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid #3c3c3c;
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Section = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #808080;
  text-transform: uppercase;
  margin: 0 0 8px 0;
`;

const ShortcutList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ShortcutItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #252526;
  border-radius: 6px;
`;

const ShortcutLabel = styled.span`
  font-size: 13px;
  color: #cccccc;
`;

const ShortcutKeys = styled.span`
  display: flex;
  gap: 4px;
`;

const Key = styled.kbd`
  background: #3c3c3c;
  border: 1px solid #555;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
`;

const Footer = styled.div`
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #3c3c3c;
  text-align: center;
  color: #808080;
  font-size: 12px;
`;

export function KeymapGuide({ isOpen, onClose }: KeymapGuideProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === '?') {
      e.preventDefault();
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Title>Keyboard Shortcuts</Title>

        <Section>
          <SectionTitle>Tree Navigation</SectionTitle>
          <ShortcutList>
            <ShortcutItem>
              <ShortcutLabel>Move up/down</ShortcutLabel>
              <ShortcutKeys><Key>↑</Key><Key>↓</Key></ShortcutKeys>
            </ShortcutItem>
            <ShortcutItem>
              <ShortcutLabel>Expand/Collapse folder</ShortcutLabel>
              <ShortcutKeys><Key>→</Key><Key>←</Key></ShortcutKeys>
            </ShortcutItem>
            <ShortcutItem>
              <ShortcutLabel>Open file</ShortcutLabel>
              <ShortcutKeys><Key>Enter</Key></ShortcutKeys>
            </ShortcutItem>
            <ShortcutItem>
              <ShortcutLabel>Open file & edit</ShortcutLabel>
              <ShortcutKeys><Key>⌘</Key><Key>Enter</Key></ShortcutKeys>
            </ShortcutItem>
            <ShortcutItem>
              <ShortcutLabel>Episode merged view</ShortcutLabel>
              <ShortcutKeys><Key>⌘</Key><Key>Click</Key></ShortcutKeys>
            </ShortcutItem>
          </ShortcutList>
        </Section>

        <Section>
          <SectionTitle>Editor</SectionTitle>
          <ShortcutList>
            <ShortcutItem>
              <ShortcutLabel>Copy file path</ShortcutLabel>
              <ShortcutKeys><Key>⌘</Key><Key>⇧</Key><Key>C</Key></ShortcutKeys>
            </ShortcutItem>
            <ShortcutItem>
              <ShortcutLabel>Return to tree</ShortcutLabel>
              <ShortcutKeys><Key>Esc</Key></ShortcutKeys>
            </ShortcutItem>
          </ShortcutList>
        </Section>

        <Section>
          <SectionTitle>General</SectionTitle>
          <ShortcutList>
            <ShortcutItem>
              <ShortcutLabel>Show this help</ShortcutLabel>
              <ShortcutKeys><Key>?</Key></ShortcutKeys>
            </ShortcutItem>
          </ShortcutList>
        </Section>

        <Footer>
          Press <Key>?</Key> or <Key>Esc</Key> to close
        </Footer>
      </Modal>
    </Overlay>
  );
}
