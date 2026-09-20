import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className = '',
  showCloseButton = true
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
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

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`relative w-full ${sizeClasses[size] || sizeClasses.md} bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col ${className}`}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-5 border-b border-white/5">
                <div>
                  {title && <h3 className="text-lg font-semibold text-[#F8FAFC] tracking-tight">{title}</h3>}
                  {description && <p className="text-xs text-[#94A3B8] mt-1">{description}</p>}
                </div>

                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/5 rounded-lg transition-colors focus:outline-none"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ModalBody = ({ children, className = '' }) => (
  <div className={`p-5 overflow-y-auto max-h-[70vh] custom-scrollbar ${className}`}>
    {children}
  </div>
);

export const ModalFooter = ({ children, className = '' }) => (
  <div className={`p-4 bg-[#131D31]/50 border-t border-white/5 flex items-center justify-end gap-3 ${className}`}>
    {children}
  </div>
);

export default Modal;
