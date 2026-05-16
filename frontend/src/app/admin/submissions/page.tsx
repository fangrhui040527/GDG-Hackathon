"use client";

import Link from "next/link";
import { ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProgrammeStore } from "@/lib/store";
import { STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const SUBMISSION_STATUSES = ["submitted", "pending_review", "changes_requested", "approved", "rejected"];

export default function AdminSubmissionsPage() {
  const { programmes } = useProgrammeStore();
  const submissions = programmes.filter((p) =>
    SUBMISSION_STATUSES.includes(p.status)
  );

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Submissions</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Review and action organizer programme submissions.
        </p>
      </div>

      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {submissions.length === 0 ? (
            <div className="py-16 text-center text-slate-400">No submissions to review.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Programme</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Organiser</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((programme) => (
                  <tr key={programme.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 text-sm">{programme.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{programme.category}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{programme.organiserName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {programme.submittedAt ? formatDate(programme.submittedAt) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={programme.status as Parameters<typeof Badge>[0]["variant"]}>
                        {STATUS_LABELS[programme.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button asChild variant="ghost" size="sm" className="gap-1 text-blue-700">
                        <Link href={`/admin/submissions/${programme.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                          Review
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
