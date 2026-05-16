import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ArrowRight, PencilLine, MapPin } from "lucide-react";
import type { Programme } from "@/types";
import { formatDateRange, truncate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import StatusBadge from "@/components/dashboard/StatusBadge";

interface ProgrammeCardProps {
  programme: Programme;
  role?: "organizer" | "admin";
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

export default function ProgrammeCard({ programme, role = "organizer" }: ProgrammeCardProps) {
  const isDraft = programme.status === "draft";
  const detailHref =
    role === "admin"
      ? `/admin/submissions/${programme.id}`
      : `/organizer/programmes/${programme.id}`;

  const gradient = CATEGORY_GRADIENTS[programme.category] ?? "from-violet-500 to-purple-700";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm transition-all hover:shadow-md">
      {/* Cover image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
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
        {/* Badges overlay */}
        <div className="absolute left-3 top-3 flex gap-2">
          <StatusBadge status={programme.status} className="shadow-sm" />
        </div>
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700 shadow-sm">
            {programme.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-bold leading-snug text-slate-900 group-hover:text-blue-700 transition-colors">
          {programme.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span>
            {programme.endDate
              ? formatDateRange(programme.startDate, programme.endDate)
              : `From ${new Date(programme.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          </span>
        </div>

        {(programme as { location?: string }).location && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>{(programme as { location?: string }).location}</span>
          </div>
        )}

        <p className="text-sm leading-relaxed text-slate-500">
          {truncate(programme.description, 90)}
        </p>

        {/* Progress */}
        <div className="mt-auto pt-1">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">{programme.progress.label}</span>
            <span className="font-semibold text-slate-700">{programme.progress.status}</span>
          </div>
          <Progress
            value={programme.progress.value}
            className="h-1.5 bg-slate-100 [&>div]:bg-slate-900"
          />
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-slate-200 px-5 py-3">
        {isDraft ? (
          <Button
            asChild
            variant="outline"
            className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Link href={detailHref}>
              <PencilLine className="h-4 w-4" />
              Continue Editing
            </Link>
          </Button>
        ) : (
          <Button
            asChild
            variant="outline"
            className="w-full gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <Link href={detailHref}>
              View Details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
