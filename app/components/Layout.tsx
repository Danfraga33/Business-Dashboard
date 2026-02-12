import { useEffect } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { useDashboardStore } from "../store/dashboard";

export function Layout({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export default function DashboardLayout() {
  const { sidebarCollapsed, toggleSidebar } = useDashboardStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);

  return (
    <div className="noise-overlay min-h-screen">
      <Sidebar />
      <main
        className={`transition-all duration-300 ease-in-out min-h-screen ${
          sidebarCollapsed ? "ml-[80px]" : "ml-[280px]"
        }`}
      >
        <div className="max-w-[2000px] mx-auto px-10 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

