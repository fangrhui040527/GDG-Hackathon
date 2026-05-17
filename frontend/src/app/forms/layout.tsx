"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function FormsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleClose = () => {
    // If opened as a new tab (no history before this page), close the tab
    if (typeof window !== "undefined" && window.history.length <= 1) {
      window.close();
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Minimal top bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600">
            <span className="text-xs font-bold text-white">Y</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">YokoYoko AI</span>
          <span className="text-slate-300 dark:text-slate-600 text-sm">•</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">Ecosystem Registration</span>
          <div className="ml-auto">
            <button
              onClick={handleClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">{children}</main>
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} YokoYoko AI Ecosystem Management Platform
      </footer>
    </div>
  );
}
