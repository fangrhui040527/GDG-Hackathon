import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ArrowRight, PencilLine, MapPin } from "lucide-react";
import type { Programme } from "@/types";
import { formatDateRange, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { STATUS_LABELS } from "@/lib/constants";

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
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-violet-100 transition-all hover:shadow-lg hover:ring-violet-200">
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
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Badges overlay */}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge
            variant={programme.status as Parameters<typeof Badge>[0]["variant"]}
            className="shadow backdrop-blur-sm"
          >
            {STATUS_LABELS[programme.status]}
          </Badge>
        </div>
        <div className="absolute right-3 top-3">
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-700 backdrop-blur-sm shadow">
            {programme.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-bold leading-snug text-slate-900 group-hover:text-violet-700 transition-colors">
          {programme.name}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-violet-400" />
          <span>
            {programme.endDate
              ? formatDateRange(programme.startDate, programme.endDate)
              : `From ${new Date(programme.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          </span>
        </div>

        {(programme as { location?: string }).location && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-pink-400" />
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
            <span className="font-semibold text-violet-600">{programme.progress.status}</span>
          </div>
          <Progress value={programme.progress.value} className="h-1.5 bg-violet-100 [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-pink-500" />
        </div>
      </div>

      {/* Footer CTA */}
      <div className="border-t border-violet-50 px-5 py-3">
        {isDraft ? (
          <Button asChild variant="outline" className="w-full gap-2 border-violet-200 text-violet-700 hover:bg-violet-50">
            <Link href={detailHref}>
              <PencilLine className="h-4 w-4" />
              Continue Editing
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline" className="w-full gap-2 border-violet-200 text-violet-700 hover:bg-violet-50">
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
