import { create } from "zustand";

interface DashboardState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  toggleTheme: () => void;
  initFromStorage: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  sidebarCollapsed: false,
  theme: "light",

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    set({ sidebarCollapsed: next });
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", String(next));
    }
  },

  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    set({ theme: next });
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboard-theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
    }
  },

  initFromStorage: () => {
    if (typeof window === "undefined") return;
    const theme =
      (localStorage.getItem("dashboard-theme") as "light" | "dark") || "light";
    const collapsed = localStorage.getItem("sidebar-collapsed") === "true";
    set({ theme, sidebarCollapsed: collapsed });
    document.documentElement.classList.toggle("dark", theme === "dark");
  },
}));
