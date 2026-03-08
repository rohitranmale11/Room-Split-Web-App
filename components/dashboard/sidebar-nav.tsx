"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Scale,
  BarChart3,
  Bell,
  Settings,
  TrendingUp,
  PiggyBank,
  Repeat,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItem = {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const sidebarNavItems: SidebarItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Rooms",
    href: "/dashboard/rooms",
    icon: Users,
  },
  {
    title: "Expenses",
    href: "/dashboard/expenses",
    icon: CreditCard,
  },
  {
    title: "Balances",
    href: "/dashboard/balances",
    icon: Scale,
  },
  {
    title: "Members",
    href: "/dashboard/members",
    icon: Users,
  },
  {
    title: "Income",
    href: "/dashboard/income",
    icon: TrendingUp,
  },
  {
    title: "Budgets",
    href: "/dashboard/budgets",
    icon: PiggyBank,
  },
  {
    title: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: Repeat,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Activity",
    href: "/dashboard/activity",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function SidebarNav({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-1.5">
      {sidebarNavItems.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
          >
            <span
              className={cn(
                "group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                active && "bg-primary text-primary-foreground shadow-sm",
                collapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
              {!collapsed && <span>{item.title}</span>}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
