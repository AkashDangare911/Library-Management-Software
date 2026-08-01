import React, { useEffect } from 'react';

interface GenericModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  
  // Optional custom actions. If provided, replaces the default Cancel/Confirm buttons.
  customActions?: React.ReactNode;

  // Default Action Props
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  cancelButtonClass?: string;
  isConfirmDisabled?: boolean;
}

export const GenericModal: React.FC<GenericModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  customActions,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonClass = 'borrow-btn', // Commonly used in this app for primary action
  cancelButtonClass = 'back-btn',    // Commonly used for cancellation
  isConfirmDisabled = false
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        
        <div className="modal-body">
          {children}
        </div>

        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
          {customActions ? (
            customActions
          ) : (
            <>
              <button className={cancelButtonClass} onClick={onClose}>{cancelText}</button>
              {onConfirm && (
                <button 
                  className={confirmButtonClass} 
                  onClick={onConfirm} 
                  disabled={isConfirmDisabled}
                >
                  {confirmText}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
