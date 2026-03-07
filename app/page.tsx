import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <span className="inline-block font-bold text-xl tracking-tight">RoomSplit</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              <Link href="#features" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Features
              </Link>
              <Link href="#pricing" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Login
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-16 md:pb-12 md:pt-24 lg:py-32">
          <div className="container mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center px-4">
            <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Manage shared expenses <br/>
              <span className="text-blue-600">without the drama.</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              RoomSplit makes it easy for roommates to track rent, split bills, and manage shared household expenses. Transparent, fair, and totally stress-free.
            </p>
            <div className="space-x-4 mt-6">
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8">Get Started</Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg" className="h-12 px-8">How it works</Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="container mx-auto space-y-6 bg-slate-50 py-16 dark:bg-transparent md:py-24 lg:py-32 px-4 rounded-3xl">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-5xl font-bold">Features designed for roommates</h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to manage your household finances efficiently.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 mt-12">
            {[
              { title: "Shared Rooms", desc: "Create a room and invite your flatmates via a simple invite code." },
              { title: "Expense Tracking", desc: "Log electricity, internet, and grocery bills to see who paid what." },
              { title: "Automated Balances", desc: "Instantly know who owes who, minimizing awkward conversations." }
            ].map((feature, i) => (
              <div key={i} className="relative overflow-hidden rounded-lg border bg-background p-2 text-left">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <div className="space-y-2">
                    <h3 className="font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for roommates. The ultimate shared expense manager.
          </p>
        </div>
      </footer>
    </div>
  );
}
