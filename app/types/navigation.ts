import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  children?: NavItem[];
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}
