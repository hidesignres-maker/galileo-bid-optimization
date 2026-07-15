/**
 * Button — Corporate standard action hierarchy
 *
 * variant: "primary" | "ghost" | "outline" | "error" | "success" | "text"
 * size:    "sm" | "md" (default "md"; use "sm" inside toolbars/tables)
 * icon:    optional trailing Heroicon component (e.g. ArrowRightIcon)
 * iconPosition: "leading" | "trailing" (default "trailing")
 *
 * "text" variant renders a bare text action (no border/background) —
 * used for "Discard" in the wizard footer, matching the reference UI.
 */
const VARIANT_MAP = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  outline: "btn-outline",
  error: "btn-error",
  success: "btn-success",
  text: "btn-ghost px-0",
};

export function Button({
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "trailing",
  className = "",
  children,
  ...props
}) {
  const variantClass = VARIANT_MAP[variant] ?? "btn-primary";
  const sizeClass = size === "sm" ? "btn-sm" : "";
  const iconEl = Icon && <Icon className="w-4 h-4" />;

  return (
    <button className={`btn ${variantClass} ${sizeClass} ${className}`} {...props}>
      {iconPosition === "leading" && iconEl}
      {children}
      {iconPosition === "trailing" && iconEl}
    </button>
  );
}
