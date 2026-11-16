import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Monochromatic backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-overlay/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative w-full ${maxWidth} bg-surface rounded-card border border-border shadow-xl z-10 overflow-hidden flex flex-col max-h-[90vh]`}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-base font-bold text-main tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-control text-muted hover:text-main hover:bg-surface-2 transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
