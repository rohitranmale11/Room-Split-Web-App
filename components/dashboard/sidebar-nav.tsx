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
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Notifications",
    href: "/dashboard/notifications",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function SidebarNav({ collapsed = false }: { collapsed?: boolean }) {
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
          >
            <span
              className={cn(
                "group flex items-center rounded-xl px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
                active && "bg-slate-900 text-slate-50 shadow-sm shadow-slate-900/5",
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
