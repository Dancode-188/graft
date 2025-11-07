import { themes } from '../styles/themes';

interface ThemePreviewProps {
  mode: 'dark' | 'light';
}

export function ThemePreview({ mode }: ThemePreviewProps) {
  const theme = themes[mode];
  return (
    <div
      className="rounded border p-3 flex flex-col gap-2 shadow-md"
      style={{
        background: theme.colors.surface,
  color: theme.colors.textPrimary,
        minWidth: 180,
        minHeight: 80,
      }}
    >
      <div className="font-bold text-sm mb-1">{mode.charAt(0).toUpperCase() + mode.slice(1)} Theme</div>
      <button
        className="rounded px-2 py-1 text-xs"
        style={{
          background: theme.colors.primary,
          color: '#fff',
        }}
      >
        Primary Button
      </button>
      <div
        className="rounded px-2 py-1 text-xs"
        style={{
          background: theme.colors.surfaceHover,
          color: theme.colors.textSecondary,
        }}
      >
        Sample Text
      </div>
    </div>
  );
}
