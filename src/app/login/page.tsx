"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap, Eye, EyeOff, ShieldCheck, Layers,
  Sparkles, Users, TrendingUp, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FEATURES = [
  { icon: Sparkles, text: "AI-powered actor matching" },
  { icon: Users, text: "Multi-actor ecosystem management" },
  { icon: TrendingUp, text: "Real-time programme analytics" },
  { icon: CheckCircle2, text: "Streamlined admin governance" },
];

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
    <div className="flex min-h-screen">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800 p-14 relative overflow-hidden">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-pink-500/20 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400/10 blur-2xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white tracking-tight">Organizer</span>
            <p className="text-[10px] text-violet-200 uppercase tracking-widest leading-none mt-0.5">Ecosystem Management</p>
          </div>
        </div>

        {/* Centre content */}
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <h2 className="text-4xl font-extrabold leading-tight text-white">
              Power your<br />
              <span className="bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
                innovation ecosystem
              </span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-violet-200/80">
              Connect the right companies, mentors, and partners — powered by AI-driven matching and seamless programme governance.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-3.5 w-3.5 text-violet-200" />
                </div>
                <span className="text-sm text-violet-100">{text}</span>
              </li>
            ))}
          </ul>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "120+", label: "Programmes" },
              { value: "2.4k", label: "Actors" },
              { value: "95%", label: "Match Rate" },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-2xl bg-white/8 p-4 text-center ring-1 ring-white/10 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="mt-0.5 text-xs text-violet-300">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <blockquote className="border-l-2 border-violet-400/50 pl-4">
            <p className="text-sm italic text-violet-200/70">
              &ldquo;NexusAI cut our matching time by 60% and surfaced connections we never would have found manually.&rdquo;
            </p>
            <footer className="mt-2 text-xs text-violet-400">— Programme Lead, Global Fintech Accelerator</footer>
          </blockquote>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 items-center justify-center bg-[#fafafa] p-8">
        <div className="w-full max-w-[420px]">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">NexusAI</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
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
    </div>
  );
}
