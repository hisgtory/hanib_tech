export const theme = {
  colors: {
    bg: '#1e1e1e',
    sidebar: '#252526',
    editor: '#1e1e1e',
    preview: '#2d2d2d',
    border: '#3c3c3c',
    text: '#cccccc',
    textMuted: '#808080',
    accent: '#0078d4',
    accentHover: '#1e90ff',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    // Chat colors
    chatHanib: '#e3f2fd',
    chatN: '#f3e5f5',
    yama: '#fff3e0',
    highlight: '#ffeb3b',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: '4px',
  fontFamily: {
    mono: "'JetBrains Mono', 'Fira Code', monospace",
    sans: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

export type Theme = typeof theme;
