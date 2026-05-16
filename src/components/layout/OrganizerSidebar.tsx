"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  Send,
  FileText,
  User,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/organizer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organizer/create-programme", label: "Create Programme", icon: PlusCircle },
  { href: "/organizer/my-programmes", label: "My Programmes", icon: FolderOpen },
  { href: "/organizer/submitted", label: "Submitted to Admin", icon: Send },
  { href: "/organizer/form-hub", label: "Form Hub", icon: FileText },
];

export default function OrganizerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">NexusAI</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Organizer Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Programmes
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-blue-700 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-4 space-y-0.5">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
        >
          <User className="h-4 w-4 text-slate-400" />
          Profile
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4 text-slate-400" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
