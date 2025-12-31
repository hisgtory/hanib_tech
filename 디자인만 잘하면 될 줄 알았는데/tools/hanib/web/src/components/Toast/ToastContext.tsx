import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { Toast, type ToastItemData } from './Toast';

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItemData[]>([]);

  const showToast = useCallback((message: string, duration = 2000) => {
    const id = Date.now().toString();

    // Add new toast
    setToasts(prev => [...prev, { id, message, visible: true, exiting: false }]);

    // After duration, start exit animation
    setTimeout(() => {
      setToasts(prev => prev.map(t =>
        t.id === id ? { ...t, exiting: true } : t
      ));
    }, duration);

    // After exit animation, remove from array
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration + 300);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast toasts={toasts} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
