"use client";

import Link from "next/link";
import { Bell, Menu } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/dashboard/user-nav";
import { SearchPopover } from "@/components/dashboard/search-popover";

export function TopNav({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex flex-1 items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-foreground"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <SearchPopover />
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/activity"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
          aria-label="Activity"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          </span>
        </Link>
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}

