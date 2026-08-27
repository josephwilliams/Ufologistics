/**
 * The mark: a three-quarter saucer, drawn by hand in SVG.
 *
 * Geometry rather than an emoji — it inherits `currentColor`, scales without
 * softening, and the beam carries its own gradient so it reads the same on the
 * night edition's black as on the day edition's newsprint. Shared by both
 * editions, so it lives outside either one's folder.
 */
export default function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 64" className={className} role="img" aria-label="Saucer">
      <defs>
        <linearGradient id="mk-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="mk-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* beam */}
      <path d="M40 40 L26 62 H70 L56 40 Z" fill="url(#mk-beam)" />

      {/* dome */}
      <path
        d="M31 31c0-9.4 7.6-17 17-17s17 7.6 17 17"
        fill="url(#mk-hull)"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* hull */}
      <ellipse
        cx="48" cy="33" rx="44" ry="9.5"
        fill="url(#mk-hull)" stroke="currentColor" strokeWidth="2.5"
      />
      {/* lights */}
      <circle cx="24" cy="35.5" r="2.4" fill="currentColor" />
      <circle cx="48" cy="37" r="2.4" fill="currentColor" />
      <circle cx="72" cy="35.5" r="2.4" fill="currentColor" />
    </svg>
  );
}
