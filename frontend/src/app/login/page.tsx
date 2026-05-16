"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Layers,
  type LucideIcon,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type LoginRole = "organizer" | "admin";

const roleContent: Record<
  LoginRole,
  {
    label: string;
    email: string;
    portal: string;
    insight: string;
    icon: LucideIcon;
  }
> = {
  organizer: {
    label: "Organizer",
    email: "organizer@nexusai.io",
    portal: "Programme workspace",
    insight: "Build, submit, and track ecosystem programmes.",
    icon: Layers,
  },
  admin: {
    label: "Admin",
    email: "admin@nexusai.io",
    portal: "Command centre",
    insight: "Review submissions and publish high-confidence matches.",
    icon: ShieldCheck,
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<LoginRole>("organizer");
  const [email, setEmail] = useState(roleContent.organizer.email);
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);

  const selectedRole = roleContent[role];
  const SelectedRoleIcon = selectedRole.icon;

  useEffect(() => {
    setEmail(roleContent[role].email);
  }, [role]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push(role === "admin" ? "/admin/dashboard" : "/organizer/dashboard");
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-500/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">NexusAI</span>
        </div>

        <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              Choose your role and sign in to continue.
            </p>
          </div>

          {/* Role switcher */}
          <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1">
            {(Object.keys(roleContent) as LoginRole[]).map((key) => {
              const item = roleContent[key];
              const Icon = item.icon;
              const isActive = role === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setRole(key)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all",
                    isActive
                      ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Role info */}
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-violet-100 dark:border-violet-900/40 bg-violet-50 dark:bg-violet-950/30 px-4 py-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300">
              <SelectedRoleIcon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{selectedRole.portal}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{selectedRole.insight}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@organisation.com"
                  required
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-violet-500 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </Label>
                <Link href="#" className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-11 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-violet-500 focus-visible:ring-offset-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-2 h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in as {selectedRole.label}
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-violet-600 dark:text-violet-400 hover:underline">
              Sign up
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
            Demo credentials are pre-filled. Choose a role and sign in.
          </p>
      </div>
    </div>
  );
}
