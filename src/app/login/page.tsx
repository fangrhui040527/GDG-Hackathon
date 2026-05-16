"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ShieldCheck, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"organizer" | "admin">("organizer");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push(role === "admin" ? "/admin/dashboard" : "/organizer/dashboard");
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-8">
      <div className="w-full max-w-[420px]">

          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-900">NexusAI</span>
              <p className="text-[11px] text-slate-400 uppercase tracking-widest leading-none">Ecosystem Management</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">Sign in to your portal and pick up where you left off.</p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-violet-100 bg-white p-8 shadow-xl shadow-violet-100/50">

            {/* Role toggle */}
            <div className="mb-6 grid grid-cols-2 gap-1.5 rounded-xl bg-violet-50 p-1 border border-violet-100">
              {(["organizer", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${
                    role === r
                      ? "bg-white text-violet-700 shadow-sm ring-1 ring-violet-200"
                      : "text-slate-400 hover:text-violet-600"
                  }`}
                >
                  {r === "organizer" ? <Layers className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@organisation.com"
                  defaultValue={role === "admin" ? "admin@nexusai.io" : "organizer@nexusai.io"}
                  required
                  suppressHydrationWarning
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 transition-all"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <Link href="#" className="text-xs text-violet-600 hover:text-violet-800 hover:underline transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    defaultValue="password"
                    required
                    suppressHydrationWarning
                    className="h-11 rounded-xl border-slate-200 bg-slate-50 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-400/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="navy"
                disabled={isLoading}
                className="h-11 w-full rounded-xl text-sm font-semibold"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  `Sign in as ${role === "admin" ? "Admin" : "Organizer"}`
                )}
              </Button>
            </form>

            {/* Divider hint */}
            <p className="mt-5 text-center text-xs text-slate-400">
              Demo credentials are pre-filled — just click sign in.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400" suppressHydrationWarning>
            © {new Date().getFullYear()} NexusAI · All rights reserved.
          </p>
        </div>
    </div>
  );
}
