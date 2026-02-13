import { NavLink, useLocation } from "react-router";
import {
  Sun,
  Moon,
  Activity,
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Hexagon,
  ChevronDown,
  Shield,
  Target,
  Rocket,
  Briefcase,
  DollarSign as PricingIcon,
  Share2,
  Filter,
} from "lucide-react";
import { useDashboardStore } from "../store/dashboard";
import type { NavItem } from "../types/navigation";

const navItems: NavItem[] = [
  { to: "/", icon: Sun, label: "Morning Brief" },
  { to: "/health", icon: Activity, label: "Business Health" },
  { to: "/customers", icon: Users, label: "Customer Deep Dive" },
  {
    to: "/growth",
    icon: TrendingUp,
    label: "Growth Optimization",
    children: [
      { to: "/growth/retention-monetization", icon: Shield, label: "Retention & Monetization" },
      { to: "/growth/conversions-cac", icon: Target, label: "Conversions & CAC" },
      { to: "/growth/acquisition-expansion", icon: Rocket, label: "Acquisition & Expansion" },
    ],
  },
  {
    to: "/growth-levers",
    icon: Briefcase,
    label: "Growth Levers",
    children: [
      { to: "/growth-levers/gtm", icon: Share2, label: "Go-to-Market" },
      { to: "/growth-levers/defensibility", icon: Shield, label: "Product Defensibility" },
    ],
  },
  { to: "/financials", icon: DollarSign, label: "Financials" },
  { to: "/learnings", icon: BookOpen, label: "Learnings", separatorBefore: true },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme, toggleSection, isSectionExpanded } =
    useDashboardStore();
  const location = useLocation();

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
        {navItems.map((item) => {
          const hasChildren = item.children && item.children.length > 0;
          const isAnyChildActive = hasChildren
            ? item.children!.some((child) => location.pathname.startsWith(child.to))
            : false;
          const isActive = hasChildren
            ? isAnyChildActive
            : item.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.to);

          // Determine section key from route path (e.g., "/growth" -> "growth", "/operations" -> "operations")
          const sectionKey = item.to.replace(/^\//, '');
          const isExpanded = isSectionExpanded(sectionKey);

          return (
            <div key={item.to}>
              {/* Separator */}
              {item.separatorBefore && (
                <div className="h-px bg-edge mx-1 my-3" />
              )}

              {hasChildren ? (
                <>
                  {/* Dropdown parent */}
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    className={`group relative w-full flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
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
                          className={`w-3.5 h-3.5 text-ink-muted transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}

                    {/* Collapsed: flyout with clickable links */}
                    {sidebarCollapsed && (
                      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-0 ml-3 py-2 px-1 bg-surface border border-edge rounded-lg shadow-lg transition-all duration-150 pointer-events-auto z-50 min-w-[220px]">
                        <p className="px-3 py-1.5 text-2xs font-semibold text-ink-muted uppercase tracking-wider">
                          {item.label}
                        </p>
                        {item.children!.map((child) => {
                          const childActive = location.pathname.startsWith(child.to);
                          return (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-colors ${
                                childActive
                                  ? "text-accent bg-accent/5"
                                  : "text-ink-secondary hover:text-ink hover:bg-surface-hover"
                              }`}
                            >
                              <child.icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
                              <span className="whitespace-nowrap">{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </button>

                  {/* Expanded children (only when sidebar is open) */}
                  {!sidebarCollapsed && isExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {item.children!.map((child) => {
                        const childActive = location.pathname.startsWith(child.to);
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                              childActive
                                ? "text-accent bg-accent/5"
                                : "text-ink-secondary hover:text-ink hover:bg-surface-hover"
                            }`}
                          >
                            <child.icon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                childActive ? "text-accent" : "text-ink-muted"
                              }`}
                              strokeWidth={1.8}
                            />
                            <span className="whitespace-nowrap">{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* Regular nav item */
                <NavLink
                  to={item.to}
                  className={`group relative flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150 ${
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
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}

                  {sidebarCollapsed && (
                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface border border-edge rounded-lg text-xs text-ink whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom toolbar — vertical when collapsed, horizontal when expanded */}
      <div className={`border-t border-edge shrink-0 px-3 py-3 flex items-center justify-center ${
        sidebarCollapsed ? "flex-col gap-1" : "flex-row gap-1"
      }`}>
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="group relative p-2.5 rounded-lg text-ink-muted hover:text-ink-secondary hover:bg-surface-hover transition-colors cursor-pointer"
          title={theme === "light" ? "Dark mode" : "Light mode"}
        >
          {theme === "light" ? (
            <Moon className="w-[18px] h-[18px]" strokeWidth={1.8} />
          ) : (
            <Sun className="w-[18px] h-[18px]" strokeWidth={1.8} />
          )}
        </button>

        {/* Settings */}
        <NavLink
          to="/settings"
          className={`group relative p-2.5 rounded-lg transition-colors ${
            location.pathname === "/settings"
              ? "text-accent bg-accent/10"
              : "text-ink-muted hover:text-ink-secondary hover:bg-surface-hover"
          }`}
          title="Settings"
        >
          <Settings className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </NavLink>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="group relative p-2.5 rounded-lg text-ink-muted hover:text-ink-secondary hover:bg-surface-hover transition-colors cursor-pointer"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-[18px] h-[18px]" strokeWidth={1.8} />
          ) : (
            <PanelLeftClose className="w-[18px] h-[18px]" strokeWidth={1.8} />
          )}
        </button>
      </div>
    </aside>
  );
}
