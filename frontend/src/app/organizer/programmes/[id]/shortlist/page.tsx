"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShortlistPanel from "@/components/shortlist/ShortlistPanel";
import type { ShortlistItem } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ShortlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/selections`);
        if (!res.ok) throw new Error();
        const selections = await res.json();
        const mapped: ShortlistItem[] = [];
        for (const sel of selections) {
          for (const item of sel.items ?? []) {
            const actorType =
              item.entity_type === "MENTOR" ? "mentor" :
              item.entity_type === "COMPANY" ? "company" :
              item.entity_type === "PARTNER" ? "partner" : "service_provider";
            mapped.push({
              id: `sel-${sel.selection_id}-${item.id}`,
              programmeId: id,
              matchResultId: `match-${item.id}`,
              actorId: String(item.entity_id),
              actorType: actorType as ShortlistItem["actorType"],
              actorName: item.entity_name ?? `${item.entity_type} #${item.entity_id}`,
              matchScore: Math.round(item.match_score ?? 0),
              addedAt: sel.created_at ?? new Date().toISOString(),
              addedBy: sel.approved_by ?? "organizer",
              isAdminSelected: sel.approval_status === "APPROVED",
            });
          }
        }
        setItems(mapped);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="flex items-center gap-3 mb-3">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-slate-500">
            <Link href={`/organizer/programmes/${id}/ai-matching`}>
              <ChevronLeft className="h-4 w-4" />
              Back to AI Matching
            </Link>
          </Button>
        </div>
        <h1 className="text-xl font-bold text-slate-900">Shortlist</h1>
        <p className="text-sm text-slate-500">
          Review your selected actors before submitting to the admin for approval.
        </p>
      </div>
      <div className="p-8 max-w-2xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <ShortlistPanel items={items} readOnly />
        )}
        <div className="mt-4">
          <Button asChild variant="navy">
            <Link href={`/organizer/programmes/${id}/ai-matching`}>
              Edit Shortlist
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
