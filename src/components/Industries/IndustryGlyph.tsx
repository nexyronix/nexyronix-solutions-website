import type { IndustryGlyph } from "./industriesData";

interface IndustryGlyphIconProps {
  glyph: IndustryGlyph;
  size?: number;
}

const CYAN = "#45e0e8";

/** Renders one of sixteen small abstract, technology-focused glyphs. Purely decorative. */
export function IndustryGlyphIcon({ glyph, size = 22 }: IndustryGlyphIconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      {renderGlyph(glyph)}
    </svg>
  );
}

function renderGlyph(glyph: IndustryGlyph) {
  switch (glyph) {
    case "launch":
      return (
        <g stroke={CYAN} strokeWidth="1.3" strokeLinecap="round">
          <path d="M12 3l3.5 8-3.5 3-3.5-3z" />
          <path d="M9.5 14L7 20M14.5 14L17 20" opacity="0.6" />
        </g>
      );
    case "modules":
      return (
        <g stroke={CYAN} strokeWidth="1.3">
          <rect x="4" y="4" width="7" height="7" rx="1" />
          <rect x="13" y="4" width="7" height="7" rx="1" opacity="0.5" />
          <rect x="4" y="13" width="7" height="7" rx="1" opacity="0.5" />
          <rect x="13" y="13" width="7" height="7" rx="1" />
        </g>
      );
    case "infrastructure":
      return (
        <g stroke={CYAN} strokeWidth="1.3">
          <rect x="4" y="14" width="4" height="6" />
          <rect x="10" y="9" width="4" height="11" />
          <rect x="16" y="4" width="4" height="16" />
        </g>
      );
    case "learn":
      return (
        <g stroke={CYAN} strokeWidth="1.3" strokeLinecap="round">
          <line x1="5" y1="7" x2="19" y2="7" />
          <line x1="5" y1="12" x2="19" y2="12" opacity="0.7" />
          <line x1="5" y1="17" x2="14" y2="17" opacity="0.5" />
        </g>
      );
    case "campus":
      return (
        <g stroke={CYAN} strokeWidth="1.3">
          <circle cx="6" cy="7" r="2" />
          <circle cx="18" cy="7" r="2" opacity="0.6" />
          <circle cx="12" cy="18" r="2" opacity="0.8" />
          <line x1="8" y1="8" x2="16" y2="8" opacity="0.4" />
          <line x1="7" y1="9" x2="11" y2="16" opacity="0.4" />
          <line x1="17" y1="9" x2="13" y2="16" opacity="0.4" />
        </g>
      );
    case "pulse":
      return (
        <path
          d="M3 12h4l2-6 3 12 2-9 1.5 3H21"
          stroke={CYAN}
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case "storefront":
      return (
        <g stroke={CYAN} strokeWidth="1.3" strokeLinecap="round">
          <path d="M5 9h14l-1.5-5h-11z" />
          <path d="M6 9v9h12V9" opacity="0.7" />
          <circle cx="9" cy="20" r="1" fill={CYAN} stroke="none" />
          <circle cx="15" cy="20" r="1" fill={CYAN} stroke="none" />
        </g>
      );
    case "commerce":
      return (
        <g stroke={CYAN} strokeWidth="1.3">
          <rect x="4" y="5" width="6" height="6" rx="1" />
          <rect x="14" y="5" width="6" height="6" rx="1" opacity="0.5" />
          <rect x="9" y="13" width="6" height="6" rx="1" opacity="0.8" />
        </g>
      );
    case "chart":
      return (
        <g stroke={CYAN} strokeWidth="1.3" strokeLinecap="round">
          <line x1="6" y1="18" x2="6" y2="10" />
          <line x1="12" y1="18" x2="12" y2="5" opacity="0.8" />
          <line x1="18" y1="18" x2="18" y2="13" opacity="0.6" />
        </g>
      );
    case "hex":
      return <path d="M12 3l7 4v10l-7 4-7-4V7z" stroke={CYAN} strokeWidth="1.3" strokeLinejoin="round" />;
    case "route":
      return (
        <g stroke={CYAN} strokeWidth="1.3" strokeLinecap="round">
          <path d="M4 18C8 18 8 6 12 6s4 12 8 12" strokeDasharray="1 3.5" />
          <circle cx="4" cy="18" r="1.4" fill={CYAN} stroke="none" />
          <circle cx="20" cy="18" r="1.4" fill={CYAN} stroke="none" />
        </g>
      );
    case "building":
      return (
        <g stroke={CYAN} strokeWidth="1.3">
          <rect x="4" y="12" width="4" height="8" opacity="0.6" />
          <rect x="10" y="7" width="4" height="13" />
          <rect x="16" y="15" width="4" height="5" opacity="0.6" />
        </g>
      );
    case "flow":
      return (
        <g stroke={CYAN} strokeWidth="1.3" strokeLinecap="round">
          <path d="M4 8c4 0 4 8 8 8s4-8 8-8" />
          <circle cx="4" cy="8" r="1.4" fill={CYAN} stroke="none" />
          <circle cx="12" cy="16" r="1.4" fill={CYAN} stroke="none" />
          <circle cx="20" cy="8" r="1.4" fill={CYAN} stroke="none" />
        </g>
      );
    case "pin":
      return (
        <path
          d="M12 3c-3.3 0-6 2.6-6 6 0 4.5 6 12 6 12s6-7.5 6-12c0-3.4-2.7-6-6-6z"
          stroke={CYAN}
          strokeWidth="1.3"
        />
      );
    case "columns":
      return (
        <g stroke={CYAN} strokeWidth="1.3" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="7" y1="8" x2="7" y2="19" opacity="0.7" />
          <line x1="12" y1="8" x2="12" y2="19" />
          <line x1="17" y1="8" x2="17" y2="19" opacity="0.7" />
        </g>
      );
    case "cluster":
      return (
        <g stroke={CYAN} strokeWidth="1.1">
          <circle cx="6" cy="6" r="1.8" fill={CYAN} stroke="none" />
          <circle cx="18" cy="7" r="1.8" fill={CYAN} stroke="none" opacity="0.7" />
          <circle cx="12" cy="14" r="1.8" fill={CYAN} stroke="none" />
          <circle cx="6" cy="19" r="1.8" fill={CYAN} stroke="none" opacity="0.6" />
          <line x1="6" y1="6" x2="12" y2="14" opacity="0.4" />
          <line x1="18" y1="7" x2="12" y2="14" opacity="0.4" />
          <line x1="6" y1="19" x2="12" y2="14" opacity="0.4" />
        </g>
      );
    default:
      return null;
  }
}
