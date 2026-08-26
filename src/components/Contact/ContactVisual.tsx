const CYAN = "#45e0e8";
const PRIMARY = "#2e7cf6";
const BORDER = "#242d3d";
const FAINT = "#576076";

/** A signal travelling from an idea, through Nexyronix, into a product. */
export function ContactVisual() {
  return (
    <svg viewBox="0 0 400 110" width="100%" height="100%" fill="none" aria-hidden="true">
      {/* Track */}
      <line x1="40" y1="55" x2="360" y2="55" stroke={BORDER} strokeWidth="1.5" />
      <line
        x1="40"
        y1="55"
        x2="360"
        y2="55"
        stroke={CYAN}
        strokeWidth="1.5"
        strokeOpacity="0.5"
        strokeDasharray="5 9"
        className="animate-dash-flow"
      />

      {/* Idea */}
      <circle cx="40" cy="55" r="6" fill="#0d1119" stroke={PRIMARY} strokeWidth="1.5" />
      <circle cx="40" cy="55" r="2.5" fill={CYAN} />
      <circle
        cx="40"
        cy="55"
        r="13"
        fill="none"
        stroke={CYAN}
        strokeOpacity="0.25"
        className="animate-pulse-slow"
      />
      <text
        x="40"
        y="86"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="8.5"
        letterSpacing="0.16em"
        fill={FAINT}
      >
        IDEA
      </text>

      {/* Nexyronix core */}
      <circle cx="200" cy="55" r="26" fill="none" stroke={BORDER} strokeDasharray="2 4" />
      <circle cx="200" cy="55" r="16" fill="#0d1119" stroke={PRIMARY} strokeOpacity="0.7" />
      <circle cx="200" cy="55" r="7" fill={CYAN} fillOpacity="0.35" className="animate-pulse-slow" />
      <text
        x="200"
        y="97"
        textAnchor="middle"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="9"
        fontWeight="600"
        letterSpacing="0.1em"
        fill="#edf1f6"
      >
        NEXYRONIX
      </text>

      {/* Product — a small resolved network */}
      <g>
        <circle cx="360" cy="55" r="6" fill="#0d1119" stroke={CYAN} strokeWidth="1.5" />
        {[
          [-18, -18],
          [18, -18],
          [-18, 18],
          [18, 18],
        ].map(([dx, dy], i) => (
          <g key={i}>
            <line x1="360" y1="55" x2={360 + dx} y2={55 + dy} stroke={BORDER} />
            <circle cx={360 + dx} cy={55 + dy} r="2.4" fill={i % 2 === 0 ? PRIMARY : CYAN} />
          </g>
        ))}
      </g>
      <text
        x="360"
        y="97"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="8.5"
        letterSpacing="0.16em"
        fill={FAINT}
      >
        PRODUCT
      </text>
    </svg>
  );
}
