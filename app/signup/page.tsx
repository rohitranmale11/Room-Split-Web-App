"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Mail, Lock, UserPlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!name || !email || !password) {
      setError("Please fill in all the fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "We couldn’t create your account. Please try again.");
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div className="mx-auto flex w-full max-w-5xl items-center px-4 py-10 md:py-16">
        {/* Left panel */}
        <div className="hidden flex-1 flex-col justify-between pr-10 md:flex">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
                RS
              </div>
              <span className="text-base font-semibold tracking-tight text-slate-950">
                RoomSplit
              </span>
            </Link>
          </div>
          <div className="mt-16 space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Create a shared finance HQ for your home.
            </h1>
            <p className="max-w-md text-sm text-slate-600">
              Set up rooms, invite flatmates, and start tracking shared expenses with an interface
              that feels like a modern SaaS dashboard.
            </p>
          </div>
          <div className="mt-10 space-y-3 text-xs text-slate-500">
            <p>Use your email to create an account. You can connect Google later.</p>
            <p>No credit card required. Get started in minutes.</p>
          </div>
        </div>

        {/* Auth card */}
        <div className="flex w-full flex-1 justify-center">
          <Card className="w-full max-w-md border-slate-200/90 shadow-lg shadow-slate-900/5">
        <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                <UserPlus2 className="h-5 w-5 text-blue-600" />
                Create your RoomSplit account
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                We&apos;ll use this information to set up your workspace and profile.
              </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                    {error}
                  </div>
                )}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                  <Mail className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                  <Lock className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating your account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
              <div className="flex w-full flex-col items-center justify-between gap-3 text-xs text-slate-500 sm:flex-row">
                <div>
                  Already have an account?{" "}
                  <Link href="/login" className="font-medium text-blue-600 hover:underline">
                    Log in
                  </Link>
                </div>
                <Link href="/" className="flex items-center gap-1 hover:text-slate-700">
                  <span>Back to site</span>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
