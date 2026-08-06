/**
 * Card — Galileo card wrapper (Layer 1 core rule)
 * bg-base-100 border border-base-300 shadow-sm
 *
 * flat: optional, default false. Omits shadow-sm for a lighter/flatter
 * surface (e.g. compact summary tiles) without touching any existing
 * Card usage — every other caller keeps the shadow exactly as before.
 * shadow-sm itself is already the exact Figma shadow/sm value (verified
 * against the compiled CSS: `0 1px 3px 0 rgba(0,0,0,.10), 0 1px 2px -1px
 * rgba(0,0,0,.10)`), so no separate shadow token was needed for the
 * MetricCard parity pass — Card's existing default already is it.
 *
 * headerClassName: optional, default "" (falls back to the original
 * "px-4 pt-4"). Added for the Add Details Pattern v1 work surface, which
 * needs a 24px header inset to match its 24px body padding — a real
 * conditional (not an appended class) so there's no same-property class
 * ordering risk. Every existing caller omits this prop, so the header
 * renders with the exact same "px-4 pt-4" classes as before.
 *
 * bodyPadding: optional, default "p-4" — same reasoning as
 * headerClassName above, extended to the body. A real conditional that
 * *replaces* the body's padding utility outright (never coexists with
 * "p-4" on the same element) rather than something appended alongside
 * it, so there's no risk of two padding utilities landing on the body
 * div at once and depending on unstable class-generation order to
 * resolve. Added for MetricCard, which needs 12px body padding instead
 * of the default 16px. Every existing caller omits this prop, so the
 * body renders with the exact same "p-4" class as before.
 */
export function Card({
  title,
  subtitle,
  actions,
  children,
  className = "",
  bodyClassName = "",
  headerClassName = "",
  bodyPadding = "p-4",
  flat = false,
}) {
  return (
    <div className={`card bg-base-100 border border-base-300 ${flat ? "" : "shadow-sm"} ${className}`}>
      {(title || actions) && (
        <div className={`flex items-center justify-between ${headerClassName || "px-4 pt-4"}`}>
          <div>
            {title && <h3 className="text-base font-bold text-base-content">{title}</h3>}
            {subtitle && <p className="text-xs text-base-content/50 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`card-body ${bodyPadding} ${bodyClassName}`}>{children}</div>
    </div>
  );
}
