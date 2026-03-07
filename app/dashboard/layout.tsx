"use client";

import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { TopNav } from "@/components/dashboard/top-nav";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <TopNav />
      <div className="flex flex-1">
        <aside
          className="hidden border-r border-slate-200/80 bg-white/80 pt-4 md:block"
          style={{ width: collapsed ? 72 : 240 }}
        >
          <div className="flex h-10 items-center justify-between px-3">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-semibold text-white">
                  RS
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold tracking-tight text-slate-950">
                    RoomSplit
                  </span>
                  <span className="text-[10px] text-slate-500">Dashboard</span>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] text-slate-600 shadow-sm hover:bg-slate-50"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? "›" : "‹"}
            </button>
          </div>
          <div className="mt-4 px-2 pb-4">
            <SidebarNav collapsed={collapsed} />
          </div>
        </aside>
        <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-slate-50/60">
          <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
