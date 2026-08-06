/**
 * Button — Corporate standard action hierarchy
 *
 * Galileo's approved button taxonomy is three groups — Default, Light,
 * Ghost — with Default further split into Primary/Destructive variants.
 * The existing API here is `variant` + `emphasis` (not a literal `group`
 * prop); per the instruction that introduced this taxonomy ("if the
 * current API uses variant + emphasis, extend that model consistently
 * rather than introducing incompatible terminology"), the three approved
 * groups map onto that existing model instead of adding a new prop:
 *
 *   Default  → emphasis="solid" (default) — variant="primary" | "destructive" | "neutral" | "error" | "success"
 *   Light    → emphasis="light" (alias of the pre-existing "soft" value — see EMPHASIS_MAP)
 *   Ghost    → variant="ghost" (already its own thing; ghost buttons don't combine with emphasis)
 *
 * variant: "primary" | "neutral" | "destructive" | "ghost" | "outline" | "error" | "success" | "text"
 *   "destructive" (added this pass, Default group's second variant) is a
 *   solid red action button — used for irreversible/destructive
 *   confirmations (e.g. Archive). Resolves through the `--color-destructive`
 *   / `--color-destructive-content` tokens (theme/corporate.css), applied
 *   via an inline `--btn-color`/`--btn-fg` override rather than a new
 *   DaisyUI `.btn-destructive` class — DaisyUI derives every hover/
 *   active/focus/disabled state from those two custom properties via
 *   `color-mix`, so this gets full, correct interactive-state parity with
 *   every other variant for free. Deliberately a different token from
 *   "error" (`--color-error`, #FF6266) below — that value is already
 *   load-bearing for form validation text and the "Needs Action" status
 *   pill elsewhere in the app; "destructive" is Figma's distinct, more
 *   saturated `main/color/error/error` (#DC2626) reserved for this solid
 *   button treatment. "error" (`btn-error`) is kept as a legacy alias for
 *   any existing call site that still passes it — it is not the same
 *   color as "destructive" and should not be used for new destructive
 *   buttons.
 *   "neutral" maps to DaisyUI's own `btn-neutral` (`--color-neutral`),
 *   distinct from "ghost" (no color at all, transparent/borderless).
 * emphasis: "solid" (default, unchanged) | "soft" | "light"
 *   "soft"/"light" are exact aliases of each other (both render DaisyUI's
 *   `btn-soft` modifier — a tinted, low-emphasis surface via `color-mix`,
 *   the same soft-treatment mechanism already used for Queue status pills
 *   and CountBadge). "soft" is the original prop value from the pass that
 *   introduced it (Calendar View still passes `emphasis="soft"` and is
 *   unchanged); "light" is the newer, approved taxonomy name for the
 *   identical output — use "light" in new call sites.
 * size: semantic scale, all three backed by DaisyUI's own built-in size
 *   modifiers (verified against the compiled DaisyUI source, not assumed):
 *     "default" → unchanged base .btn height = 40px
 *     "small"   → btn-sm  = 32px
 *     "compact" → btn-xs  = 24px
 *   Legacy values are kept as exact aliases so every existing call site
 *   renders identically: "md" behaves exactly like "default" (40px, no
 *   extra class — the prior behavior), "sm" behaves exactly like "small"
 *   (btn-sm, the prior behavior). Prefer the semantic names ("default" /
 *   "small" / "compact") in new call sites.
 * icon:    optional Heroicon component (e.g. ArrowRightIcon)
 * iconPosition: "leading" | "trailing" (default "trailing")
 * iconClassName: optional size override for the icon only (default "w-4
 *   h-4", i.e. exactly the prior fixed behavior). Added for shell geometry
 *   parity (Calendar View's icon needs to render at 20px per Figma) without
 *   changing the icon size of any other existing Button usage.
 *
 * "text" variant renders a bare text action (no border/background) —
 * used for "Discard" in the wizard footer, matching the reference UI.
 *
 * Every existing caller (variant in the original seven, size "sm"/"md" or
 * omitted, emphasis omitted or "soft") renders with the exact same classes
 * as before — "destructive"/"light" are additive.
 */
const VARIANT_MAP = {
  primary: "btn-primary",
  neutral: "btn-neutral",
  // No matching DaisyUI color role — resolved via an inline --btn-color/
  // --btn-fg override instead (see DESTRUCTIVE_STYLE below), so no
  // DaisyUI modifier class is added here.
  destructive: "",
  ghost: "btn-ghost",
  outline: "btn-outline",
  error: "btn-error", // legacy alias — distinct color from "destructive", see doc comment above
  success: "btn-success",
  text: "btn-ghost px-0",
};

const EMPHASIS_MAP = {
  solid: "", // Default group
  soft: "btn-soft", // Light group — original prop value, unchanged
  light: "btn-soft", // Light group — approved taxonomy alias for "soft"
};

// Applied only when variant="destructive". Overrides just the two CSS
// custom properties DaisyUI's own .btn mechanism keys every interactive
// state off of, so hover/active/focus/disabled all follow correctly
// without a bespoke .btn-destructive class.
const DESTRUCTIVE_STYLE = {
  "--btn-color": "var(--color-destructive)",
  "--btn-fg": "var(--color-destructive-content)",
};

export function Button({
  variant = "primary",
  emphasis = "solid",
  size = "md",
  icon: Icon,
  iconPosition = "trailing",
  iconClassName = "w-4 h-4",
  className = "",
  style,
  children,
  ...props
}) {
  const variantClass = VARIANT_MAP[variant] ?? "btn-primary";
  const sizeClass = { compact: "btn-xs", small: "btn-sm", sm: "btn-sm", default: "", md: "" }[size] ?? "";
  const emphasisClass = EMPHASIS_MAP[emphasis] ?? "";
  const iconEl = Icon && <Icon className={iconClassName} />;
  const mergedStyle = variant === "destructive" ? { ...DESTRUCTIVE_STYLE, ...style } : style;

  return (
    <button
      className={`btn ${variantClass} ${emphasisClass} ${sizeClass} ${className}`}
      style={mergedStyle}
      {...props}
    >
      {iconPosition === "leading" && iconEl}
      {children}
      {iconPosition === "trailing" && iconEl}
    </button>
  );
}
