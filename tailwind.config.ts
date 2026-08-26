import type { Config } from "tailwindcss";

/**
 * NEXYRONIX DESIGN SYSTEM — Tailwind bridge
 * ------------------------------------------------
 * Every value below reads from a CSS custom property defined in
 * `src/index.css` (:root). To retheme the entire site, change the
 * variables in ONE place — this file never needs to change again.
 */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "2rem",
        lg: "3rem",
      },
    },
    extend: {
      colors: {
        bg: {
          DEFAULT: "var(--color-bg)",
          secondary: "var(--color-bg-secondary)",
          elevated: "var(--color-bg-elevated)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          hover: "var(--color-surface-hover)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          faint: "var(--color-text-faint)",
        },
        accent: {
          DEFAULT: "var(--color-accent-primary)",
          primary: "var(--color-accent-primary)",
          cyan: "var(--color-accent-cyan)",
          violet: "var(--color-accent-violet)",
        },
        status: {
          online: "var(--color-status-online)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3rem, 6vw, 5.5rem)", { lineHeight: "1.02", letterSpacing: "-0.03em" }],
        "display-lg": ["clamp(2.5rem, 4.5vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(2rem, 3.2vw, 2.75rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-sm": ["clamp(1.5rem, 2.2vw, 1.875rem)", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
      },
      maxWidth: {
        page: "1440px",
        content: "1280px",
        prose: "65ch",
      },
      spacing: {
        "section-y": "clamp(4rem, 9vw, 7rem)",
        "section-y-sm": "clamp(2.5rem, 5vw, 4rem)",
        18: "4.5rem",
        22: "5.5rem",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        raised: "var(--shadow-raised)",
        "glow-primary": "var(--glow-primary)",
        "glow-cyan": "var(--glow-cyan)",
        "glow-violet": "var(--glow-violet)",
      },
      backgroundImage: {
        "grid-overlay":
          "linear-gradient(to right, var(--color-border) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(60% 50% at 50% 0%, rgba(46,124,246,0.10) 0%, rgba(5,7,10,0) 70%)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      transitionTimingFunction: {
        signature: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        "pulse-slow": "pulse-slow 2.4s ease-in-out infinite",
        "fade-up": "fade-up 0.6s var(--ease-signature, cubic-bezier(0.16,1,0.3,1)) forwards",
        "scroll-cue": "scroll-cue 1.8s ease-in-out infinite",
        "dash-flow": "dash-flow 2.4s linear infinite",
        boot: "boot 1.1s ease-in-out infinite",
      },
      keyframes: {
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scroll-cue": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "80%": { opacity: "0.4" },
          "100%": { transform: "translateY(28px)", opacity: "0" },
        },
        "dash-flow": {
          from: { strokeDashoffset: "24" },
          to: { strokeDashoffset: "0" },
        },
        boot: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(275%)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
