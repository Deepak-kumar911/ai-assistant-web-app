import React from 'react';
import { Button } from './Button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export const ErrorState = ({
  icon: Icon = AlertCircle,
  title = 'Unable to load data',
  description = 'An error occurred while communicating with the server. Please try again.',
  error,
  onRetry,
  retryText = 'Retry',
  className = '',
  children
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-[#EF4444]/20 bg-[#0F172A]/80 backdrop-blur-md shadow-xl ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444] mb-4 shadow-lg shadow-[#EF4444]/10">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-base md:text-lg font-semibold text-[#F8FAFC] tracking-tight mb-1">
        {title}
      </h3>

      <p className="text-xs md:text-sm text-[#94A3B8] max-w-sm leading-relaxed mb-4">
        {description}
      </p>

      {error && (
        <div className="p-3 mb-6 rounded-lg bg-[#080C14] border border-white/10 max-w-md w-full text-left">
          <code className="text-xs text-[#F87171] font-mono break-all block">
            {typeof error === 'string' ? error : error?.message || JSON.stringify(error)}
          </code>
        </div>
      )}

      {children}

      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={RotateCcw}
          onClick={onRetry}
          className="border-[#EF4444]/30 hover:border-[#EF4444]/60"
        >
          {retryText}
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
