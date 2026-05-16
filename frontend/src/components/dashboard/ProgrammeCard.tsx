"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CalendarDays, ArrowRight, PencilLine, MapPin, Trash2, Send } from "lucide-react";
import type { Programme } from "@/types";
import { formatDateRange, truncate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "@/components/dashboard/StatusBadge";

interface ProgrammeCardProps {
  programme: Programme;
  role?: "organizer" | "admin";
  onDelete?: (id: string) => void;
  onSubmit?: (id: string) => void;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  Fintech: "from-blue-500 to-violet-600",
  Healthcare: "from-teal-500 to-emerald-600",
  Sustainability: "from-green-500 to-teal-600",
  EdTech: "from-orange-400 to-pink-500",
  AgriTech: "from-lime-500 to-green-600",
  DeepTech: "from-violet-500 to-purple-700",
  "E-Commerce": "from-rose-400 to-pink-600",
  Logistics: "from-amber-400 to-orange-500",
  CleanEnergy: "from-cyan-500 to-blue-600",
  Other: "from-slate-400 to-slate-600",
};

export default function ProgrammeCard({ programme, role = "organizer", onDelete, onSubmit }: ProgrammeCardProps) {
  const [confirming, setConfirming] = useState(false);
  const isDraft = programme.status === "draft";
  const canSubmit = role === "organizer" && programme.status === "draft" && onSubmit;
  const detailHref =
    role === "admin"
      ? `/admin/submissions/${programme.id}`
      : `/organizer/programmes/${programme.id}`;

  const gradient = CATEGORY_GRADIENTS[programme.category] ?? "from-violet-500 to-purple-700";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-500">
      {/* Cover image */}
      <div className="relative h-44 w-full overflow-hidden">
        {programme.coverImage ? (
          <Image
            src={programme.coverImage}
            alt={programme.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
        )}
        {/* Bottom fade into card */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Badges overlay */}
        <div className="absolute left-3 top-3 flex gap-2">
          <StatusBadge status={programme.status} className="shadow-sm" />
        </div>
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-white/90 dark:bg-slate-800/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm">
            {programme.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-bold leading-snug text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
          {programme.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
          <span>
            {programme.endDate
              ? formatDateRange(programme.startDate, programme.endDate)
              : `From ${new Date(programme.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          </span>
        </div>

        {(programme as { location?: string }).location && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
            <span>{(programme as { location?: string }).location}</span>
          </div>
        )}

        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {truncate(programme.description, 90)}
        </p>

        {/* Progress */}
        <div className="mt-auto pt-1">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-500 dark:text-slate-400">{programme.progress.label}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{programme.progress.status}</span>
          </div>
          <Progress
            value={programme.progress.value}
            className="h-1.5 bg-slate-200 dark:bg-slate-700 [&>div]:bg-slate-900 dark:[&>div]:bg-slate-300"
          />
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-slate-100 dark:border-slate-700 px-5 py-3 flex flex-col gap-2">
        {/* Main action */}
        {isDraft ? (
          <Button asChild variant="navy" className="w-full gap-2">
            <Link href={detailHref}>
              <PencilLine className="h-4 w-4" />
              Continue Editing
            </Link>
          </Button>
        ) : (
          <Button asChild variant="navy" className="w-full gap-2">
            <Link href={detailHref}>
              View Details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}

        {/* Secondary actions row */}
        {(canSubmit || onDelete) && (
          <div className="flex gap-2">
            {canSubmit && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 text-violet-700 border-violet-200 hover:bg-violet-50 dark:text-violet-300 dark:border-violet-800 dark:hover:bg-violet-950"
                onClick={() => onSubmit!(programme.id)}
              >
                <Send className="h-3.5 w-3.5" />
                Submit to Admin
              </Button>
            )}
            {onDelete && (
              confirming ? (
                <div className="flex flex-1 gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => { onDelete(programme.id); setConfirming(false); }}
                  >
                    Confirm Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setConfirming(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-1.5 text-red-500 border-red-100 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 ${canSubmit ? "" : "flex-1"}`}
                  onClick={() => setConfirming(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {!canSubmit && "Delete"}
                </Button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
