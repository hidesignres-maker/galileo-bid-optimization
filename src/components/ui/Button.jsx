/**
 * Button — Corporate standard action hierarchy
 *
 * variant: "primary" | "ghost" | "outline" | "error" | "success" | "text"
 * size:    "sm" | "md" (default "md"; use "sm" inside toolbars/tables)
 * icon:    optional trailing Heroicon component (e.g. ArrowRightIcon)
 * iconPosition: "leading" | "trailing" (default "trailing")
 * iconClassName: optional size override for the icon only (default "w-4
 *   h-4", i.e. exactly the prior fixed behavior). Added for shell geometry
 *   parity (Calendar View's icon needs to render at 20px per Figma) without
 *   changing the icon size of any other existing Button usage.
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
  iconClassName = "w-4 h-4",
  className = "",
  children,
  ...props
}) {
  const variantClass = VARIANT_MAP[variant] ?? "btn-primary";
  const sizeClass = size === "sm" ? "btn-sm" : "";
  const iconEl = Icon && <Icon className={iconClassName} />;

  return (
    <button className={`btn ${variantClass} ${sizeClass} ${className}`} {...props}>
      {iconPosition === "leading" && iconEl}
      {children}
      {iconPosition === "trailing" && iconEl}
    </button>
  );
}
