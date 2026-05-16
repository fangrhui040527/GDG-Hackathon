"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import MatchResultsSection from "@/components/ai-matching/MatchResultsSection";
import ShortlistPanel from "@/components/shortlist/ShortlistPanel";
import { fetchProgrammeMatches } from "@/lib/api";
import type { MatchResult, MatchResultsGroup, ShortlistItem } from "@/types";

export default function AIMatchingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [shortlist, setShortlist] = useState<ShortlistItem[]>([]);
  const [results, setResults] = useState<MatchResultsGroup>({
    companies: [],
    mentors: [],
    partners: [],
    serviceProviders: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgrammeMatches(id)
      .then(setResults)
      .catch(() => setError("Failed to load matching results."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = (result: MatchResult) => {
    const existing = shortlist.find((s) => s.matchResultId === result.id);
    if (existing) return;
    const newItem: ShortlistItem = {
      id: `sl-${Date.now()}`,
      programmeId: id,
      matchResultId: result.id,
      actorId: result.actorId,
      actorType: result.actorType,
      actorName: result.actorName,
      matchScore: result.matchScore,
      addedAt: new Date().toISOString(),
      addedBy: "Organiser",
      isAdminSelected: false,
    };
    setShortlist((prev) => [...prev, newItem]);
  };

  const handleRemove = (itemId: string) => {
    setShortlist((prev) => prev.filter((s) => s.id !== itemId));
  };

  const handleSubmit = () => {
    router.push("/organizer/submitted");
  };

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="flex items-center gap-3 mb-3">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-slate-500">
            <Link href={`/organizer/programmes/${id}`}>
              <ChevronLeft className="h-4 w-4" />
              Back to Programme
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">AI Matching Results</h1>
            <p className="text-sm text-slate-500">
              Review AI-recommended actors for this programme. Add to your shortlist, then submit to admin.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {loading && (
          <p className="text-sm text-slate-500">Running AI matching…</p>
        )}
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
        {!loading && !error && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <MatchResultsSection
                results={results}
                shortlist={shortlist}
                onAddToShortlist={handleAdd}
              />
            </div>
            <div>
              <ShortlistPanel
                items={shortlist}
                onRemove={handleRemove}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
