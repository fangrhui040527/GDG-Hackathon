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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-gradient-to-b from-violet-950 via-violet-900 to-purple-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">NexusAI</p>
          <p className="text-[10px] font-medium text-violet-300 uppercase tracking-wider">Organizer Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-violet-400">
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
                  ? "bg-white/15 text-white shadow-sm ring-1 ring-white/10"
                  : "text-violet-200 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-violet-200" : "text-violet-400")} />
              {label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-4 space-y-0.5">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-violet-200 hover:bg-white/10 hover:text-white transition-all"
        >
          <User className="h-4 w-4 text-violet-400" />
          Profile
        </Link>
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-violet-200 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4 text-violet-400" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
