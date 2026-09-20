import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({
  label,
  error,
  helperText,
  options = [],
  children,
  fullWidth = true,
  disabled = false,
  className = '',
  id,
  ...props
}, ref) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`${fullWidth ? 'w-full' : ''} flex flex-col gap-1.5`}>
      {label && (
        <label 
          htmlFor={selectId}
          className="text-xs font-medium text-[#94A3B8] tracking-wide"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          className={`w-full appearance-none bg-[#131D31] border text-[#F8FAFC] text-sm rounded-lg pl-3.5 pr-9 py-2 transition-all duration-150 focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
            ${error 
              ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]' 
              : 'border-white/10 hover:border-white/20 focus:border-[#06B6D4] focus:ring-[#06B6D4]'
            }
            ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option 
                  key={opt.value} 
                  value={opt.value} 
                  className="bg-[#0F172A] text-[#F8FAFC]"
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="absolute right-3 text-[#64748B] pointer-events-none flex items-center">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p className="text-xs text-[#F87171] mt-0.5">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-[#64748B] mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
