import React from 'react';
import { Modal, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Trash2, AlertCircle, HelpCircle } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone. Please confirm to proceed.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive', // 'destructive' | 'primary' | 'warning'
  loading = false,
  icon: CustomIcon,
  children
}) => {
  const icons = {
    destructive: Trash2,
    warning: AlertTriangle,
    primary: HelpCircle
  };

  const Icon = CustomIcon || icons[variant] || AlertCircle;

  const headerColors = {
    destructive: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30',
    warning: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
    primary: 'text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30'
  };

  const buttonVariants = {
    destructive: 'destructive',
    warning: 'primary',
    primary: 'primary'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? undefined : onClose}
      size="sm"
      showCloseButton={!loading}
    >
      <ModalBody className="pt-6 text-center flex flex-col items-center">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 shadow-lg ${headerColors[variant] || headerColors.primary}`}>
          <Icon className="w-6 h-6" />
        </div>

        <h3 className="text-base md:text-lg font-semibold text-[#F8FAFC] tracking-tight mb-1.5">
          {title}
        </h3>

        <p className="text-xs md:text-sm text-[#94A3B8] leading-relaxed max-w-xs">
          {description}
        </p>

        {children}
      </ModalBody>

      <ModalFooter className="justify-center gap-2.5">
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={onClose}
        >
          {cancelText}
        </Button>

        <Button
          variant={buttonVariants[variant] || 'primary'}
          size="sm"
          loading={loading}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmDialog;
