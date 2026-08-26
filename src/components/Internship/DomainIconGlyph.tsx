import type { DomainIcon } from "@/data/internshipDomains";

interface DomainIconGlyphProps {
  icon: DomainIcon;
  size?: number;
}

const C = "#45e0e8";

/** Small abstract, technology-focused glyph for a domain card. Decorative only. */
export function DomainIconGlyph({ icon, size = 20 }: DomainIconGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      {render(icon)}
    </svg>
  );
}

function render(icon: DomainIcon) {
  const s = { stroke: C, strokeWidth: 1.3 } as const;
  switch (icon) {
    case "stack":
      return (
        <g {...s} strokeLinejoin="round">
          <path d="M12 4l8 4-8 4-8-4z" />
          <path d="M4 12l8 4 8-4" opacity="0.6" />
          <path d="M4 16l8 4 8-4" opacity="0.35" />
        </g>
      );
    case "layout":
      return (
        <g {...s}>
          <rect x="4" y="5" width="16" height="14" rx="1.5" />
          <line x1="4" y1="9" x2="20" y2="9" opacity="0.7" />
          <line x1="10" y1="9" x2="10" y2="19" opacity="0.5" />
        </g>
      );
    case "server":
      return (
        <g {...s}>
          <rect x="4" y="5" width="16" height="6" rx="1.5" />
          <rect x="4" y="13" width="16" height="6" rx="1.5" opacity="0.6" />
          <circle cx="8" cy="8" r="0.9" fill={C} stroke="none" />
          <circle cx="8" cy="16" r="0.9" fill={C} stroke="none" />
        </g>
      );
    case "code":
      return (
        <g {...s} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 8l-4 4 4 4" />
          <path d="M15 8l4 4-4 4" opacity="0.6" />
        </g>
      );
    case "mobile":
      return (
        <g {...s}>
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <line x1="10.5" y1="18" x2="13.5" y2="18" opacity="0.7" />
        </g>
      );
    case "neural":
      return (
        <g {...s}>
          <circle cx="5" cy="12" r="1.6" fill={C} stroke="none" />
          <circle cx="12" cy="7" r="1.6" fill={C} stroke="none" opacity="0.8" />
          <circle cx="12" cy="17" r="1.6" fill={C} stroke="none" opacity="0.8" />
          <circle cx="19" cy="12" r="1.6" fill={C} stroke="none" />
          <path d="M6.5 12L10.5 7.6M6.5 12l4 4.4M13.5 7.6L17.6 11.4M13.5 16.4L17.6 12.6" opacity="0.4" />
        </g>
      );
    case "science":
      return (
        <g {...s} strokeLinecap="round">
          <path d="M10 3v6l-5 9a1.6 1.6 0 001.4 2.4h11.2A1.6 1.6 0 0019 18l-5-9V3" />
          <line x1="9" y1="3" x2="15" y2="3" />
        </g>
      );
    case "analytics":
      return (
        <g {...s} strokeLinecap="round">
          <path d="M4 16l4-5 4 3 4-7" />
          <circle cx="8" cy="11" r="1.2" fill={C} stroke="none" />
          <circle cx="12" cy="14" r="1.2" fill={C} stroke="none" />
          <circle cx="16" cy="7" r="1.2" fill={C} stroke="none" />
        </g>
      );
    case "cloud":
      return <path d="M8 18a4 4 0 01-.6-7.9A5.5 5.5 0 0118 9.5a3.8 3.8 0 01-.5 8.5H8z" {...s} />;
    case "pipeline":
      return (
        <g {...s} strokeLinecap="round">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" opacity="0.7" />
          <circle cx="19" cy="12" r="2" opacity="0.5" />
          <line x1="7" y1="12" x2="10" y2="12" />
          <line x1="14" y1="12" x2="17" y2="12" opacity="0.7" />
        </g>
      );
    case "shield":
      return <path d="M12 3l7 3v6c0 4-3 7.5-7 9-4-1.5-7-5-7-9V6z" {...s} strokeLinejoin="round" />;
    case "design":
      return (
        <g {...s}>
          <circle cx="9" cy="9" r="4" />
          <rect x="12" y="12" width="8" height="8" rx="1.5" opacity="0.6" />
        </g>
      );
    case "check":
      return (
        <g {...s} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" opacity="0.5" />
          <path d="M8 12.5l2.8 2.8L16 10" />
        </g>
      );
    case "database":
      return (
        <g {...s}>
          <ellipse cx="12" cy="6.5" rx="7" ry="2.8" />
          <path d="M5 6.5v11c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-11" opacity="0.7" />
          <path d="M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8" opacity="0.5" />
        </g>
      );
    case "megaphone":
      return (
        <g {...s} strokeLinejoin="round">
          <path d="M4 10v4h3l7 4V6l-7 4z" />
          <path d="M17 9.5a3.5 3.5 0 010 5" opacity="0.6" strokeLinecap="round" />
        </g>
      );
    case "growth":
      return (
        <g {...s} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17l5-5 3.5 3.5L20 8" />
          <path d="M15 8h5v5" opacity="0.7" />
        </g>
      );
    case "handshake":
      return (
        <g {...s} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 11l4-3 5 4 5-4 4 3" />
          <path d="M7 13l3.5 3.5a1.8 1.8 0 002.6 0L17 13" opacity="0.7" />
        </g>
      );
    case "people":
      return (
        <g {...s}>
          <circle cx="9" cy="8" r="3" />
          <circle cx="17" cy="9" r="2.2" opacity="0.6" />
          <path d="M3.5 19a5.5 5.5 0 0111 0" strokeLinecap="round" />
          <path d="M16 15a4.5 4.5 0 014.5 4" opacity="0.6" strokeLinecap="round" />
        </g>
      );
    case "finance":
      return (
        <g {...s} strokeLinecap="round">
          <circle cx="12" cy="12" r="8" opacity="0.6" />
          <path d="M12 7v10M9.5 9.5h4a1.8 1.8 0 010 3.6h-3a1.8 1.8 0 000 3.6h4" />
        </g>
      );
    case "gears":
      return (
        <g {...s}>
          <circle cx="10" cy="10" r="3.5" />
          <circle cx="17" cy="16" r="2.5" opacity="0.6" />
          <path d="M10 4v2M10 14v2M4 10h2M14 10h2" strokeLinecap="round" opacity="0.7" />
        </g>
      );
    case "content":
      return (
        <g {...s} strokeLinecap="round">
          <rect x="4" y="4" width="16" height="16" rx="2" opacity="0.5" />
          <line x1="8" y1="9" x2="16" y2="9" />
          <line x1="8" y1="13" x2="16" y2="13" opacity="0.7" />
          <line x1="8" y1="17" x2="12" y2="17" opacity="0.5" />
        </g>
      );
    case "kanban":
      return (
        <g {...s}>
          <rect x="4" y="4" width="4.5" height="12" rx="1" />
          <rect x="10" y="4" width="4.5" height="8" rx="1" opacity="0.7" />
          <rect x="16" y="4" width="4.5" height="15" rx="1" opacity="0.5" />
        </g>
      );
    case "research":
      return (
        <g {...s} strokeLinecap="round">
          <circle cx="11" cy="11" r="6" />
          <line x1="15.5" y1="15.5" x2="20" y2="20" />
        </g>
      );
    case "spark":
      return (
        <g {...s} strokeLinejoin="round">
          <path d="M12 3l2 6.5 6.5 2-6.5 2-2 6.5-2-6.5-6.5-2 6.5-2z" />
        </g>
      );
    default:
      return null;
  }
}
