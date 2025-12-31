import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

export interface ToastItemData {
  id: string;
  message: string;
  visible: boolean;
  exiting: boolean;
}

interface ToastProps {
  toasts: ToastItemData[];
}

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100px);
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 9999;
`;

const ToastItem = styled.div<{ exiting: boolean }>`
  padding: 12px 24px;
  background: #333;
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: ${props => props.exiting ? slideOut : slideIn} 0.3s ease forwards;
`;

export function Toast({ toasts }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <ToastContainer>
      {toasts.map(toast => (
        <ToastItem key={toast.id} exiting={toast.exiting}>
          {toast.message}
        </ToastItem>
      ))}
    </ToastContainer>
  );
}
