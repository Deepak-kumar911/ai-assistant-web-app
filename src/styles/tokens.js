/**
 * Design Tokens for AI-Assistant Dark Theme System
 * Task 33 — Canonical Theme Tokens
 */

export const tokens = {
  colors: {
    bg: {
      root: 'var(--bg-root)',
      surface: 'var(--bg-surface)',
      elevated: 'var(--bg-elevated)',
      subtle: 'var(--bg-subtle)',
      glass: 'var(--bg-glass)',
      glassElevated: 'var(--bg-glass-elevated)'
    },
    border: {
      subtle: 'var(--border-subtle)',
      medium: 'var(--border-medium)',
      strong: 'var(--border-strong)',
      focus: 'var(--border-focus)'
    },
    accent: {
      primary: 'var(--accent-primary)',
      hover: 'var(--accent-hover)',
      active: 'var(--accent-active)',
      subtle: 'var(--accent-subtle)',
      border: 'var(--accent-border)',
      glow: 'var(--accent-glow)'
    },
    status: {
      success: {
        base: 'var(--color-success)',
        subtle: 'var(--color-success-subtle)',
        border: 'var(--color-success-border)',
        text: 'var(--color-success-text)'
      },
      warning: {
        base: 'var(--color-warning)',
        subtle: 'var(--color-warning-subtle)',
        border: 'var(--color-warning-border)',
        text: 'var(--color-warning-text)'
      },
      danger: {
        base: 'var(--color-danger)',
        subtle: 'var(--color-danger-subtle)',
        border: 'var(--color-danger-border)',
        text: 'var(--color-danger-text)'
      },
      info: {
        base: 'var(--color-info)',
        subtle: 'var(--color-info-subtle)',
        border: 'var(--color-info-border)',
        text: 'var(--color-info-text)'
      }
    },
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      muted: 'var(--text-muted)',
      disabled: 'var(--text-disabled)',
      inverse: 'var(--text-inverse)'
    }
  },
  radii: {
    xs: 'var(--radius-xs)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
    full: 'var(--radius-full)'
  },
  typography: {
    display: 'font-bold text-3xl md:text-4xl tracking-tight',
    h1: 'font-bold text-2xl md:text-3xl tracking-tight',
    h2: 'font-semibold text-xl md:text-2xl',
    h3: 'font-semibold text-lg md:text-xl',
    h4: 'font-medium text-base md:text-lg',
    body: 'font-normal text-sm md:text-base leading-relaxed',
    bodySmall: 'font-normal text-xs md:text-sm leading-normal',
    caption: 'font-medium text-xs tracking-wider uppercase',
    code: 'font-mono text-xs md:text-sm'
  }
};

export default tokens;
