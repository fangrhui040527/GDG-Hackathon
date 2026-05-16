"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import RelationshipTable from "@/components/relationships/RelationshipTable";
import type { Relationship } from "@/types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function AdminRelationshipsPage() {
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/selections`);
        if (!res.ok) throw new Error();
        const selections = await res.json();
        const mapped: Relationship[] = [];
        for (const sel of selections) {
          if (sel.approval_status !== "APPROVED") continue;
          for (const item of sel.items ?? []) {
            const typeMap: Record<string, Relationship["type"]> = {
              MENTOR: "company_mentor",
              PARTNER: "company_partner",
              SP: "company_service_provider",
              SERVICE_PROVIDER: "company_service_provider",
              COMPANY: "company_programme",
            };
            mapped.push({
              id: `rel-${sel.selection_id}-${item.id}`,
              type: typeMap[item.entity_type] ?? "company_programme",
              programmeId: String(sel.event_id ?? ""),
              programmeName: sel.purpose ?? "Selection",
              sourceId: String(sel.selection_id),
              sourceName: sel.purpose ?? `Selection #${sel.selection_id}`,
              sourceType: "Programme",
              targetId: String(item.entity_id),
              targetName: item.entity_name ?? `${item.entity_type} #${item.entity_id}`,
              targetType: item.entity_type?.toLowerCase() ?? "unknown",
              status: "active",
              establishedAt: sel.approved_at ?? sel.created_at ?? new Date().toISOString(),
            });
          }
        }
        setRelationships(mapped);
      } catch {
        setRelationships([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Relationships</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          All established relationships between ecosystem actors.
        </p>
      </div>
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : relationships.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-sm text-slate-400">No approved relationships yet. Approve selections to see relationships here.</p>
          </div>
        ) : (
          <RelationshipTable relationships={relationships} />
        )}
      </div>
    </div>
  );
}
