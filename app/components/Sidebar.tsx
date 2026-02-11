import { NavLink, useLocation } from "react-router";
import {
  Sun,
  Moon,
  LayoutGrid,
  TrendingUp,
  BookOpen,
  FlaskConical,
  Settings,
  PanelLeftClose,
  PanelLeft,
  Hexagon,
} from "lucide-react";
import { useDashboardStore } from "../store/dashboard";

const navItems = [
  { to: "/", icon: Sun, label: "Morning Brief" },
  { to: "/portfolio", icon: LayoutGrid, label: "Portfolio" },
  { to: "/financials", icon: TrendingUp, label: "Financials" },
  { to: "/journal", icon: BookOpen, label: "Journal" },
  { to: "/experiments", icon: FlaskConical, label: "Experiments" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, theme, toggleTheme } =
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
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
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
              {/* Active bar — only when expanded */}
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

              {/* Tooltip — only when collapsed */}
              {sidebarCollapsed && (
                <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1 bg-surface border border-edge rounded-lg text-xs text-ink whitespace-nowrap shadow-lg transition-all duration-150 pointer-events-none z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
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
