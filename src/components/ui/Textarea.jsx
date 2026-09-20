import React from 'react';

export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  fullWidth = true,
  disabled = false,
  rows = 4,
  maxLength,
  value,
  className = '',
  id,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} flex flex-col gap-1.5`}>
      <div className="flex items-center justify-between">
        {label && (
          <label 
            htmlFor={textareaId}
            className="text-xs font-medium text-[#94A3B8] tracking-wide"
          >
            {label}
          </label>
        )}
        {maxLength && (
          <span className="text-[11px] text-[#64748B]">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        value={value}
        className={`w-full bg-[#131D31] border text-[#F8FAFC] placeholder-[#64748B] text-sm rounded-lg p-3 transition-all duration-150 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed custom-scrollbar resize-y
          ${error 
            ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]' 
            : 'border-white/10 hover:border-white/20 focus:border-[#06B6D4] focus:ring-[#06B6D4]'
          }
          ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs text-[#F87171] mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#64748B] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
