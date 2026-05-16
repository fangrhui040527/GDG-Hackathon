"use client";

import { useEffect, useState } from "react";
import { fetchActors, toActorRow } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { ActorTableRow } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  company: "Company",
  mentor: "Mentor",
  partner: "Partner",
  service_provider: "Service Provider",
};

export default function AdminManageActorsPage() {
  const [actors, setActors] = useState<ActorTableRow[]>([]);

  useEffect(() => {
    fetchActors().then((data) => setActors(data.map(toActorRow)))
      .catch((e) => console.error("API error:", e));
  }, []);

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Manage Actors</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          View and manage all registered companies, mentors, partners, and service providers.
        </p>
      </div>
      <div className="p-8">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Country</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {actors.map((actor) => (
                <tr key={actor.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{actor.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {TYPE_LABELS[actor.type] ?? actor.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{actor.category}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{actor.country}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      actor.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : actor.status === "pending"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {actor.status.charAt(0).toUpperCase() + actor.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{formatDate(actor.registeredAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
