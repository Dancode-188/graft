// Command Category - Category header
import { memo } from 'react';

interface CommandCategoryProps {
  label: string;
}

export const CommandCategory = memo(function CommandCategory({ label }: CommandCategoryProps) {
  return (
    <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider 
                    bg-zinc-900/50 sticky top-0 backdrop-blur-sm border-b border-zinc-800"
         role="presentation"
    >
      {label}
    </div>
  );
});
