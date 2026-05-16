import Link from "next/link";
import { CalendarDays, ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_PROGRAMMES } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";

export default function SubmittedPage() {
  const submitted = MOCK_PROGRAMMES.filter((p) =>
    ["submitted", "pending_review", "changes_requested"].includes(p.status)
  );

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Submitted to Admin</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Programmes awaiting admin review and approval.
        </p>
      </div>

      <div className="p-8">
        {submitted.length === 0 ? (
          <div className="py-20 text-center">
            <Clock className="mx-auto mb-3 h-10 w-10 text-slate-200" />
            <p className="text-slate-400">No programmes submitted yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submitted.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-6 rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-slate-900">{p.name}</h3>
                    <Badge variant={p.status as Parameters<typeof Badge>[0]["variant"]}>
                      {STATUS_LABELS[p.status]}
                    </Badge>
                    <Badge variant="outline" className="text-slate-500">
                      {p.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Programme starts: {formatDate(p.startDate)}
                    </span>
                    {p.submittedAt && (
                      <span>Submitted: {formatDate(p.submittedAt)}</span>
                    )}
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-1.5 shrink-0">
                  <Link href={`/organizer/programmes/${p.id}`}>
                    View Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
