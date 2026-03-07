"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Settings, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
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
    title: "Profile",
    href: "/dashboard/profile",
    icon: UserCircle,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2">
      {sidebarNavItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Link
            key={index}
            href={item.href}
          >
            <span
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-accent" : "transparent"
              )}
            >
              <Icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
