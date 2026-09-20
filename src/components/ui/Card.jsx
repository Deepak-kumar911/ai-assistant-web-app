import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  glass = true,
  glow = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-xl border transition-all duration-200 
        ${glass ? 'bg-[#0F172A]/90 backdrop-blur-md' : 'bg-[#0F172A]'}
        ${glow ? 'border-[#06B6D4]/30 shadow-lg shadow-[#06B6D4]/5' : 'border-white/10'}
        ${hover ? 'hover:border-white/20 hover:shadow-xl hover:translate-y-[-1px]' : ''}
        ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-5 pb-3 flex flex-col gap-1 border-b border-white/5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-[#F8FAFC] tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '', ...props }) => (
  <p className={`text-xs text-[#94A3B8] leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
  <div className={`p-4 pt-3 border-t border-white/5 flex items-center justify-between ${className}`} {...props}>
    {children}
  </div>
);

export default Card;
