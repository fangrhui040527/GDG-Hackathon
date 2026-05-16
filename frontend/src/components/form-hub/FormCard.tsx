"use client";

import Link from "next/link";
import { Copy, ExternalLink, BarChart2, Clock, CheckCircle2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FormCardProps {
  title: string;
  description: string;
  colorClass: string;
  iconBgClass: string;
  url: string;
  responseCount?: number;
  lastUpdated?: string;
  isActive?: boolean;
}

export default function FormCard({
  title,
  description,
  colorClass,
  iconBgClass,
  url,
  responseCount,
  lastUpdated,
  isActive = true,
}: FormCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fullUrl = typeof window !== "undefined"
      ? `${window.location.origin}${url}`
      : url;
    navigator.clipboard.writeText(fullUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col rounded-2xl border border-violet-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm transition-all hover:shadow-lg hover:ring-1 hover:ring-violet-200 dark:hover:ring-slate-600">
      <div className="mb-4 flex items-start justify-between">
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconBgClass}`}>
          <div className={`h-5 w-5 rounded-sm ${colorClass}`} />
        </div>
        {isActive ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-300">Inactive</span>
        )}
      </div>

      <h3 className="mb-1 font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>

      {/* Stats row */}
      <div className="mb-5 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
        {responseCount !== undefined && (
          <span className="flex items-center gap-1">
            <BarChart2 className="h-3.5 w-3.5 text-violet-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">{responseCount}</span> responses
          </span>
        )}
        {lastUpdated && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
            Updated {lastUpdated}
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700" asChild>
          <Link href={url}>
            <ExternalLink className="h-3.5 w-3.5" />
            Open Form
          </Link>
        </Button>
      </div>
    </div>
  );
}
