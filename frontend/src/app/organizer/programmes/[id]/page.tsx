"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Globe,
  Building2,
  Users,
  Handshake,
  Wrench,
  ArrowRight,
  ChevronLeft,
  Target,
  Trash2,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { fetchProgramme, deleteProgramme as apiDeleteProgramme, submitProgramme as apiSubmitProgramme, toProgramme } from "@/lib/api";
import { STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Programme } from "@/types";

export default function ProgrammeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [programme, setProgramme] = useState<Programme | null>(null);

  useEffect(() => {
    fetchProgramme(id).then(setProgramme).catch((e) => console.error("Failed to load programme:", e));
  }, [id]);

  if (!programme) {
    return <div className="flex items-center justify-center h-64 text-slate-400">Loading...</div>;
  }

  const req = programme.requirements;
  const isDraft = programme.status === "draft";

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="flex items-center gap-3 mb-4">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-slate-500">
            <Link href="/organizer/my-programmes">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{programme.name}</h1>
              <Badge variant={programme.status as Parameters<typeof Badge>[0]["variant"]}>
                {STATUS_LABELS[programme.status]}
              </Badge>
              <Badge variant="outline">{programme.category}</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <CalendarDays className="h-4 w-4" />
              <span>
                {formatDate(programme.startDate)}
                {programme.endDate ? ` – ${formatDate(programme.endDate)}` : ""}
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap">
            {isDraft && (
              <Button
                variant="outline"
                className="gap-1.5 text-violet-700 border-violet-200 hover:bg-violet-50"
                onClick={async () => {
                  try {
                    const dto = await apiSubmitProgramme(id);
                    setProgramme(toProgramme(dto));
                    router.push("/organizer/submitted");
                  } catch (e) {
                    console.error("Submit failed:", e);
                  }
                }}
              >
                <Send className="h-4 w-4" />
                Submit to Admin
              </Button>
            )}
            <Button asChild variant="outline">
              <Link href={`/organizer/programmes/${programme.id}/ai-matching`}>
                View AI Matching
              </Link>
            </Button>
            <Button asChild variant="navy">
              <Link href={`/organizer/programmes/${programme.id}/shortlist`}>
                View Shortlist
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-500 border-red-100 hover:bg-red-50"
              onClick={async () => {
                try {
                  await apiDeleteProgramme(id);
                  router.push("/organizer/my-programmes");
                } catch (e) {
                  console.error("Delete failed:", e);
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Cover + description */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 font-semibold text-slate-900">About this Programme</h2>
            <p className="text-sm leading-relaxed text-slate-600">{programme.description}</p>
          </div>
          <div className="relative h-48 overflow-hidden rounded-xl lg:h-auto">
            {programme.coverImage ? (
              <Image
                src={programme.coverImage}
                alt={programme.name}
                fill
                className="object-cover"
                sizes="33vw"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl" />
            )}
          </div>
        </div>

        {/* Requirements */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-semibold text-slate-900">Programme Requirements</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem icon={Target} label="Target Industry" value={req.targetIndustry} />
            <InfoItem icon={Globe} label="Target Country" value={req.targetCountry} />
            <InfoItem icon={Building2} label="Company Stage" value={req.targetCompanyStage} />
            <InfoItem icon={Building2} label="Required Companies" value={String(req.requiredCompanies)} />
            <InfoItem icon={Users} label="Required Mentors" value={String(req.requiredMentors)} />
            <InfoItem icon={Handshake} label="Required Partners" value={String(req.requiredPartners)} />
            <InfoItem icon={Wrench} label="Required Service Providers" value={String(req.requiredServiceProviders)} />
          </div>

          <Separator className="my-4" />
          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">Eligibility Criteria</p>
            <p className="text-sm text-slate-500">{req.eligibilityCriteria}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-50 px-4 py-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}
