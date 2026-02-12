import { NavLink, useLocation } from "react-router";
import {
  Sun,
  Moon,
  TrendingUp,
  BookOpen,
  FlaskConical,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Hexagon,
  Database,
  BarChart3,
  Cog,
  ChevronDown,
  Users,
  DollarSign,
  Package,
  Server,
  HeadphonesIcon,
} from "lucide-react";
import { useDashboardStore } from "../store/dashboard";
import type { NavItem } from "../types/navigation";

const navItems: NavItem[] = [
  { to: "/", icon: Sun, label: "Morning Brief" },
  {
    to: "/data",
    icon: Database,
    label: "Data",
    children: [
      { to: "/data/unit-economics", icon: DollarSign, label: "Unit Economics" },
      { to: "/data/customers", icon: Users, label: "Customers" },
    ],
  },
  {
    to: "/marketing",
    icon: BarChart3,
    label: "Marketing",
    children: [
      { to: "/marketing", icon: BarChart3, label: "Overview" },
      { to: "/marketing/paid", icon: DollarSign, label: "Paid Channels" },
      { to: "/marketing/organic", icon: TrendingUp, label: "Organic Channels" },
    ],
  },
  {
    to: "/operations",
    icon: Cog,
    label: "Operations",
    children: [
      { to: "/operations", icon: Cog, label: "Overview" },
      { to: "/operations/product", icon: Package, label: "Product" },
      { to: "/operations/infrastructure", icon: Server, label: "Infrastructure" },
      { to: "/operations/customer-success", icon: HeadphonesIcon, label: "Customer Success" },
    ],
  },
  { to: "/financials", icon: TrendingUp, label: "Financials" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/experiments", icon: FlaskConical, label: "Experiments" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme, toggleSection, isSectionExpanded } =
    useDashboardStore();
  const location = useLocation();

  const renderNavItem = (item: NavItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = isSectionExpanded(item.label.toLowerCase());
    const isActive =
      item.to === "/"
        ? location.pathname === "/"
        : location.pathname.startsWith(item.to);

    if (hasChildren) {
      // Parent item with collapsible children
      return (
        <div key={item.to}>
          <button
            onClick={() => toggleSection(item.label.toLowerCase())}
            className={`group relative flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150 w-full ${
              sidebarCollapsed
                ? "px-0 py-2.5 justify-center"
                : "px-3.5 py-2.5"
            } ${
              isActive
                ? sidebarCollapsed
                  ? "bg-accent/10 text-accent"
                  : "bg-accent/5 text-accent"
                : "text-ink-secondary hover:text-ink hover:bg-surface-hover"
            }`}
          >
            {isActive && !sidebarCollapsed && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
            )}
            <item.icon
              className={`w-[18px] h-[18px] shrink-0 ${
                isActive
                  ? "text-accent"
                  : "text-ink-muted group-hover:text-ink-secondary"
              }`}
              strokeWidth={1.8}
            />
            {!sidebarCollapsed && (
              <>
                <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  strokeWidth={1.8}
                />
              </>
            )}

            {sidebarCollapsed && (
              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface border border-edge rounded-lg text-xs text-ink whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
                {item.label}
              </div>
            )}
          </button>

          {/* Children */}
          {isExpanded && !sidebarCollapsed && (
            <div className="mt-1 space-y-1">
              {item.children?.map((child) => renderNavItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    // Regular nav item (no children) or child item
    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={`group relative flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150 ${
          sidebarCollapsed
            ? "px-0 py-2.5 justify-center"
            : isChild
            ? "px-3.5 py-2.5 pl-10"
            : "px-3.5 py-2.5"
        } ${
          isActive
            ? sidebarCollapsed
              ? "bg-accent/10 text-accent"
              : "bg-accent/5 text-accent"
            : "text-ink-secondary hover:text-ink hover:bg-surface-hover"
        }`}
      >
        {isActive && !sidebarCollapsed && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent rounded-r-full" />
        )}
        <item.icon
          className={`w-[18px] h-[18px] shrink-0 ${
            isActive
              ? "text-accent"
              : "text-ink-muted group-hover:text-ink-secondary"
          }`}
          strokeWidth={1.8}
        />
        {!sidebarCollapsed && (
          <span className="whitespace-nowrap">{item.label}</span>
        )}

        {sidebarCollapsed && (
          <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface border border-edge rounded-lg text-xs text-ink whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
            {item.label}
          </div>
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col border-r border-edge bg-base transition-all duration-300 ease-in-out overflow-hidden ${
        sidebarCollapsed ? "w-[80px]" : "w-[280px]"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-3 h-[72px] border-b border-edge shrink-0 ${
          sidebarCollapsed ? "px-5 justify-center" : "px-6"
        }`}
      >
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
          <Hexagon className="w-5 h-5 text-accent" strokeWidth={2.5} />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-xs font-semibold text-ink tracking-tight whitespace-nowrap">
              Chief of Staff
            </h1>
            
          </div>
        )}
      </div>


      <nav className="flex-1 py-5 px-3 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Bottom controls */}
      <div
        className={`border-t border-edge shrink-0 ${
          sidebarCollapsed
            ? "px-3 py-3 flex flex-col items-center gap-1"
            : "px-4 py-3 flex items-center justify-between"
        }`}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className={`group relative flex items-center gap-2.5 rounded-lg text-ink-muted hover:text-ink-secondary hover:bg-surface-hover transition-colors cursor-pointer ${
            sidebarCollapsed ? "p-2.5 justify-center" : "px-3 py-2"
          }`}
          title={theme === "light" ? "Dark mode" : "Light mode"}
        >
          {theme === "light" ? (
            <Moon className="w-[18px] h-[18px]" strokeWidth={1.8} />
          ) : (
            <Sun className="w-[18px] h-[18px]" strokeWidth={1.8} />
          )}
          {!sidebarCollapsed && (
            <span className="text-xs">
              {theme === "light" ? "Dark mode" : "Light mode"}
            </span>
          )}
          {sidebarCollapsed && (
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface border border-edge rounded-lg text-xs text-ink whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
              {theme === "light" ? "Dark mode" : "Light mode"}
            </div>
          )}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={`group relative flex items-center gap-2.5 rounded-lg text-ink-muted hover:text-ink-secondary hover:bg-surface-hover transition-colors cursor-pointer ${
            sidebarCollapsed ? "p-2.5 justify-center" : "px-3 py-2"
          }`}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-[18px] h-[18px]" strokeWidth={1.8} />
          ) : (
            <>
              <PanelLeftClose
                className="w-[18px] h-[18px]"
                strokeWidth={1.8}
              />
              <span className="text-xs whitespace-nowrap">Collapse</span>
            </>
          )}
          {sidebarCollapsed && (
            <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface border border-edge rounded-lg text-xs text-ink whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
              Expand sidebar
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
