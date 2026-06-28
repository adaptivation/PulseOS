import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarDays,
  Wallet,
  BarChart3,
  FolderTree,
  Calendar,
  UserCog,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  shortcut?: string;
  group: "core" | "operations" | "workspace";
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard, shortcut: "G D", group: "core" },
  { label: "CRM", to: "/crm", icon: Users, shortcut: "G C", group: "operations" },
  { label: "Projects", to: "/projects", icon: Briefcase, shortcut: "G P", group: "operations" },
  { label: "Events", to: "/events", icon: CalendarDays, shortcut: "G E", group: "operations" },
  { label: "Finance", to: "/finance", icon: Wallet, shortcut: "G F", group: "operations" },
  { label: "Analytics", to: "/analytics", icon: BarChart3, shortcut: "G A", group: "operations" },
  { label: "Files", to: "/files", icon: FolderTree, group: "workspace" },
  { label: "Calendar", to: "/calendar", icon: Calendar, group: "workspace" },
  { label: "Employees", to: "/employees", icon: UserCog, group: "workspace" },
  { label: "Settings", to: "/settings", icon: Settings, group: "workspace" },
];

export const NAV_GROUPS: { id: NavItem["group"]; label: string }[] = [
  { id: "core", label: "Overview" },
  { id: "operations", label: "Operations" },
  { id: "workspace", label: "Workspace" },
];