/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Graft color scheme - nature meets tech
        graft: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Theme-aware colors (use CSS variables)
        'theme-bg': 'var(--color-background)',
        'theme-surface': 'var(--color-surface)',
        'theme-surface-hover': 'var(--color-surface-hover)',
        'theme-border': 'var(--color-border)',
        'theme-border-hover': 'var(--color-border-hover)',
        'theme-text': 'var(--color-text-primary)',
        'theme-text-secondary': 'var(--color-text-secondary)',
        'theme-text-tertiary': 'var(--color-text-tertiary)',
        'theme-primary': 'var(--color-primary)',
        'theme-primary-hover': 'var(--color-primary-hover)',
        'theme-success': 'var(--color-success)',
        'theme-error': 'var(--color-error)',
        'theme-warning': 'var(--color-warning)',
        'theme-info': 'var(--color-info)',
        // Git-specific colors
        'git-added': 'var(--color-git-added)',
        'git-modified': 'var(--color-git-modified)',
        'git-deleted': 'var(--color-git-deleted)',
        'git-renamed': 'var(--color-git-renamed)',
        'git-conflict': 'var(--color-git-conflict)',
        // Graph branch colors
        'graph-1': 'var(--color-graph-branch1)',
        'graph-2': 'var(--color-graph-branch2)',
        'graph-3': 'var(--color-graph-branch3)',
        'graph-4': 'var(--color-graph-branch4)',
        'graph-5': 'var(--color-graph-branch5)',
        'graph-6': 'var(--color-graph-branch6)',
      },
      spacing: {
        '45': '11.25rem', // 180px - Custom width for branch sidebar
      },
      backgroundColor: {
        'theme-bg': 'var(--color-background)',
        'theme-surface': 'var(--color-surface)',
        'theme-surface-hover': 'var(--color-surface-hover)',
      },
      textColor: {
        'theme-primary': 'var(--color-text-primary)',
        'theme-secondary': 'var(--color-text-secondary)',
        'theme-tertiary': 'var(--color-text-tertiary)',
      },
      borderColor: {
        'theme-default': 'var(--color-border)',
        'theme-hover': 'var(--color-border-hover)',
      },
      ringColor: {
        'theme-primary': 'var(--color-primary)',
      },
    },
  },
  plugins: [],
}