import {
  Squares2X2Icon,
  CalendarDaysIcon,
  ChartBarIcon,
  DocumentTextIcon,
  LinkIcon,
  UserIcon,
  CircleStackIcon,
  BookmarkIcon,
  PresentationChartLineIcon,
  RocketLaunchIcon,
  CurrencyDollarIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";

/**
 * AppShell — reusable Galileo page shell (left nav rail + blue module
 * header + section nav row) with a plain content slot for `children`.
 *
 * This is presentation chrome only: `navItems`/`sectionTabs` are config,
 * not routes — there is no router in this prototype, so any item without
 * an `onSelect` handler wired up by the caller is purely decorative.
 * Nothing here reads request data, state, or business rules; it only
 * renders whatever configuration it's given.
 *
 * Deliberately generic so a future screen (Scores, Changes, Insights...)
 * could reuse it by passing different `navItems`/`sectionTabs`/`children`
 * — it is not hardcoded to Content Request Queue.
 *
 * `showSectionTabs` (default true): opt-in, backward-compatible — when
 * false, the entire module section-tabs row is omitted (used by the
 * manual create/review flow, which hides Scores/Changes/Content
 * Request/Insights per the approved Figma create-flow shell). Every
 * existing caller that doesn't pass this prop renders exactly as before;
 * the rail and blue module header are unaffected either way.
 */

export const DEFAULT_NAV_ITEMS = [
  { id: "grid", label: "Overview", icon: Squares2X2Icon },
  { id: "calendar", label: "Calendar", icon: CalendarDaysIcon },
  { id: "scores", label: "Scores", icon: ChartBarIcon },
  { id: "docs", label: "Documents", icon: DocumentTextIcon },
  { id: "links", label: "Links", icon: LinkIcon },
  { id: "users", label: "Users", icon: UserIcon },
  { id: "data", label: "Data", icon: CircleStackIcon },
  { id: "content-request", label: "Content Request", icon: BookmarkIcon },
  { id: "insights", label: "Insights", icon: PresentationChartLineIcon },
  { id: "launch", label: "Launch", icon: RocketLaunchIcon },
  { id: "budget", label: "Budget", icon: CurrencyDollarIcon },
  { id: "sync", label: "Sync", icon: ArrowsRightLeftIcon },
];

export const DEFAULT_SECTION_TABS = ["Scores", "Changes", "Content Request", "Insights"];

export function AppShell({
  moduleName = "Sales",
  pageGroupLabel = "Content Management",
  navItems = DEFAULT_NAV_ITEMS,
  activeNavId = "content-request",
  onNavSelect,
  sectionTabs = DEFAULT_SECTION_TABS,
  activeSectionTab = "Content Request",
  onSectionTabSelect,
  showSectionTabs = true,
  children,
}) {
  return (
    <div className="min-h-screen flex bg-base-200">
      <nav
        aria-label="Primary"
        className="w-[52px] bg-base-100 border-r border-base-300 flex flex-col items-center py-5 gap-1.5 shrink-0"
      >
        {navItems.map((item) => {
          const isActive = item.id === activeNavId;
          return (
            <button
              key={item.id}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              onClick={onNavSelect ? () => onNavSelect(item.id) : undefined}
              className={`w-9 h-9 flex items-center justify-center rounded-field transition-colors ${
                isActive
                  ? "bg-primary text-primary-content"
                  : "text-primary/50 hover:text-primary hover:bg-primary/10"
              }`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          );
        })}
      </nav>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-primary text-primary-content px-6 h-12 flex items-center gap-3 shrink-0">
          <span className="font-bold text-sm">{moduleName}</span>
          <span className="opacity-40">|</span>
          <span className="text-sm">{pageGroupLabel}</span>
        </header>

        {showSectionTabs && (
          <div className="bg-base-100 border-b border-base-300 px-6 shrink-0">
            <div className="h-10 flex items-end gap-7">
              {sectionTabs.map((tab) => {
                const isActive = tab === activeSectionTab;
                return (
                  <button
                    key={tab}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={onSectionTabSelect ? () => onSectionTabSelect(tab) : undefined}
                    className={`pb-3 text-sm border-b-2 -mb-px transition-colors ${
                      isActive
                        ? "border-primary text-primary font-semibold"
                        : "border-transparent text-base-content/60 hover:text-base-content hover:border-base-300"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
