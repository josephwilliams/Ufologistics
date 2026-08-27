/**
 * La marca: un platillo de tres cuartos, dibujado a mano en SVG.
 *
 * Geometría, no emoji — hereda `currentColor`, escala sin pixelarse y el haz
 * inferior usa un degradado propio para que se lea igual sobre el fondo negro
 * de la edición noche que sobre el papel de la edición día.
 */
export default function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 64" className={className} role="img" aria-label="Platillo">
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

      {/* haz */}
      <path d="M40 40 L26 62 H70 L56 40 Z" fill="url(#mk-beam)" />

      {/* cúpula */}
      <path
        d="M31 31c0-9.4 7.6-17 17-17s17 7.6 17 17"
        fill="url(#mk-hull)"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* casco */}
      <ellipse
        cx="48" cy="33" rx="44" ry="9.5"
        fill="url(#mk-hull)" stroke="currentColor" strokeWidth="2.5"
      />
      {/* luces */}
      <circle cx="24" cy="35.5" r="2.4" fill="currentColor" />
      <circle cx="48" cy="37" r="2.4" fill="currentColor" />
      <circle cx="72" cy="35.5" r="2.4" fill="currentColor" />
    </svg>
  );
}
