"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  CheckSquare,
  Globe,
  Network,
  BarChart3,
  LogOut,
  Zap,
  Sun,
  Moon,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/admin/submissions",   label: "Submissions",   icon: FileText },
  { href: "/admin/match-review",  label: "Match Review",  icon: CheckSquare },
  { href: "/admin/published",     label: "Published",     icon: Globe },
  { href: "/admin/manage-actors", label: "Manage Actors", icon: Users },
  { href: "/admin/relationships", label: "Relationships", icon: Network },
  { href: "/admin/form-hub",      label: "Form Hub",      icon: FileText },
  { href: "/admin/reports",       label: "Reports",       icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  // Sync with saved preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = saved === "dark" || (!saved && prefersDark);
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleTheme = (dark: boolean) => {
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  };

  const bg            = isDark ? "bg-gray-900"  : "bg-gray-100";
  const active        = isDark ? "bg-white text-gray-900 shadow-md" : "bg-gray-900 text-white shadow-md";
  const inactive      = isDark ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-500 hover:bg-gray-200 hover:text-gray-800";
  const divider       = isDark ? "bg-gray-700"  : "bg-gray-300";
  const logoBox       = isDark ? "bg-white"     : "bg-gray-900";
  const logoIconColor = isDark ? "text-gray-900": "text-white";
  const labelColor    = isDark ? "text-gray-200": "text-gray-700";
  const themeActive   = isDark ? "bg-gray-700 text-white" : "bg-white text-gray-900 shadow-sm";
  const themeInactive = isDark ? "text-gray-400 hover:bg-gray-700 hover:text-white" : "text-gray-400 hover:bg-gray-200 hover:text-gray-700";

  const row      = "flex h-10 w-full items-center gap-3 rounded-xl transition-all duration-150";
  const iconWrap = "flex h-10 w-10 shrink-0 items-center justify-center";
  const fadeIn   = "whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-100";

  return (
    <aside className={cn("group fixed inset-y-0 left-0 z-40 flex w-16 hover:w-56 flex-col overflow-hidden py-3 transition-[width] duration-200 ease-in-out", bg)}>

      {/* Logo */}
      <div className="flex h-10 w-full shrink-0 items-center gap-3 px-3 mb-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", logoBox)}>
          <Zap className={cn("h-5 w-5", logoIconColor)} />
        </div>
        <span className={cn(fadeIn, labelColor, "font-bold")}>NexusAI</span>
      </div>

      {/* Theme toggles */}
      <div className="flex w-full flex-col gap-0.5 px-3">
        <button onClick={() => toggleTheme(false)} title="Light mode" className={cn(row, !isDark ? themeActive : themeInactive)}>
          <span className={iconWrap}><Sun className="h-[18px] w-[18px]" /></span>
          <span className={cn(fadeIn, labelColor)}>Light</span>
        </button>
        <button onClick={() => toggleTheme(true)} title="Dark mode" className={cn(row, isDark ? themeActive : themeInactive)}>
          <span className={iconWrap}><Moon className="h-[18px] w-[18px]" /></span>
          <span className={cn(fadeIn, labelColor)}>Dark</span>
        </button>
      </div>

      <div className={cn("my-3 mx-3 h-px shrink-0", divider)} />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} title={label} className={cn(row, isActive ? active : inactive)}>
              <span className={iconWrap}><Icon className="h-[18px] w-[18px]" /></span>
              <span className={cn(fadeIn, isActive ? "" : labelColor)}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-0.5 px-3 shrink-0">
        <div className={cn("mb-1 h-px", divider)} />
        <Link href="/profile" title="Profile" className={cn(row, inactive)}>
          <span className={iconWrap}><UserCircle className="h-[18px] w-[18px]" /></span>
          <span className={cn(fadeIn, labelColor)}>Profile</span>
        </Link>
        <Link href="/login" title="Logout" className={cn(row, inactive)}>
          <span className={iconWrap}><LogOut className="h-[18px] w-[18px]" /></span>
          <span className={cn(fadeIn, labelColor)}>Logout</span>
        </Link>
      </div>
    </aside>
  );
}
