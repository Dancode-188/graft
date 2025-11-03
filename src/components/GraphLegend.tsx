import React from 'react';

interface LegendProps {
  maxLanes: number;
}

const BRANCH_COLORS = [
  '#22c55e', // Green (graft primary)
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
];

export const GraphLegend: React.FC<LegendProps> = ({ maxLanes }) => {
  const lanesToShow = Math.min(maxLanes + 1, BRANCH_COLORS.length);
  const lanes = Array.from({ length: lanesToShow }, (_, i) => i);

  return (
    <div className="flex flex-col gap-2 p-3 bg-theme-surface border border-theme-default rounded-lg">
      <div className="text-xs font-semibold text-theme-tertiary uppercase tracking-wider mb-1">
        Legend
      </div>

      {/* Branch lanes */}
      <div className="space-y-1">
        <div className="text-xs text-theme-tertiary mb-2">Branch Lanes:</div>
        <div className="grid grid-cols-4 gap-2">
          {lanes.map((lane) => (
            <div key={lane} className="flex items-center gap-1">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: BRANCH_COLORS[lane] }}
              />
              <span className="text-xs text-theme-tertiary">Lane {lane + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Commit types */}
      <div className="border-t border-theme-default pt-2 mt-2">
        <div className="text-xs text-theme-tertiary mb-2">Commit Types:</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
            <span className="text-xs text-theme-tertiary">Regular commit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              <div className="w-3 h-3 rounded-full bg-blue-500 opacity-80 relative z-10" />
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-60 -ml-1.5 relative z-0" />
            </div>
            <span className="text-xs text-theme-tertiary">Merge commit (M)</span>
          </div>
        </div>
      </div>

      {/* Branch types */}
      <div className="border-t border-theme-default pt-2 mt-2">
        <div className="text-xs text-theme-tertiary mb-2">Branch Labels:</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="px-1.5 py-0.5 bg-green-500 bg-opacity-20 border border-green-500 rounded text-xs text-green-400 font-mono">
              main
            </div>
            <span className="text-xs text-theme-tertiary">Current branch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-1.5 py-0.5 bg-purple-500 bg-opacity-20 border border-purple-500 rounded text-xs text-purple-400 font-mono">
              feature
            </div>
            <span className="text-xs text-theme-tertiary">Local branch</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-1.5 py-0.5 bg-blue-500 bg-opacity-20 border border-blue-500 rounded text-xs text-blue-400 font-mono">
              origin/main
            </div>
            <span className="text-xs text-theme-tertiary">Remote branch</span>
          </div>
        </div>
      </div>

      {/* Merge visualization */}
      <div className="border-t border-theme-default pt-2 mt-2">
        <div className="text-xs text-theme-tertiary mb-2">Merge Lines:</div>
        <div className="flex items-center gap-2">
          <svg width="40" height="20" className="flex-shrink-0">
            <line x1="5" y1="5" x2="5" y2="10" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,2" />
            <line x1="5" y1="10" x2="35" y2="10" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,2" />
            <line x1="35" y1="10" x2="35" y2="15" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4,2" />
          </svg>
          <span className="text-xs text-theme-tertiary">Merge integration</span>
        </div>
      </div>

      {/* Tags visualization */}
      <div className="border-t border-theme-default pt-2 mt-2">
        <div className="text-xs text-theme-tertiary mb-2">Tags:</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="px-1.5 py-0.5 bg-amber-500 bg-opacity-20 border border-amber-600 rounded text-xs text-amber-300 font-mono">
              v1.0.0
            </div>
            <span className="text-xs text-theme-tertiary">Local tag</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-1.5 py-0.5 bg-cyan-500 bg-opacity-20 border border-cyan-600 rounded text-xs text-cyan-300 font-mono">
              origin/v1.0.0
            </div>
            <span className="text-xs text-theme-tertiary">Remote tag</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-theme-tertiary">† = Annotated tag (lightweight tags have no indicator)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
