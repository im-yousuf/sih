/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Light theme backgrounds ───────────────────────────────────────
        background:           '#faf8f5',   // warm off-white page background
        'background-secondary': '#f5f0eb', // slightly deeper warm beige
        panel:                '#ffffff',   // card / panel surface
        'panel-secondary':    '#f3ede6',   // secondary panel / inner blocks
        // ── Accent (copper-brown) — replaces the dark-mode cyan ──────────
        // We keep the semantic name "cyan" so every existing className
        // that reads `text-cyan`, `bg-cyan/10`, `border-cyan/30`, etc.
        // automatically picks up the brown accent without touching JSX.
        cyan:                 '#8b5a2b',   // rich copper/brown accent
        'electric-blue':      '#a0522d',   // deeper sienna variant
        // ── Status colours — kept vivid for readability on light bg ──────
        green:                '#16a34a',   // forest green
        amber:                '#d97706',   // warm amber
        critical:             '#dc2626',   // red
        // ── Typography ───────────────────────────────────────────────────
        text:                 '#1c1917',   // stone-900 near-black
        muted:                '#78716c',   // stone-500 medium grey-brown
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%':   { boxShadow: '0 0 5px rgba(139, 90, 43, 0.35)' },
          '100%': { boxShadow: '0 0 20px rgba(139, 90, 43, 0.55)' },
        },
      },
    },
  },
  plugins: [],
}
