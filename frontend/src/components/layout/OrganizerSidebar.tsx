"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  Send,
  FileText,
  LogOut,
  Zap,
  Sun,
  Moon,
  HelpCircle,
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
  const [isDark, setIsDark] = useState(false);

  // Sidebar-only colours — does NOT touch document or localStorage
  const bg       = isDark ? "bg-gray-900"   : "bg-gray-100";
  const active   = isDark ? "bg-white text-gray-900 shadow-md"
                          : "bg-gray-900 text-white shadow-md";
  const inactive = isDark ? "text-gray-400 hover:bg-gray-700 hover:text-white"
                          : "text-gray-500 hover:bg-gray-200 hover:text-gray-800";
  const divider  = isDark ? "bg-gray-700"   : "bg-gray-300";
  const logoBox  = isDark ? "bg-white"       : "bg-gray-900";
  const logoIcon = isDark ? "text-gray-900"  : "text-white";
  const label    = isDark ? "text-gray-200"  : "text-gray-700";

  const themeActive   = isDark ? "bg-gray-700 text-white"
                               : "bg-white text-gray-900 shadow-sm";
  const themeInactive = isDark ? "text-gray-400 hover:bg-gray-700 hover:text-white"
                               : "text-gray-400 hover:bg-gray-200 hover:text-gray-700";

  // Shared classes
  const row  = "flex h-10 w-full items-center gap-3 rounded-xl transition-all duration-150";
  const iconWrap = "flex h-10 w-10 shrink-0 items-center justify-center";
  const txt  = "whitespace-nowrap text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-100";

  return (
    <aside
      className={cn(
        "group fixed inset-y-0 left-0 z-40 flex w-16 hover:w-56 flex-col overflow-hidden py-3 transition-[width] duration-200 ease-in-out",
        bg
      )}
    >
      {/* Logo */}
      <div className="flex h-10 w-full shrink-0 items-center gap-3 px-3 mb-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", logoBox)}>
          <Zap className={cn("h-5 w-5", logoIcon)} />
        </div>
        <span className={cn(txt, label, "text-sm font-bold")}>NexusAI</span>
      </div>

      {/* Theme toggles */}
      <div className="flex w-full flex-col gap-0.5 px-3">
        <button
          onClick={() => setIsDark(false)}
          title="Light mode"
          className={cn(row, !isDark ? themeActive : themeInactive)}
        >
          <span className={iconWrap}><Sun className="h-[18px] w-[18px]" /></span>
          <span className={cn(txt, label)}>Light</span>
        </button>
        <button
          onClick={() => setIsDark(true)}
          title="Dark mode"
          className={cn(row, isDark ? themeActive : themeInactive)}
        >
          <span className={iconWrap}><Moon className="h-[18px] w-[18px]" /></span>
          <span className={cn(txt, label)}>Dark</span>
        </button>
      </div>

      <div className={cn("my-3 mx-3 h-px shrink-0", divider)} />

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3">
        {navItems.map(({ href, label: itemLabel, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={itemLabel}
              className={cn(row, isActive ? active : inactive)}
            >
              <span className={iconWrap}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className={cn(txt, isActive ? "" : label)}>{itemLabel}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-0.5 px-3 shrink-0">
        <div className={cn("mb-1 h-px", divider)} />
        <Link href="/profile" title="Help" className={cn(row, inactive)}>
          <span className={iconWrap}><HelpCircle className="h-[18px] w-[18px]" /></span>
          <span className={cn(txt, label)}>Help</span>
        </Link>
        <Link href="/login" title="Logout" className={cn(row, inactive)}>
          <span className={iconWrap}><LogOut className="h-[18px] w-[18px]" /></span>
          <span className={cn(txt, label)}>Logout</span>
        </Link>
      </div>
    </aside>
  );
}


