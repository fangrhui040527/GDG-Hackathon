import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import type { ProgrammeStatus } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  draft:             "bg-slate-600 text-white",
  submitted:         "bg-blue-600 text-white",
  pending_review:    "bg-cyan-500 text-white",
  changes_requested: "bg-amber-500 text-white",
  approved:          "bg-emerald-500 text-white",
  published:         "bg-emerald-500 text-white",
  rejected:          "bg-red-500 text-white",
  active:            "bg-teal-500 text-white",
};

interface StatusBadgeProps {
  status: ProgrammeStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600",
        className
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
