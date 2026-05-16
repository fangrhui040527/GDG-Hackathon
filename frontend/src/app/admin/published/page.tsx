"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProgrammeStore } from "@/lib/store";
import { STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default function AdminPublishedPage() {
  const { programmes } = useProgrammeStore();
  const published = programmes.filter((p) =>
    ["published", "active"].includes(p.status)
  );

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Published Programmes</h1>
        <p className="mt-0.5 text-sm text-slate-500">Live programmes visible to ecosystem participants.</p>
      </div>

      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {published.length === 0 ? (
            <div className="py-16 text-center text-slate-400">No published programmes.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Programme</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Published</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {published.map((programme) => (
                  <tr key={programme.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900 text-sm">{programme.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{programme.organiserName}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{programme.category}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {programme.publishedAt ? formatDate(programme.publishedAt) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={programme.status as Parameters<typeof Badge>[0]["variant"]}>
                        {STATUS_LABELS[programme.status]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button asChild variant="ghost" size="sm" className="gap-1 text-violet-600">
                        <Link href={`/admin/submissions/${programme.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                          View
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
