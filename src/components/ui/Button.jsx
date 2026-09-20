import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = React.forwardRef(({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size = 'md', // 'sm' | 'md' | 'lg' | 'icon'
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconRight: IconRight,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#080C14] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantStyles = {
    primary: 'bg-[#06B6D4] hover:bg-[#0891B2] text-[#080C14] font-semibold shadow-lg shadow-[#06B6D4]/20 focus:ring-[#06B6D4] active:bg-[#0E7490]',
    secondary: 'bg-[#1E293B] hover:bg-[#334155] text-[#F8FAFC] border border-white/10 hover:border-white/20 focus:ring-white/20 active:bg-[#0F172A]',
    ghost: 'bg-transparent hover:bg-white/5 text-[#94A3B8] hover:text-[#F8FAFC] focus:ring-white/10 active:bg-white/10',
    destructive: 'bg-[#EF4444] hover:bg-[#DC2626] text-white shadow-lg shadow-[#EF4444]/20 focus:ring-[#EF4444] active:bg-[#B91C1C]',
    outline: 'bg-transparent border border-[#06B6D4]/40 hover:border-[#06B6D4] text-[#06B6D4] hover:bg-[#06B6D4]/10 focus:ring-[#06B6D4]'
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-2.5 gap-2.5',
    icon: 'p-2 text-sm'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      
      {children && <span>{children}</span>}

      {!loading && IconRight && (
        <IconRight className="w-4 h-4 shrink-0" />
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
