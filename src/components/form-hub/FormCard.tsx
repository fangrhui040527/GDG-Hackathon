"use client";

import { Copy, ExternalLink, BarChart2, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const handleCopy = () => {
    navigator.clipboard.writeText(url).catch(() => {});
  };

  return (
    <div className="flex flex-col rounded-2xl border border-violet-100 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:ring-1 hover:ring-violet-200">
      <div className="mb-4 flex items-start justify-between">
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${iconBgClass}`}>
          <div className={`h-5 w-5 rounded-sm ${colorClass}`} />
        </div>
        {isActive ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">Inactive</span>
        )}
      </div>

      <h3 className="mb-1 font-bold text-slate-900">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-slate-500">{description}</p>

      {/* Stats row */}
      <div className="mb-5 flex items-center gap-4 text-xs text-slate-400">
        {responseCount !== undefined && (
          <span className="flex items-center gap-1">
            <BarChart2 className="h-3.5 w-3.5 text-violet-400" />
            <span className="font-semibold text-slate-700">{responseCount}</span> responses
          </span>
        )}
        {lastUpdated && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-pink-400" />
            Updated {lastUpdated}
          </span>
        )}
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <Button size="sm" variant="outline" className="gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50" onClick={handleCopy}>
          <Copy className="h-3.5 w-3.5" />
          Copy Link
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Open Form
          </a>
        </Button>
        <Button size="sm" variant="ghost" className="gap-1.5 text-slate-500 hover:text-violet-700 hover:bg-violet-50">
          <BarChart2 className="h-3.5 w-3.5" />
          Responses
        </Button>
      </div>
    </div>
  );
}
