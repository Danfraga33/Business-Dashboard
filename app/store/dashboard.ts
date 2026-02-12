import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DashboardState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
  expandedSections: string[];
  toggleSidebar: () => void;
  toggleTheme: () => void;
  toggleSection: (section: string) => void;
  isSectionExpanded: (section: string) => boolean;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      theme: "light",
      expandedSections: ["data", "marketing", "operations"],

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      toggleSection: (section: string) =>
        set((state) => ({
          expandedSections: state.expandedSections.includes(section)
            ? state.expandedSections.filter((s) => s !== section)
            : [...state.expandedSections, section],
        })),

      isSectionExpanded: (section: string) =>
        get().expandedSections.includes(section),
    }),
    {
      name: "dashboard-storage",
    }
  )
);
