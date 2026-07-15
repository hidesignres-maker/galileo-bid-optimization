/**
 * Card — Galileo card wrapper (Layer 1 core rule)
 * bg-base-100 border border-base-300 shadow-sm
 */
export function Card({ title, subtitle, actions, children, className = "", bodyClassName = "" }) {
  return (
    <div className={`card bg-base-100 border border-base-300 shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 pt-4">
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
