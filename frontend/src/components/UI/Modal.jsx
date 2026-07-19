import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

/**
 * Reusable modal overlay using React Portals to render at the top level of the document body.
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Stop background scrolling
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop blur overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 shadow-2xl rounded-2xl p-6 z-10 animate-in fade-in zoom-in-95 duration-200 ${className}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
