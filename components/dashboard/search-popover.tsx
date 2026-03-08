"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { globalSearch } from "@/app/actions/search";

export function SearchPopover() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof globalSearch>> | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const r = await globalSearch(q);
      setResults(r);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const t = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(t);
  }, [query, runSearch]);

  const hasResults =
    results &&
    (results.expenses.length > 0 || results.rooms.length > 0 || results.members.length > 0);

  return (
    <div className="relative hidden max-w-xs flex-1 md:block">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder="Search expenses, rooms, members"
        className="h-10 w-full rounded-full border-input bg-muted pl-9 pr-4 text-base placeholder:text-muted-foreground"
      />
      {open && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-lg border border-border bg-card shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching…</div>
          ) : hasResults ? (
            <div className="max-h-80 overflow-y-auto p-2">
              {results.rooms.length > 0 && (
                <div className="mb-2">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Rooms</p>
                  {results.rooms.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => router.push(`/dashboard/rooms/${r.id}`)}
                      className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                    >
                      {r.roomName}
                    </button>
                  ))}
                </div>
              )}
              {results.expenses.length > 0 && (
                <div className="mb-2">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Expenses</p>
                  {results.expenses.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => router.push(`/dashboard/rooms/${e.roomId}`)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                    >
                      <span className="truncate">{e.title}</span>
                      <span className="ml-2 shrink-0 font-medium">${e.amount.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              )}
              {results.members.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Members</p>
                  {results.members.map((m) => (
                    <button
                      key={`${m.roomId}-${m.id}`}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => router.push(`/dashboard/rooms/${m.roomId}`)}
                      className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-accent"
                    >
                      {m.name ?? m.id} · {m.roomName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">No results</div>
          )}
        </div>
      )}
    </div>
  );
}
