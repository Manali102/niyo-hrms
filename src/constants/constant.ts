import { Home, Users, Leaf, Clock, DollarSign, Settings } from "lucide-react";

interface SidebarItemType {
  key: string;
  label: string;
  icon: React.ElementType; // store icon component reference
  href: string;
  allowedRoles?: string[];
}

export const SIDEBAR_CONTENT: SidebarItemType[] = [
  { key: "dashboard", label: "Dashboard", icon: Home, href: "/", allowedRoles: ["admin", "employee"] },
  { key: "employees", label: "Employees", icon: Users, href: "/employee", allowedRoles: ["admin"] },
  { key: "leaves", label: "Manage Leaves", icon: Leaf, href: "/leaves", allowedRoles: ["employee"] },
  { key: "attendance", label: "Attendance", icon: Clock, href: "/attendance", allowedRoles: ["admin", "employee"] },
  { key: "payroll", label: "Payroll", icon: DollarSign, href: "/payroll", allowedRoles: ["admin", "employee"] },
  { key: "settings", label: "Settings", icon: Settings, href: "/settings", allowedRoles: ["admin"] },
];