import React from 'react';
import { Loader2 } from 'lucide-react';

export const Skeleton = ({
  className = '',
  variant = 'text', // 'text' | 'circular' | 'rectangular' | 'card'
  width,
  height,
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'h-32 w-full rounded-2xl'
  };

  const inlineStyles = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {})
  };

  return (
    <div
      style={inlineStyles}
      className={`animate-pulse bg-[#1E293B]/80 border border-white/5 ${variantStyles[variant] || variantStyles.text} ${className}`}
      {...props}
    />
  );
};

export const LoadingState = ({
  message = 'Loading data...',
  description,
  className = '',
  size = 'md' // 'sm' | 'md' | 'lg'
}) => {
  const spinnerSizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-white/5 bg-[#0F172A]/40 backdrop-blur-sm ${className}`}>
      <div className="p-3 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 mb-3 text-[#06B6D4] shadow-lg shadow-[#06B6D4]/10">
        <Loader2 className={`${spinnerSizes[size] || spinnerSizes.md} animate-spin`} />
      </div>

      <h4 className="text-sm font-semibold text-[#F8FAFC] tracking-tight">
        {message}
      </h4>

      {description && (
        <p className="text-xs text-[#94A3B8] mt-1 max-w-xs">
          {description}
        </p>
      )}
    </div>
  );
};

export default LoadingState;
