"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { TopNav } from "@/components/dashboard/top-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNav onMenuClick={() => setMobileOpen(true)} />
      <div className="flex flex-1">
        {/* Mobile overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
        {/* Sidebar - mobile drawer + desktop */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background pt-4 transition-transform md:relative md:block md:translate-x-0 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ width: collapsed ? 72 : undefined }}
        >
          <div className="flex h-10 items-center justify-between px-3">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                  RS
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold tracking-tight text-foreground">RoomSplit</span>
                  <span className="text-xs text-muted-foreground">Dashboard</span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-full border border-input bg-background text-muted-foreground shadow-sm hover:bg-accent"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? "›" : "‹"}
            </button>
          </div>
          <div className="mt-4 overflow-y-auto px-2 pb-4">
            <SidebarNav collapsed={collapsed} onNavigate={() => setMobileOpen(false)} />
          </div>
        </aside>
        <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-x-hidden bg-muted/30">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
