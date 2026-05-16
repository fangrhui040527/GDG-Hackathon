import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";
import type { ProgrammeStatus } from "@/types";

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-blue-100 text-blue-700",
  pending_review: "bg-cyan-100 text-cyan-700",
  changes_requested: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  published: "bg-teal-100 text-teal-700",
  rejected: "bg-red-100 text-red-700",
  active: "bg-emerald-100 text-emerald-700",
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
