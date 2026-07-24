type MandalaProps = {
  className?: string;
};

/**
 * Decorative concentric-lotus mandala, drawn as inline SVG (no image request).
 * Uses `currentColor` so callers tint it via text color at low opacity.
 */
export function Mandala({ className }: MandalaProps) {
  const petals = Array.from({ length: 16 }, (_, i) => i * (360 / 16));

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.75"
      className={className}
      aria-hidden
      focusable="false"
    >
      <circle cx="100" cy="100" r="96" />
      <circle cx="100" cy="100" r="78" />
      <circle cx="100" cy="100" r="40" strokeWidth="1" />
      <circle cx="100" cy="100" r="20" />

      <g>
        {petals.map((deg) => (
          <path
            key={deg}
            d="M100 22 C112 46, 112 70, 100 92 C88 70, 88 46, 100 22 Z"
            transform={`rotate(${deg} 100 100)`}
          />
        ))}
      </g>

      <g strokeWidth="0.5">
        {petals.map((deg) => (
          <path
            key={`inner-${deg}`}
            d="M100 60 C107 74, 107 86, 100 98 C93 86, 93 74, 100 60 Z"
            transform={`rotate(${deg + 11.25} 100 100)`}
          />
        ))}
      </g>
    </svg>
  );
}
