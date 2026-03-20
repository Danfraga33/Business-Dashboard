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
  Target,
  Share2,
  RefreshCw,
} from "lucide-react";
import { useDashboardStore } from "../store/dashboard";
import type { NavItem } from "../types/navigation";

const navItems: NavItem[] = [
  { to: "/", icon: Sun, label: "Morning Brief" },
  { to: "/health", icon: Activity, label: "Business Health" },
  { to: "/retention", icon: RefreshCw, label: "Retention" },
  {
    to: "/growth",
    icon: TrendingUp,
    label: "Growth Optimization",
    children: [
      { to: "/growth-levers/gtm", icon: Share2, label: "GTM" },
      { to: "/growth/conversion-funnel", icon: Target, label: "Conversion Funnel" },
    ],
  },
  {
    to: "/diagnostics",
    icon: Hexagon,
    label: "Diagnostics",
    children: [
      { to: "/diagnostics/unit-economics", icon: DollarSign, label: "Unit Economics" },
      { to: "/customers", icon: Users, label: "Customer Deep Dive" },
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
      className={`fixed top-0 left-0 h-screen z-40 flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out overflow-hidden ${
        sidebarCollapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-3 h-[64px] border-b border-sidebar-border shrink-0 ${
          sidebarCollapsed ? "px-4 justify-center" : "px-5"
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Hexagon className="w-4.5 h-4.5 text-primary" strokeWidth={2.5} />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-semibold text-sidebar-foreground tracking-tight whitespace-nowrap font-serif">
              Chief of Staff
            </h1>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2.5 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
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

          const sectionKey = item.to.replace(/^\//, '');
          const isExpanded = isSectionExpanded(sectionKey);

          return (
            <div key={item.to}>
              {item.separatorBefore && (
                <div className="h-px bg-sidebar-border mx-2 my-3" />
              )}

              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    className={`group relative w-full flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                      sidebarCollapsed
                        ? "px-0 py-2.5 justify-center"
                        : "px-3 py-2.5"
                    } ${
                      isActive
                        ? sidebarCollapsed
                          ? "bg-sidebar-primary/10 text-sidebar-primary"
                          : "bg-sidebar-primary/5 text-sidebar-primary"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                  >
                    {isActive && !sidebarCollapsed && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4.5 bg-primary rounded-r-full" />
                    )}
                    <item.icon
                      className={`w-[17px] h-[17px] shrink-0 ${
                        isActive
                          ? "text-sidebar-primary"
                          : "text-muted-foreground group-hover:text-sidebar-foreground"
                      }`}
                      strokeWidth={1.7}
                    />
                    {!sidebarCollapsed && (
                      <>
                        <span className="whitespace-nowrap flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}

                    {sidebarCollapsed && (
                      <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-0 ml-2.5 py-2 px-1 bg-popover border border-border rounded-lg shadow-lg transition-all duration-150 pointer-events-auto z-50 min-w-[200px]">
                        <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          {item.label}
                        </p>
                        {item.children!.map((child) => {
                          const childActive = location.pathname.startsWith(child.to);
                          return (
                            <NavLink
                              key={child.to}
                              to={child.to}
                              className={`flex items-center gap-2 px-3 py-2 rounded-md text-[13px] transition-colors ${
                                childActive
                                  ? "text-primary bg-primary/5"
                                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                              }`}
                            >
                              <child.icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.7} />
                              <span className="whitespace-nowrap">{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </button>

                  {!sidebarCollapsed && isExpanded && (
                    <div className="ml-4 mt-0.5 space-y-0.5">
                      {item.children!.map((child) => {
                        const childActive = location.pathname.startsWith(child.to);
                        return (
                          <NavLink
                            key={child.to}
                            to={child.to}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                              childActive
                                ? "text-primary bg-primary/5"
                                : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                            }`}
                          >
                            <child.icon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                childActive ? "text-primary" : "text-muted-foreground"
                              }`}
                              strokeWidth={1.7}
                            />
                            <span className="whitespace-nowrap">{child.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.to}
                  className={`group relative flex items-center gap-3 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                    sidebarCollapsed
                      ? "px-0 py-2.5 justify-center"
                      : "px-3 py-2.5"
                  } ${
                    isActive
                      ? sidebarCollapsed
                        ? "bg-sidebar-primary/10 text-sidebar-primary"
                        : "bg-sidebar-primary/5 text-sidebar-primary"
                      : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  {isActive && !sidebarCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4.5 bg-primary rounded-r-full" />
                  )}
                  <item.icon
                    className={`w-[17px] h-[17px] shrink-0 ${
                      isActive
                        ? "text-sidebar-primary"
                        : "text-muted-foreground group-hover:text-sidebar-foreground"
                    }`}
                    strokeWidth={1.7}
                  />
                  {!sidebarCollapsed && (
                    <span className="whitespace-nowrap">{item.label}</span>
                  )}

                  {sidebarCollapsed && (
                    <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-2.5 px-2.5 py-1 bg-popover border border-border rounded-lg text-[13px] text-foreground whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
                      {item.label}
                    </div>
                  )}
                </NavLink>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom toolbar */}
      <div className={`border-t border-sidebar-border shrink-0 px-2.5 py-2.5 flex items-center justify-center ${
        sidebarCollapsed ? "flex-col gap-0.5" : "flex-row gap-0.5"
      }`}>
        <button
          onClick={toggleTheme}
          className="group relative p-2 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
          title={theme === "light" ? "Dark mode" : "Light mode"}
        >
          {theme === "light" ? (
            <Moon className="w-[17px] h-[17px]" strokeWidth={1.7} />
          ) : (
            <Sun className="w-[17px] h-[17px]" strokeWidth={1.7} />
          )}
        </button>

        <NavLink
          to="/settings"
          className={`group relative p-2 rounded-lg transition-colors ${
            location.pathname === "/settings"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
          }`}
          title="Settings"
        >
          <Settings className="w-[17px] h-[17px]" strokeWidth={1.7} />
        </NavLink>

        <button
          onClick={toggleSidebar}
          className="group relative p-2 rounded-lg text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-[17px] h-[17px]" strokeWidth={1.7} />
          ) : (
            <PanelLeftClose className="w-[17px] h-[17px]" strokeWidth={1.7} />
          )}
        </button>
      </div>
    </aside>
  );
}
