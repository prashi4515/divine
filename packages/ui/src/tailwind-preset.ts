import type { Config } from "tailwindcss";

/**
 * Tailwind preset for the Divine public design system.
 * Apps extend this — do not fork token values in app configs.
 */
const divinePreset = {
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        ink: {
          DEFAULT: "hsl(var(--ink))",
          foreground: "hsl(var(--ink-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        verse: {
          DEFAULT: "hsl(var(--verse))",
          muted: "hsl(var(--verse-muted))",
        },
        sanskrit: "hsl(var(--sanskrit))",
        /* Devotional marketing accents (public surfaces only). */
        saffron: "hsl(var(--saffron) / <alpha-value>)",
        gold: "hsl(var(--gold) / <alpha-value>)",
        maroon: "hsl(var(--maroon) / <alpha-value>)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)"],
        "reader-en": ["var(--font-reader-en)", "Georgia", "serif"],
        "reader-deva": ["var(--font-reader-deva)", "serif"],
        "reader-kn": ["var(--font-reader-kn)", "serif"],
        "reader-te": ["var(--font-reader-te)", "serif"],
        "reader-ta": ["var(--font-reader-ta)", "serif"],
        "reader-ml": ["var(--font-reader-ml)", "serif"],
        "reader-gu": ["var(--font-reader-gu)", "serif"],
        "reader-or": ["var(--font-reader-or)", "serif"],
      },
      fontSize: {
        xs: ["var(--text-xs)", { lineHeight: "var(--leading-normal)" }] as [
          string,
          { lineHeight: string },
        ],
        sm: ["var(--text-sm)", { lineHeight: "var(--leading-normal)" }] as [
          string,
          { lineHeight: string },
        ],
        base: ["var(--text-base)", { lineHeight: "var(--leading-relaxed)" }] as [
          string,
          { lineHeight: string },
        ],
        lg: ["var(--text-lg)", { lineHeight: "var(--leading-relaxed)" }] as [
          string,
          { lineHeight: string },
        ],
        xl: ["var(--text-xl)", { lineHeight: "var(--leading-snug)" }] as [
          string,
          { lineHeight: string },
        ],
        "2xl": ["var(--text-2xl)", { lineHeight: "var(--leading-snug)" }] as [
          string,
          { lineHeight: string },
        ],
        "3xl": ["var(--text-3xl)", { lineHeight: "var(--leading-tight)" }] as [
          string,
          { lineHeight: string },
        ],
        "4xl": ["var(--text-4xl)", { lineHeight: "var(--leading-tight)" }] as [
          string,
          { lineHeight: string },
        ],
        "5xl": ["var(--text-5xl)", { lineHeight: "var(--leading-tight)" }] as [
          string,
          { lineHeight: string },
        ],
        "6xl": ["var(--text-6xl)", { lineHeight: "var(--leading-tight)" }] as [
          string,
          { lineHeight: string },
        ],
      },
      spacing: {
        "4.5": "1.125rem",
        18: "4.5rem",
        22: "5.5rem",
      },
      maxWidth: {
        prose: "var(--container-prose)",
        content: "var(--container-content)",
        wide: "var(--container-wide)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        none: "var(--shadow-none)",
      },
      transitionTimingFunction: {
        "divine-out": "var(--ease-out)",
        "divine-in-out": "var(--ease-in-out)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in var(--duration-base) var(--ease-out)",
        "fade-up": "fade-up var(--duration-slow) var(--ease-out)",
      },
    },
  },
} satisfies Omit<Config, "content">;

export default divinePreset;
