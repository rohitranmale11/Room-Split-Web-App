import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Wallet, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white text-sm font-semibold">
                RS
              </div>
              <span className="text-lg font-semibold tracking-tight">RoomSplit</span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
              <Link href="#features" className="hover:text-slate-900">
                Features
              </Link>
              <Link href="#how-it-works" className="hover:text-slate-900">
                How it works
              </Link>
              <Link href="#pricing" className="hover:text-slate-900">
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-600 hover:text-slate-900 md:inline-block"
            >
              Login
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full px-5">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-slate-200/80">
          <div className="container grid gap-12 py-14 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:py-20 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                <Sparkles className="h-3 w-3 text-blue-500" />
                Enterprise-grade roommate expense management
              </div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl md:text-5xl lg:text-6xl">
                Split rent and expenses
                <span className="block text-blue-600">like a modern finance team.</span>
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                RoomSplit turns messy shared bills into a clean, auditable ledger. Track rooms,
                expenses, and balances in one collaborative dashboard built for real-world
                apartment life.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/signup">
                  <Button size="lg" className="rounded-full px-7">
                    Get started for free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900"
                >
                  See how it works
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Built for shared households
                </div>
              </div>
            </div>

            {/* Product preview */}
            <div className="relative">
              <div className="absolute inset-x-6 -top-8 -z-10 h-40 rounded-3xl bg-gradient-to-tr from-blue-500/15 via-sky-400/10 to-indigo-500/20 blur-3xl" />
              <Card className="overflow-hidden border-slate-200/80 bg-white/90 shadow-xl shadow-slate-900/5">
                <CardHeader className="border-b border-slate-200/70 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-900">
                      RoomSplit overview
                    </CardTitle>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                      Live balances
                    </span>
                  </div>
                  <CardDescription className="text-xs">
                    Real-time view of rooms, expenses, and who owes who.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Total expenses", value: "$2,430.00" },
                      { label: "Pending balances", value: "$320.00" },
                      { label: "Rooms active", value: "3" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3"
                      >
                        <p className="text-[11px] font-medium text-slate-500">{stat.label}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-900">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>Recent activity</span>
                      <span>Last 24 hours</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between rounded-lg bg-white/80 px-2 py-2">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-3.5 w-3.5 text-blue-500" />
                          <span className="font-medium text-slate-800">Groceries - Pune Flat</span>
                        </div>
                        <span className="font-semibold text-slate-900">+$120.00</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-white/60 px-2 py-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-slate-700">New member joined “Bangalore PG”</span>
                        </div>
                        <span className="text-slate-500">2 min ago</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-b border-slate-200/80 bg-slate-50/60 py-14 md:py-20"
        >
          <div className="container space-y-10">
            <div className="space-y-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                FEATURES
              </p>
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Everything you need to run a calm household finance stack.
              </h2>
              <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
                From rent to pizza nights, RoomSplit keeps every shared payment transparent, fair,
                and searchable.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  icon: Wallet,
                  title: "Unified expense ledger",
                  desc: "Track every bill, payment, and transfer in one clean ledger per room.",
                },
                {
                  icon: Users,
                  title: "Room-centric organization",
                  desc: "Group expenses by flat, PG, or house with dedicated room workspaces.",
                },
                {
                  icon: ShieldCheck,
                  title: "Accurate balances",
                  desc: "Automatic per-member balances so you always know who owes who.",
                },
              ].map((feature) => (
                <Card
                  key={feature.title}
                  className="border-slate-200/80 bg-white shadow-sm shadow-slate-900/5"
                >
                  <CardHeader className="flex flex-row items-start gap-3 pb-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <feature.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-slate-900">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs text-slate-600">
                        {feature.desc}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="border-b border-slate-200/80 bg-white py-14 md:py-20"
        >
          <div className="container space-y-10">
            <div className="space-y-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                HOW IT WORKS
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                From invite link to settled up in minutes.
              </h2>
              <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
                RoomSplit mirrors the way you already live together, but with financial-grade
                clarity.
              </p>
            </div>
            <ol className="grid gap-5 md:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Create a room",
                  desc: "Spin up a workspace for each flat or house you share.",
                },
                {
                  step: "02",
                  title: "Invite roommates",
                  desc: "Share a secure invite code instead of managing email lists.",
                },
                {
                  step: "03",
                  title: "Add expenses",
                  desc: "Log rent, utilities, groceries, and more in a few taps.",
                },
                {
                  step: "04",
                  title: "Automatic split",
                  desc: "RoomSplit calculates who owes who and keeps balances up to date.",
                },
              ].map((item) => (
                <li
                  key={item.step}
                  className="relative flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                    {item.step}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-b border-slate-200/80 bg-slate-50 py-14 md:py-20">
          <div className="container space-y-10">
            <div className="space-y-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                PRICING
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Simple, roommate-friendly pricing.
              </h2>
              <p className="mx-auto max-w-2xl text-sm text-slate-600 sm:text-base">
                Start free and upgrade only when your household needs more analytics and history.
              </p>
            </div>
            <div className="mx-auto max-w-lg">
              <Card className="border-slate-200/80 bg-white shadow-md shadow-slate-900/5">
                <CardHeader className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                    FREE
                  </p>
                  <CardTitle className="text-lg font-semibold text-slate-950">
                    RoomSplit Starter
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Perfect for small flats and PGs getting started with shared expense tracking.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-slate-950">$0</span>
                    <span className="text-xs text-slate-500">per month</span>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-700">
                    {[
                      "Up to 3 active rooms",
                      "Unlimited expenses and members",
                      "Automatic balance calculations",
                      "Secure Google or email login",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button className="w-full rounded-full" size="sm">
                      Create your first room
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-white py-12 md:py-16">
          <div className="container">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-10 text-slate-50 md:px-10 md:py-12">
              <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-blue-500/40 to-transparent blur-3xl" />
              <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                    Bring clarity to your shared bills.
                  </h2>
                  <p className="max-w-xl text-sm text-slate-200">
                    Join roommates who treat their flat like a small business. One dashboard for
                    rooms, expenses, and balances.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="rounded-full bg-white text-slate-900 hover:bg-slate-100"
                    >
                      Get started in 2 minutes
                    </Button>
                  </Link>
                  <Link
                    href="/login"
                    className="text-xs font-medium text-slate-100 underline-offset-4 hover:underline"
                  >
                    Already have an account? Log in
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6">
        <div className="container flex flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} RoomSplit. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#features" className="hover:text-slate-700">
              Features
            </Link>
            <Link href="#pricing" className="hover:text-slate-700">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
