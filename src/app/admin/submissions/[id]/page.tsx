"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CheckCircle, XCircle, RotateCcw, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import MatchResultsSection from "@/components/ai-matching/MatchResultsSection";
import ShortlistPanel from "@/components/shortlist/ShortlistPanel";
import { MOCK_PROGRAMMES, MOCK_MATCH_RESULTS, MOCK_SHORTLIST } from "@/lib/mock-data";
import { STATUS_LABELS } from "@/lib/constants";
import type { MatchResult, ShortlistItem } from "@/types";

export default function AdminSubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const programme = MOCK_PROGRAMMES.find((p) => p.id === id);
  if (!programme) notFound();

  const [adminShortlist, setAdminShortlist] = useState<ShortlistItem[]>(
    MOCK_SHORTLIST.filter((s) => s.programmeId === id)
  );

  const handleAdd = (result: MatchResult) => {
    const existing = adminShortlist.find((s) => s.matchResultId === result.id);
    if (existing) return;
    setAdminShortlist((prev) => [
      ...prev,
      {
        id: `admin-sl-${Date.now()}`,
        programmeId: id,
        matchResultId: result.id,
        actorId: result.actorId,
        actorType: result.actorType,
        actorName: result.actorName,
        matchScore: result.matchScore,
        addedAt: new Date().toISOString(),
        addedBy: "Admin",
        isAdminSelected: true,
      },
    ]);
  };

  const handleRemove = (itemId: string) => {
    setAdminShortlist((prev) => prev.filter((s) => s.id !== itemId));
  };

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="mb-3">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-slate-500">
            <Link href="/admin/submissions">
              <ChevronLeft className="h-4 w-4" />
              Back to Submissions
            </Link>
          </Button>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl font-bold text-slate-900">{programme.name}</h1>
              <Badge variant={programme.status as Parameters<typeof Badge>[0]["variant"]}>
                {STATUS_LABELS[programme.status]}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">Submitted by {programme.organiserName}</p>
          </div>
          {/* Admin action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50">
              <RotateCcw className="h-4 w-4" />
              Request Changes
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
            <Button variant="navy" size="sm" className="gap-1.5">
              <Globe className="h-4 w-4" />
              Publish Programme
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Programme summary */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-semibold text-slate-900">Programme Details</h2>
          <p className="text-sm text-slate-500 mb-3">{programme.description}</p>
          <Separator className="my-3" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
            <Detail label="Category" value={programme.category} />
            <Detail label="Start Date" value={programme.startDate} />
            <Detail label="Target Industry" value={programme.requirements.targetIndustry} />
            <Detail label="Company Stage" value={programme.requirements.targetCompanyStage} />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* AI Matching + organiser shortlist */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="mb-3 font-semibold text-slate-900">AI Matching Results</h2>
              <MatchResultsSection
                results={MOCK_MATCH_RESULTS}
                shortlist={adminShortlist}
                onAddToShortlist={handleAdd}
              />
            </div>
          </div>

          {/* Admin selection panel */}
          <div>
            <h2 className="mb-3 font-semibold text-slate-900">Admin Selection</h2>
            <ShortlistPanel
              items={adminShortlist}
              onRemove={handleRemove}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-medium text-slate-700">{value}</p>
    </div>
  );
}
