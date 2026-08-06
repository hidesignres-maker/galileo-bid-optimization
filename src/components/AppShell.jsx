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
import { Tab } from "./ui/Tab";

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
 *
 * `pageBackgroundClassName` (default "bg-base-200"): opt-in,
 * backward-compatible — the page-canvas background class applied to the
 * outer shell wrapper. Every existing caller that doesn't pass this prop
 * keeps the shared `bg-base-200` surface (Queue, Read, Edit) exactly as
 * before. App.jsx's Creation route (Brand/VizID + Innovation manual
 * flow) is the only caller that overrides it, to `bg-page-creation` — the
 * token alias for Figma's approved `main/color/base/200` (#F5F5F7) — so
 * that change is scoped to Creation without touching the canonical
 * base-200 mapping other screens (and assorted chip/avatar fills) still
 * rely on.
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
  pageBackgroundClassName = "bg-base-200",
  children,
}) {
  return (
    <div className={`min-h-screen flex ${pageBackgroundClassName}`}>
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

        {/* Module-nav row wrapper — transparent by design: this row sits
            directly on the page canvas (bg-base-200 / bg-page-creation set
            higher up in AppShell/App.jsx), so it must not paint its own
            opaque fill. A prior pass kept `bg-base-100` here on the
            assumption that white was the approved Figma surface token for
            this row; product feedback corrected that — the row itself
            carries no background at all, only the tabs' own transparent
            state plus the divider border below. `border-b border-base-300`
            stays as the visual separator from the content below it.
            `pt-2` (8px breathing room above the 40px tabs) and `items-end`
            (keeps each Tab's `border-b-2 -mb-px` underline flush against
            this row's own `border-b`) are unchanged from the prior pass.
            This wrapper is intentionally not reused by Queue status tabs
            or Product Selection tabs — both keep their own surrounding
            containers, only sharing the Tab item itself. */}
        {showSectionTabs && (
          <div className="border-b border-base-300 px-6 pt-2 flex items-end gap-7 shrink-0">
            {sectionTabs.map((tab) => {
              const isActive = tab === activeSectionTab;
              return (
                <Tab
                  key={tab}
                  active={isActive}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onSectionTabSelect ? () => onSectionTabSelect(tab) : undefined}
                  className={!isActive ? "hover:border-base-300" : ""}
                >
                  {tab}
                </Tab>
              );
            })}
          </div>
        )}

        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
