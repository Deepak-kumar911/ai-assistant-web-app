import React from 'react';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'There are no records matching your current filter or criteria.',
  action,
  secondaryAction,
  className = '',
  children
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed border-white/10 bg-[#0F172A]/40 backdrop-blur-sm ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-[#131D31] border border-white/10 flex items-center justify-center text-[#06B6D4] mb-4 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="text-base md:text-lg font-semibold text-[#F8FAFC] tracking-tight mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-xs md:text-sm text-[#94A3B8] max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {children}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              size="sm"
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || 'ghost'}
              size="sm"
              icon={secondaryAction.icon}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
