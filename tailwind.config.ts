import type { Config } from 'tailwindcss';

/**
 * Tokens are organised in two layers:
 *
 *   1. Primitives — `watermelon-*`, `grey-*`, `lilac-*`, `neutral-*` — match
 *      Myntra Fabric's primitive scales (Watermelon/100, Grey/500, etc.)
 *      and should be used only when the semantic layer doesn't fit.
 *   2. Semantic — `primary`, `ink`, `divider`, `bg`, `accent` — point at the
 *      primitives. These are what components consume.
 *
 * Canonical hexes are taken from the Fabric pixel-perfect rules doc and the
 * pointer in figma-skills/figma-import/fabric-tokens.md.  Where Fabric ships a
 * scale step we don't yet have a hex for, the value is interpolated and noted.
 */

const watermelon = {
  100: '#FFEBF0', // Fabric Watermelon/100
  200: '#FFC2D4',
  300: '#FF94B0',
  400: '#FF6386',
  500: '#FF4C77',
  600: '#FF3F6C', // Fabric Watermelon/600 — brand
  700: '#E5345F', // interpolated dark
  800: '#B82A4D', // interpolated darker
};

const grey = {
  50: '#FBFBFC',
  100: '#E9E9EB', // Fabric Grey/200 hairline
  200: '#D4D5D8', // Fabric Grey/300 border
  300: '#BEBFC5', // Fabric Grey/400 placeholder / disabled text
  400: '#A8AAB2',
  500: '#93959E', // Fabric Grey/500
  600: '#686B77', // Fabric Grey/600 secondary text
  700: '#535766',
  800: '#262A39', // Fabric Grey/800 ink
  900: '#0B021C', // Fabric Grey/900 status / emphasis ink
};

const neutral = {
  100: '#F4F4F5', // Fabric Neutral/100 (disabled bg, button-disabled)
  150: '#F9F9FA', // Fabric Neutral/150 (canvas)
  200: '#EDEDEF',
};

const lilac = {
  100: '#F0EAFA',
  300: '#C5B5E8',
  500: '#8B73D5',
  700: '#6E5DC6', // Fabric Lilac/700 — AI accent
  800: '#5547A8',
};

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        watermelon,
        grey,
        neutral,
        lilac,

        primary: {
          DEFAULT: watermelon[600],
          dark: watermelon[700],
          soft: watermelon[100],
          text: watermelon[600],
        },
        ink: {
          DEFAULT: grey[800],
          strong: grey[900],
          subtle: grey[600],
          faint: grey[500],
          ghost: grey[300],
        },
        divider: grey[100],
        border: {
          DEFAULT: grey[200],
          subtle: 'rgba(11, 2, 28, 0.2)',
        },
        line: neutral[100],
        accent: {
          mint: '#04A77B',
          gold: '#C77A1A',
          sky: '#1B7BD1',
          ai: lilac[700],
          aiSoft: lilac[100],
          // Discover surface — punchy lime + warm paper backgrounds. These
          // intentionally live outside the Fabric system so the swipe feed
          // can feel like a "magazine break" from the rest of the app.
          lime: '#D8FF4E',
          limeDeep: '#A8D820',
          cream: '#F8F2E2',
          paper: '#F0E8D2',
        },
        bg: {
          DEFAULT: '#FFFFFF',
          soft: neutral[150],
          canvas: neutral[150],
          disabled: neutral[100],
        },
      },
      fontFamily: {
        sans: [
          'Figtree',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        // Editorial display serif — used on Discover and any "magazine break"
        // surface. Falls back to Georgia so the layout is solid even if the
        // Google webfont hasn't loaded yet.
        display: [
          'Fraunces',
          'Georgia',
          '"Times New Roman"',
          'ui-serif',
          'serif',
        ],
      },
      letterSpacing: {
        tightish: '-0.01em',
        widish: '0.04em',
      },
      borderRadius: {
        // Fabric defaults: button br: 12, pill br: 16, modal br: 24
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px', // Fabric button radius
        '2xl': '16px', // Fabric pill / card radius
        '3xl': '20px',
        '4xl': '24px', // Fabric sheet / modal radius
        frame: '28px', // Studio canvas, swipe cards, hero frames
        hero: '32px', // Onboarding / marketing hero tiles
      },
      spacing: {
        page: '20px', // Standard horizontal page gutter (px-5)
        'page-sm': '16px',
      },
      boxShadow: {
        card: '0 0 0 1px rgba(11, 2, 28, 0.06)',
        sheet: '0 -1px 0 rgba(212, 213, 216, 0.8), 0 -12px 40px rgba(38, 42, 57, 0.08)',
        fab: '0 4px 14px rgba(255, 63, 108, 0.24)',
        pop: '0 8px 24px rgba(38, 42, 57, 0.06)',
        search: '0 2px 24px rgba(36, 38, 172, 0.08)',
      },
      keyframes: {
        'sheet-in': {
          '0%': { transform: 'translateY(100%)', opacity: '0.4' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.94)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'rise-in': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        sparkle: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.9' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        'empty-pulse': {
          '0%, 100%': { transform: 'scale(0.96)', opacity: '0.85' },
          '50%': { transform: 'scale(1.04)', opacity: '1' },
        },
        'empty-pulse-slow': {
          '0%, 100%': { transform: 'scale(0.92)', opacity: '0.6' },
          '50%': { transform: 'scale(1.08)', opacity: '0.85' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(120%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'tour-drift-a': {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-6px) rotate(1deg)' },
        },
        'tour-drift-b': {
          '0%, 100%': { transform: 'translateY(0) rotate(3deg)' },
          '50%': { transform: 'translateY(-8px) rotate(-1deg)' },
        },
        'tour-drift-c': {
          '0%, 100%': { transform: 'translateY(0) rotate(1deg)' },
          '50%': { transform: 'translateY(-5px) rotate(-2deg)' },
        },
        'tour-drift-d': {
          '0%, 100%': { transform: 'translateY(0) rotate(-4deg)' },
          '50%': { transform: 'translateY(-7px) rotate(2deg)' },
        },
        'tour-drift-center': {
          '0%, 100%': { transform: 'translate(-50%, 0) scale(1)' },
          '50%': { transform: 'translate(-50%, -8px) scale(1.02)' },
        },
        'onboarding-spread-hat': {
          '0%, 18%': { left: '50%', top: '50%', transform: 'translate(-50%, -50%) scale(0.5)', opacity: '0.65' },
          '45%, 100%': { left: '50%', top: '16%', transform: 'translate(-50%, -50%) scale(1)', opacity: '1' },
        },
        'onboarding-spread-glasses': {
          '0%, 22%': { left: '50%', top: '50%', transform: 'translate(-50%, -50%) scale(0.5)', opacity: '0.65' },
          '48%, 100%': { left: '50%', top: '28%', transform: 'translate(-50%, -50%) scale(1)', opacity: '1' },
        },
        'onboarding-spread-top': {
          '0%, 26%': { left: '50%', top: '50%', transform: 'translate(-50%, -50%) scale(0.5)', opacity: '0.65' },
          '52%, 100%': { left: '50%', top: '46%', transform: 'translate(-50%, -50%) scale(1)', opacity: '1' },
        },
        'onboarding-spread-bottom': {
          '0%, 30%': { left: '50%', top: '50%', transform: 'translate(-50%, -50%) scale(0.5)', opacity: '0.65' },
          '56%, 100%': { left: '50%', top: '72%', transform: 'translate(-50%, -50%) scale(1)', opacity: '1' },
        },
        'tour-swipe-card': {
          '0%, 100%': { transform: 'translate(-50%, 0) rotate(-1deg)' },
          '35%': { transform: 'translate(calc(-50% + 28px), -4px) rotate(8deg)' },
          '55%': { transform: 'translate(calc(-50% + 28px), -4px) rotate(8deg)' },
        },
        'tour-save-stamp': {
          '0%, 28%': { opacity: '0', transform: 'rotate(12deg) scale(0.85)' },
          '40%, 58%': { opacity: '1', transform: 'rotate(12deg) scale(1)' },
          '70%, 100%': { opacity: '0', transform: 'rotate(12deg) scale(0.9)' },
        },
        'tour-swipe-finger': {
          '0%, 100%': { transform: 'translateX(0)' },
          '35%, 55%': { transform: 'translateX(6px)' },
        },
      },
      animation: {
        'sheet-in': 'sheet-in 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        'fade-in': 'fade-in 180ms ease-out',
        'pop-in': 'pop-in 220ms cubic-bezier(0.22, 1, 0.36, 1)',
        'rise-in': 'rise-in 240ms cubic-bezier(0.22, 1, 0.36, 1)',
        sparkle: 'sparkle 1.6s ease-in-out infinite',
        'empty-pulse': 'empty-pulse 2.8s ease-in-out infinite',
        'empty-pulse-slow': 'empty-pulse-slow 3.4s ease-in-out infinite',
        'slide-up': 'slide-up 280ms cubic-bezier(0.22, 1, 0.36, 1)',
        'tour-drift-a': 'tour-drift-a 5s ease-in-out infinite',
        'tour-drift-b': 'tour-drift-b 5.4s ease-in-out infinite',
        'tour-drift-c': 'tour-drift-c 4.8s ease-in-out infinite',
        'tour-drift-d': 'tour-drift-d 5.2s ease-in-out infinite',
        'tour-drift-center': 'tour-drift-center 4.6s ease-in-out infinite',
        'onboarding-spread-hat': 'onboarding-spread-hat 5.2s ease-in-out infinite',
        'onboarding-spread-glasses': 'onboarding-spread-glasses 5.2s ease-in-out infinite',
        'onboarding-spread-top': 'onboarding-spread-top 5.2s ease-in-out infinite',
        'onboarding-spread-bottom': 'onboarding-spread-bottom 5.2s ease-in-out infinite',
        'tour-swipe-card': 'tour-swipe-card 3.6s ease-in-out infinite',
        'tour-save-stamp': 'tour-save-stamp 3.6s ease-in-out infinite',
        'tour-swipe-finger': 'tour-swipe-finger 3.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
