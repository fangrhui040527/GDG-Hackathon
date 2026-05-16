"use client";

import { useState } from "react";
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
  User,
  Zap,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SignupRole = "organizer" | "admin";

const roleContent: Record<
  SignupRole,
  {
    label: string;
    portal: string;
    insight: string;
    icon: LucideIcon;
    placeholder: string;
  }
> = {
  organizer: {
    label: "Organizer",
    portal: "Programme workspace",
    insight: "Build, submit, and track ecosystem programmes.",
    icon: Layers,
    placeholder: "you@organisation.com",
  },
  admin: {
    label: "Admin",
    portal: "Command centre",
    insight: "Review submissions and publish high-confidence matches.",
    icon: ShieldCheck,
    placeholder: "you@company.com",
  },
};

const STRENGTH_BARS = ["bg-slate-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "text-red-500", "text-orange-500", "text-yellow-500", "text-emerald-500"];

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<SignupRole>("organizer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRole = roleContent[role];
  const SelectedRoleIcon = selectedRole.icon;
  const strength = Math.min(Math.floor(password.length / 3), 4);

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setIsLoading(true);
    setTimeout(() => {
      router.push(role === "admin" ? "/admin/dashboard" : "/organizer/dashboard");
    }, 700);
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create account</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Choose your role and get started.
          </p>
        </div>

        {/* Role switcher */}
        <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1">
          {(Object.keys(roleContent) as SignupRole[]).map((key) => {
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
        <form onSubmit={handleSignup} className="space-y-4">

          {/* Full name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Full name
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-violet-500 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          {/* Email */}
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
                placeholder={selectedRole.placeholder}
                required
                className="h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-violet-500 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Password
            </Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
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
            {password && (
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((lvl) => (
                    <div
                      key={lvl}
                      className={cn(
                        "h-1.5 flex-1 rounded-full transition-all duration-300",
                        lvl <= strength ? STRENGTH_BARS[strength] : "bg-slate-100 dark:bg-slate-700"
                      )}
                    />
                  ))}
                </div>
                <p className={cn("text-xs font-medium", STRENGTH_COLORS[strength])}>
                  {STRENGTH_LABELS[strength]}
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Confirm password
            </Label>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                required
                className={cn(
                  "h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-11 text-slate-900 dark:text-white placeholder:text-slate-400 focus-visible:ring-violet-500 focus-visible:ring-offset-0",
                  passwordsMismatch && "border-red-300 focus-visible:ring-red-400",
                  passwordsMatch && "border-emerald-300 focus-visible:ring-emerald-400"
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute right-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {passwordsMatch && (
              <p className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                <Check className="h-3 w-3" /> Passwords match
              </p>
            )}
            {passwordsMismatch && (
              <p className="text-xs text-red-500">Passwords do not match</p>
            )}
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-2.5 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-11 w-full rounded-xl bg-violet-600 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign up as {selectedRole.label}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-violet-600 dark:text-violet-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
