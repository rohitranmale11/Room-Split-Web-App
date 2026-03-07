"use client";

import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/dashboard/user-nav";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/70 px-4 backdrop-blur-md md:px-6">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative hidden max-w-xs flex-1 items-center md:flex">
          <Search className="pointer-events-none absolute left-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search rooms, expenses, or members"
            className="h-8 w-full rounded-full border-slate-200 bg-slate-50 pl-8 text-xs placeholder:text-slate-400"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1 top-1 inline-flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
          </span>
        </button>
        <ThemeToggle />
        <UserNav />
      </div>
    </header>
  );
}

