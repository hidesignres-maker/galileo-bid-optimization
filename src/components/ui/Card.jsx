/**
 * Card — Galileo card wrapper (Layer 1 core rule)
 * bg-base-100 border border-base-300 shadow-sm
 *
 * flat: optional, default false. Omits shadow-sm for a lighter/flatter
 * surface (e.g. compact summary tiles) without touching any existing
 * Card usage — every other caller keeps the shadow exactly as before.
 *
 * headerClassName: optional, default "" (falls back to the original
 * "px-4 pt-4"). Added for the Add Details Pattern v1 work surface, which
 * needs a 24px header inset to match its 24px body padding — a real
 * conditional (not an appended class) so there's no same-property class
 * ordering risk. Every existing caller omits this prop, so the header
 * renders with the exact same "px-4 pt-4" classes as before.
 */
export function Card({
  title,
  subtitle,
  actions,
  children,
  className = "",
  bodyClassName = "",
  headerClassName = "",
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
      <div className={`card-body p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
