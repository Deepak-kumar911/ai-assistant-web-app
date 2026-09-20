import React from 'react';

export const Badge = ({
  children,
  variant = 'default', // 'default' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
  styleType = 'subtle', // 'subtle' | 'solid' | 'outline'
  dot = false,
  size = 'md', // 'sm' | 'md'
  className = '',
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5'
  };

  const variantStyles = {
    default: {
      subtle: 'bg-[#1E293B] text-[#94A3B8] border border-white/10',
      solid: 'bg-[#334155] text-white',
      outline: 'bg-transparent text-[#94A3B8] border border-white/20',
      dotColor: 'bg-[#94A3B8]'
    },
    accent: {
      subtle: 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30',
      solid: 'bg-[#06B6D4] text-[#080C14] font-semibold',
      outline: 'bg-transparent text-[#06B6D4] border border-[#06B6D4]',
      dotColor: 'bg-[#06B6D4]'
    },
    success: {
      subtle: 'bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/30',
      solid: 'bg-[#10B981] text-white font-medium',
      outline: 'bg-transparent text-[#34D399] border border-[#10B981]',
      dotColor: 'bg-[#10B981]'
    },
    warning: {
      subtle: 'bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/30',
      solid: 'bg-[#F59E0B] text-black font-semibold',
      outline: 'bg-transparent text-[#FBBF24] border border-[#F59E0B]',
      dotColor: 'bg-[#F59E0B]'
    },
    danger: {
      subtle: 'bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/30',
      solid: 'bg-[#EF4444] text-white font-medium',
      outline: 'bg-transparent text-[#F87171] border border-[#EF4444]',
      dotColor: 'bg-[#EF4444]'
    },
    info: {
      subtle: 'bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/30',
      solid: 'bg-[#3B82F6] text-white font-medium',
      outline: 'bg-transparent text-[#60A5FA] border border-[#3B82F6]',
      dotColor: 'bg-[#3B82F6]'
    },
    cyan: {
      subtle: 'bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/30',
      solid: 'bg-[#06B6D4] text-[#080C14] font-semibold',
      outline: 'bg-transparent text-[#06B6D4] border border-[#06B6D4]',
      dotColor: 'bg-[#06B6D4]'
    },
    emerald: {
      subtle: 'bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/30',
      solid: 'bg-[#10B981] text-white font-medium',
      outline: 'bg-transparent text-[#34D399] border border-[#10B981]',
      dotColor: 'bg-[#10B981]'
    },
    amber: {
      subtle: 'bg-[#F59E0B]/10 text-[#FBBF24] border border-[#F59E0B]/30',
      solid: 'bg-[#F59E0B] text-black font-semibold',
      outline: 'bg-transparent text-[#FBBF24] border border-[#F59E0B]',
      dotColor: 'bg-[#F59E0B]'
    },
    violet: {
      subtle: 'bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/30',
      solid: 'bg-[#8B5CF6] text-white font-medium',
      outline: 'bg-transparent text-[#A78BFA] border border-[#8B5CF6]',
      dotColor: 'bg-[#8B5CF6]'
    },
    pink: {
      subtle: 'bg-[#EC4899]/10 text-[#F472B6] border border-[#EC4899]/30',
      solid: 'bg-[#EC4899] text-white font-medium',
      outline: 'bg-transparent text-[#F472B6] border border-[#EC4899]',
      dotColor: 'bg-[#EC4899]'
    },
    gray: {
      subtle: 'bg-white/5 text-[#94A3B8] border border-white/10',
      solid: 'bg-[#334155] text-white',
      outline: 'bg-transparent text-[#94A3B8] border border-white/20',
      dotColor: 'bg-[#94A3B8]'
    }
  };

  const selectedVariant = variantStyles[variant] || variantStyles.default;
  const selectedStyle = selectedVariant[styleType] || selectedVariant.subtle;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full transition-colors duration-150 select-none ${sizeStyles[size] || sizeStyles.md} ${selectedStyle} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedVariant.dotColor}`} />
      )}
      {children}
    </span>
  );
};

export default Badge;
