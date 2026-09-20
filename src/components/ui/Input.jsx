import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  iconRight: IconRight,
  fullWidth = true,
  disabled = false,
  className = '',
  id,
  type = 'text',
  showPasswordToggle,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const isPassword = type === 'password';
  const hasPasswordToggle = showPasswordToggle !== undefined ? showPasswordToggle : isPassword;
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} flex flex-col gap-1.5`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="text-xs font-medium text-[#94A3B8] tracking-wide"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-[#64748B] pointer-events-none flex items-center">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          disabled={disabled}
          className={`w-full bg-[#131D31] border text-[#F8FAFC] placeholder-[#64748B] text-sm rounded-lg px-3.5 py-2 transition-all duration-150 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed
            ${Icon ? 'pl-9' : ''}
            ${hasPasswordToggle || IconRight ? 'pr-10' : ''}
            ${error 
              ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]' 
              : 'border-white/10 hover:border-white/20 focus:border-[#06B6D4] focus:ring-[#06B6D4]'
            }
            ${className}`}
          {...props}
        />

        {hasPasswordToggle ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 text-[#64748B] hover:text-[#F8FAFC] transition-colors p-1 rounded focus:outline-none focus:text-[#06B6D4]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        ) : IconRight ? (
          <div className="absolute right-3 text-[#64748B] pointer-events-none flex items-center">
            <IconRight className="w-4 h-4" />
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-[#F87171] mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#64748B] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
