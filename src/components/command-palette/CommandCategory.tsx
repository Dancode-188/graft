// Command Category - Category header
import { memo } from 'react';

interface CommandCategoryProps {
  label: string;
}

export const CommandCategory = memo(function CommandCategory({ label }: CommandCategoryProps) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-theme-tertiary uppercase tracking-wider 
                    bg-theme-surface/50 sticky top-0 backdrop-blur-sm border-b border-theme-default"
         role="presentation"
    >
      {label}
    </div>
  );
});
