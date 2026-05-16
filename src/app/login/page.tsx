"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ShieldCheck, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"organizer" | "admin">("organizer");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/organizer/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f7f5ff]">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-gradient-to-br from-violet-950 via-violet-900 to-purple-900 p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">NexusAI</h1>
            <p className="mt-2 text-violet-300">Ecosystem Management Platform</p>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-violet-200">
            Streamline your innovation ecosystem with AI-powered matching, programme governance, and actor management.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-xs">
            <div className="rounded-xl bg-white/10 p-4 text-center ring-1 ring-white/10">
              <p className="text-2xl font-bold text-white">120+</p>
              <p className="text-xs text-violet-300 mt-1">Programmes</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 text-center ring-1 ring-white/10">
              <p className="text-2xl font-bold text-white">95%</p>
              <p className="text-xs text-violet-300 mt-1">Match Accuracy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-700">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">NexusAI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1 text-slate-500">Sign in to your portal to continue.</p>
          </div>

          <Card className="border-violet-100 bg-white shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Sign in</CardTitle>
              <CardDescription>Choose your portal role to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Role selector */}
                <div className="grid grid-cols-2 gap-2 rounded-xl bg-violet-50 p-1 border border-violet-100">
                  <button
                    type="button"
                    onClick={() => setRole("organizer")}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                      role === "organizer"
                        ? "bg-white text-violet-700 shadow-sm ring-1 ring-violet-200"
                        : "text-slate-500 hover:text-violet-700"
                    }`}
                  >
                    <Layers className="h-4 w-4" />
                    Organizer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                      role === "admin"
                        ? "bg-white text-violet-700 shadow-sm ring-1 ring-violet-200"
                        : "text-slate-500 hover:text-violet-700"
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Admin
                  </button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@organisation.com"
                    defaultValue={role === "admin" ? "admin@nexusai.io" : "organizer@nexusai.io"}
                    required
                    className="border-violet-200 focus:border-violet-400 focus:ring-violet-400/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      defaultValue="password"
                      required
                      className="border-violet-200 focus:border-violet-400 focus:ring-violet-400/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Link href="#" className="text-xs text-violet-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full" variant="navy">
                  Sign in as {role === "admin" ? "Admin" : "Organizer"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} NexusAI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
