/**
 * InfoBanner — Galileo alert banner
 * variant: "info" | "warning" | "success" | "error"
 */
const VARIANT_MAP = {
  info: "alert-info",
  warning: "alert-warning",
  success: "alert-success",
  error: "alert-error",
};

export function InfoBanner({ variant = "info", title, children, className = "" }) {
  const variantClass = VARIANT_MAP[variant] ?? "alert-info";
  return (
    <div className={`alert ${variantClass} items-start text-sm ${className}`}>
      <div>
        {title && <div className="font-semibold mb-0.5">{title}</div>}
        <div className={title ? "text-sm opacity-90" : ""}>{children}</div>
      </div>
    </div>
  );
}
