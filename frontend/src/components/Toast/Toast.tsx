import React, { useEffect, useState } from 'react';
import type { ToastMessage } from '../../context/ToastContext';

interface ToastProps {
  toast: ToastMessage;
  removeToast: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, removeToast }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Start closing animation before actually removing
    const timer = setTimeout(() => {
      handleClose();
    }, 6000); // Wait 6 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for the slide-out animation to finish before removing from state
    setTimeout(() => {
      removeToast(toast.id);
    }, 400);
  };

  return (
    <div className={`toast toast-${toast.type} ${isClosing ? 'toast-closing' : ''}`}>
      <div className="toast-icon">
        {toast.type === 'success' && '✅'}
        {toast.type === 'error' && '❌'}
        {toast.type === 'info' && 'ℹ️'}
      </div>
      <div className="toast-message">{toast.message}</div>
      <button className="toast-close" onClick={handleClose} aria-label="Close">
        &times;
      </button>
      <div className={`toast-progress toast-progress-${toast.type}`} />
    </div>
  );
};
