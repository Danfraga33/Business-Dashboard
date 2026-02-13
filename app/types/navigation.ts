import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  children?: NavItem[];
  separatorBefore?: boolean;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}
