"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Mail, Lock, LogIn, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("We couldn’t log you in. Check your credentials and try again.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Something went wrong while logging you in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
              Log in to your roommate finance HQ.
            </h1>
            <p className="max-w-md text-sm text-slate-600">
              Access your rooms, expenses, and live balances in a single, shared dashboard designed
              for modern households.
            </p>
          </div>
          <div className="mt-10 space-y-3 text-xs text-slate-500">
            <p>Secure authentication powered by NextAuth and Google OAuth.</p>
            <p>RoomSplit never shares your data with your roommates without your consent.</p>
          </div>
        </div>

        {/* Auth card */}
        <div className="flex w-full flex-1 justify-center">
          <Card className="w-full max-w-md border-slate-200/90 shadow-lg shadow-slate-900/5">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl font-semibold tracking-tight">
                <LogIn className="h-5 w-5 text-blue-600" />
                Login
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Use your email and password or sign in with Google to access your dashboard.
              </CardDescription>
              {registered && (
                <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                  Your account has been created. You can now log in.
                </div>
              )}
              {error && (
                <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                  {error}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
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
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                    />
                    <Lock className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                </div>
                <Button type="submit" className="mt-2 w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging you in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </form>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase">
                  <span className="bg-card px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                type="button"
                className="w-full border-slate-200"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                <span className="flex items-center justify-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.6 20.5H42V20H24v8h11.3C34.7 31.9 30.1 35 24 35 16.8 35 11 29.2 11 22S16.8 9 24 9c3.3 0 6.3 1.2 8.6 3.3l5.7-5.7C34.6 3.3 29.6 1 24 1 11.8 1 2 10.8 2 23s9.8 22 22 22 22-9.8 22-22c0-1.5-.2-3-.4-4.5z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.3 14.7l6.6 4.8C14.3 15.3 18.8 13 24 13c3.3 0 6.3 1.2 8.6 3.3l5.7-5.7C34.6 7.3 29.6 5 24 5 16 5 9.1 9.3 6.3 14.7z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 41c6 0 11-2 14.7-5.4l-6.8-5.6C29.7 31.3 27.1 32 24 32c-6 0-10.6-4.1-12.3-9.6l-6.6 5C7.8 35.7 15.1 41 24 41z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.8-4.4 6.6-8.3 7.6l6.8 5.6C38.3 38.2 42 31.5 42 23c0-1.5-.2-3-.4-4.5z"
                    />
                  </svg>
                  Continue with Google
                </span>
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:flex-row">
              <div>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-medium text-blue-600 hover:underline">
                  Sign up
                </Link>
              </div>
              <Link href="/" className="flex items-center gap-1 hover:text-slate-700">
                <span>Back to site</span>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
