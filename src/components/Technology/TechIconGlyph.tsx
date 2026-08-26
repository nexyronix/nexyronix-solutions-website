import type { TechIcon } from "@/data/technologies";

interface TechIconGlyphProps {
  icon: TechIcon;
  size?: number;
}

const C = "#45e0e8";

/**
 * Abstract, geometric marks — intentionally NOT reproductions of the official
 * brand logos. Vendor logos are trademarked and their usage guidelines vary,
 * so these are original suggestive shapes that stay consistent with the rest
 * of the Nexyronix icon language. Swap for licensed brand assets later if the
 * relevant trademark terms are reviewed and satisfied.
 */
export function TechIconGlyph({ icon, size = 20 }: TechIconGlyphProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      {render(icon)}
    </svg>
  );
}

function render(icon: TechIcon) {
  const s = { stroke: C, strokeWidth: 1.3 } as const;

  switch (icon) {
    case "react":
      return (
        <g {...s}>
          <circle cx="12" cy="12" r="2" fill={C} stroke="none" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)" opacity="0.6" />
          <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)" opacity="0.4" />
        </g>
      );
    case "next":
      return (
        <g {...s}>
          <circle cx="12" cy="12" r="8.5" opacity="0.6" />
          <path d="M9 16V8l7 8.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "js":
      return (
        <g {...s} strokeLinecap="round">
          <rect x="4" y="4" width="16" height="16" rx="2" opacity="0.5" />
          <path d="M11 9v5.5a1.8 1.8 0 01-3.4.8" />
          <path d="M17 10a2 2 0 00-3.2 1.6c0 2 3.2 1.4 3.2 3.2A2 2 0 0114 16" />
        </g>
      );
    case "ts":
      return (
        <g {...s} strokeLinecap="round">
          <rect x="4" y="4" width="16" height="16" rx="2" opacity="0.5" />
          <path d="M7 10h4.5M9.25 10v6" />
          <path d="M17.5 11a1.8 1.8 0 00-3 1.4c0 1.8 3 1.2 3 2.8a1.8 1.8 0 01-3 .8" />
        </g>
      );
    case "html":
      return (
        <g {...s} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 4l1.4 15L12 20.5 17.6 19 19 4z" opacity="0.6" />
          <path d="M8.5 9h7l-.5 5.5-3 1-3-1" />
        </g>
      );
    case "css":
      return (
        <g {...s} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 4l1.4 15L12 20.5 17.6 19 19 4z" opacity="0.6" />
          <path d="M15.5 9h-7l.4 3h6.2l-.4 3-2.7.9-2.7-.9" />
        </g>
      );
    case "tailwind":
      return (
        <g {...s} strokeLinecap="round">
          <path d="M4 12c1.5-3.5 3.7-4.5 6.5-3 1.9 1 2.4 2.8 5 2.4 1.6-.3 2.7-1.3 3.5-3" />
          <path d="M4 17c1.5-3.5 3.7-4.5 6.5-3 1.9 1 2.4 2.8 5 2.4 1.6-.3 2.7-1.3 3.5-3" opacity="0.5" />
        </g>
      );
    case "three":
      return (
        <g {...s} strokeLinejoin="round">
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
          <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" opacity="0.5" />
        </g>
      );
    case "node":
      return (
        <g {...s} strokeLinejoin="round">
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" opacity="0.6" />
          <path d="M9.5 9.5v5a1.6 1.6 0 003.2 0M12.7 11.5h2.4a1.4 1.4 0 010 2.8h-1.4a1.4 1.4 0 000 2.8h2.4" strokeLinecap="round" opacity="0.9" />
        </g>
      );
    case "python":
      return (
        <g {...s} strokeLinecap="round">
          <path d="M12 3.5c-3 0-4.5.8-4.5 2.8V9h5v1H6.5C4.6 10 3.5 11.4 3.5 14s1 3.5 2.5 3.5h1.5v-2.8c0-1.6 1.3-2.7 3-2.7" />
          <path d="M12 20.5c3 0 4.5-.8 4.5-2.8V15h-5v-1h6a2.8 2.8 0 002.5-3c0-2.6-1-3.5-2.5-3.5H16v2.8c0 1.6-1.3 2.7-3 2.7" opacity="0.6" />
        </g>
      );
    case "java":
      return (
        <g {...s} strokeLinecap="round">
          <path d="M10 4c-1.5 2 2.5 3 2.5 4.8 0 1-.8 1.7-1.5 2.2" />
          <path d="M7.5 13.5c-1.5.6-2 1.4-1 2.2 1.4 1.1 8.6 1.1 10 0 .7-.5.5-1.1-.5-1.7" opacity="0.7" />
          <path d="M6.5 18c2 1.3 9 1.3 11 0" opacity="0.5" />
        </g>
      );
    case "php":
      return (
        <g {...s}>
          <ellipse cx="12" cy="12" rx="9" ry="5.5" opacity="0.6" />
          <path d="M8 14l1-4h1.6a1 1 0 010 2H9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.5 14l1-4h1.6a1 1 0 010 2h-1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
        </g>
      );
    case "api":
      return (
        <g {...s} strokeLinecap="round">
          <rect x="3.5" y="9" width="5" height="6" rx="1.2" />
          <rect x="15.5" y="9" width="5" height="6" rx="1.2" opacity="0.6" />
          <path d="M8.5 12h7" strokeDasharray="1.5 2" />
        </g>
      );
    case "postgres":
      return (
        <g {...s}>
          <ellipse cx="12" cy="6.5" rx="7" ry="2.8" />
          <path d="M5 6.5v11c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-11" opacity="0.7" />
          <circle cx="12" cy="13" r="2" opacity="0.55" />
        </g>
      );
    case "mysql":
      return (
        <g {...s}>
          <ellipse cx="12" cy="6.5" rx="7" ry="2.8" />
          <path d="M5 6.5v11c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-11" opacity="0.7" />
          <path d="M8.5 12l1.8 3 1.7-3 1.8 3 1.7-3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
        </g>
      );
    case "mongo":
      return (
        <g {...s} strokeLinecap="round">
          <path d="M12 3c3 4 4.5 6.6 4.5 9.2 0 3.2-2 5.6-4.5 6.8-2.5-1.2-4.5-3.6-4.5-6.8C7.5 9.6 9 7 12 3z" />
          <path d="M12 8v13" opacity="0.5" />
        </g>
      );
    case "redis":
      return (
        <g {...s}>
          <path d="M3.5 8.5L12 5l8.5 3.5L12 12z" strokeLinejoin="round" />
          <path d="M3.5 12.5L12 16l8.5-3.5" opacity="0.65" strokeLinejoin="round" />
          <path d="M3.5 16.5L12 20l8.5-3.5" opacity="0.4" strokeLinejoin="round" />
        </g>
      );
    case "aws":
      return (
        <g {...s} strokeLinecap="round">
          <path d="M4 10.5l1.8 4 1.7-4 1.7 4 1.8-4" />
          <path d="M4 17.5c4.5 2.2 11.5 2.2 16-.5" opacity="0.65" />
          <path d="M17.5 15.5c1.2-.4 2.2-.2 2.5.4" opacity="0.5" />
          <path d="M14.5 12.5a1.7 1.7 0 100-3.4 1.7 1.7 0 000 3.4z" opacity="0.6" />
        </g>
      );
    case "azure":
      return (
        <g {...s} strokeLinejoin="round">
          <path d="M9 4l-5.5 13H8l5-16z" opacity="0.6" />
          <path d="M13 5l7.5 14H9.5l3-3.5h3.5z" />
        </g>
      );
    case "gcp":
      return (
        <g {...s} strokeLinejoin="round">
          <path d="M12 4l7 4v8l-7 4-7-4V8z" opacity="0.55" />
          <path d="M8 18a4 4 0 01-.4-6.6A4.6 4.6 0 0116 10.6a3.2 3.2 0 01-.4 7.4z" />
        </g>
      );
    case "ml":
      return (
        <g {...s}>
          <circle cx="5" cy="12" r="1.6" fill={C} stroke="none" />
          <circle cx="12" cy="7" r="1.6" fill={C} stroke="none" opacity="0.8" />
          <circle cx="12" cy="17" r="1.6" fill={C} stroke="none" opacity="0.8" />
          <circle cx="19" cy="12" r="1.6" fill={C} stroke="none" />
          <path d="M6.5 12l4-4.4M6.5 12l4 4.4M13.5 7.6l4.1 3.8M13.5 16.4l4.1-3.8" opacity="0.4" />
        </g>
      );
    case "genai":
      return (
        <g {...s} strokeLinejoin="round">
          <path d="M11 3l1.6 5.2L18 9.8l-5.4 1.6L11 16.6 9.4 11.4 4 9.8l5.4-1.6z" />
          <path d="M17.5 15l.8 2.5 2.5.8-2.5.8-.8 2.5-.8-2.5-2.5-.8 2.5-.8z" opacity="0.5" />
        </g>
      );
    case "aiapi":
      return (
        <g {...s} strokeLinecap="round">
          <rect x="7" y="7" width="10" height="10" rx="2.5" />
          <circle cx="12" cy="12" r="2" fill={C} stroke="none" opacity="0.7" />
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4" opacity="0.5" />
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
    case "git":
      return (
        <g {...s} strokeLinecap="round">
          <circle cx="7" cy="6" r="2" />
          <circle cx="7" cy="18" r="2" opacity="0.7" />
          <circle cx="17" cy="12" r="2" opacity="0.7" />
          <path d="M7 8v8" />
          <path d="M7 12h8" opacity="0.6" />
        </g>
      );
    case "github":
      return (
        <g {...s} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 20v-2.6c-2.8.6-3.4-1.3-3.4-1.3-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.3 9.3 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.3.3.7 1 .7 2V20" />
        </g>
      );
    case "docker":
      return (
        <g {...s} strokeLinecap="round">
          <rect x="5" y="11" width="3" height="3" />
          <rect x="9" y="11" width="3" height="3" opacity="0.8" />
          <rect x="13" y="11" width="3" height="3" opacity="0.6" />
          <rect x="9" y="7.5" width="3" height="3" opacity="0.6" />
          <path d="M4 16c2.5 3 12 3 15.5-2 1.5.4 2.3 0 2.5-.6" opacity="0.7" />
        </g>
      );
    case "cicd":
      return (
        <g {...s} strokeLinecap="round">
          <circle cx="6" cy="12" r="2" />
          <circle cx="18" cy="12" r="2" opacity="0.7" />
          <path d="M8 12h8" strokeDasharray="1.5 2" />
          <path d="M12 5.5a6.5 6.5 0 016.4 5.3M12 18.5a6.5 6.5 0 01-6.4-5.3" opacity="0.45" />
        </g>
      );
    default:
      return null;
  }
}
