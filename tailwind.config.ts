import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

export default {
  darkMode: 'class',
  content: ['./src/components/**/*.{js,ts,jsx,tsx,mdx}', './src/pages/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'brand-secondary-1': 'var(--brand-secondary-1)',
        'brand-secondary-3': 'var(--brand-secondary-3)',
        'brand-secondary-5': 'var(--brand-secondary-5)',
        'action-destructive': 'var(--action-destructive-disabled)',
        'accent-light': 'var(--accent-light)',
        'custom-gray-light': '#f7f7f7',
        'custom-gray-border': '#d1d5db',
        'primary-action-default': 'var(--primary-action-default)',
      },
      spacing: {
        4.5: '18px',
        6.5: '26px',
        11.25: '45px',
      },
      borderRadius: {
        sm: '1px',
      },
      backgroundImage: {
        'zero-pattern': "url('/empty.svg')",
      },
    },
  },
  plugins: [typography],
} satisfies Config;
