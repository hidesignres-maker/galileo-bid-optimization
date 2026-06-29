/**
 * AppShell — top bar + page wrapper
 *
 * Usage:
 *   <AppShell
 *     title="Campaign Bid Optimization"
 *     subtitle="Walmart – US – Total Walmart"
 *     actions={<button>...</button>}
 *   >
 *     {children}
 *   </AppShell>
 *
 * Provides:
 *   - data-theme="galileo" on root div (activates DaisyUI galileo theme)
 *   - Sticky top nav bar (navbar)
 *   - Page content wrapper with consistent padding
 *
 * Does NOT:
 *   - Handle routing
 *   - Render mode switcher (App.jsx owns that)
 *   - Manage any state
 */
export function AppShell({ title, subtitle, actions, children }) {
  return (
    <div data-theme="galileo" className="min-h-screen bg-base-200 font-sans text-base-content">
      {/* Top bar */}
      <div className="navbar bg-base-100 border-b border-base-300 sticky top-0 z-50 shadow-sm px-4">
        <div className="flex-1">
          <span className="text-sm font-semibold text-base-content">{title}</span>
          {subtitle && (
            <span className="ml-3 text-xs text-base-content/50">{subtitle}</span>
          )}
        </div>
        {actions && <div className="flex-none gap-2">{actions}</div>}
      </div>

      {/* Page content */}
      <main className="max-w-screen-xl mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}
