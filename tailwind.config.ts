import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'], // Activation du mode sombre via la classe "dark"
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      // NOUVELLE PALETTE DE COULEURS
      colors: {
        // Couleurs principales pour le mode clair
        lightBg: '#F7FAFC',          // fond clair
        lightText: '#1A202C',        // texte foncé
        primary: {
          DEFAULT: '#2563eb',       // un bleu un peu plus vif
          foreground: '#ffffff',    // texte sur fond bleu
        },
        secondary: {
          DEFAULT: '#8b5cf6',       // violet
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#ec4899',       // rose un peu flashy
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#ef4444',       // rouge
          foreground: '#ffffff',
        },
        // Couleurs principales pour le mode sombre
        darkBg: '#111827',
        darkText: '#F3F4F6',

        // On conserve les variables "CSS" existantes si vous les utilisez en d’autres endroits:
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // On redéfinit également les groupements ci-dessous,
        // si vous faites usage des classes .bg-card, .bg-popover, etc.
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        // Police plus « moderne » (inter, roboto, etc.)
        headline: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'slide-from-left': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-to-left': {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to:   { opacity: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'slide-from-left': 'slide-from-left 0.3s cubic-bezier(0.82, 0.085, 0.395, 0.895)',
        'slide-to-left':   'slide-to-left 0.3s cubic-bezier(0.82, 0.085, 0.395, 0.895)',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'), // Plugin pour animations (si utilisé ailleurs)
  ],
};

export default config;
