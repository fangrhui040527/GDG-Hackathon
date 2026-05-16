"use client";

import { useEffect, useState } from "react";
import { FileText, Globe, Activity, Users } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StatCard from "@/components/dashboard/StatCard";
import ProgrammeCard from "@/components/dashboard/ProgrammeCard";
import { fetchProgrammes, fetchActors, deleteProgramme as apiDeleteProgramme } from "@/lib/api";
import type { Programme } from "@/types";
import type { ActorTableRow } from "@/types/actor";

export default function AdminDashboardPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [actors, setActors] = useState<ActorTableRow[]>([]);

  useEffect(() => {
    fetchProgrammes().then(setProgrammes).catch((e) => console.error("Failed to load programmes:", e));
    fetchActors().then(setActors).catch((e) => console.error("Failed to load actors:", e));
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteProgramme(id);
      setProgrammes((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const pendingProgrammes = programmes.filter((p) =>
    ["submitted", "pending_review", "changes_requested"].includes(p.status)
  );
  const publishedProgrammes = programmes.filter((p) =>
    ["published", "active"].includes(p.status)
  );
  const activeProgrammes = programmes.filter((p) => p.status === "active");

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Review submissions, manage actors, and oversee the ecosystem.
          </p>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Pending Submissions"
            value={pendingProgrammes.length}
            icon={FileText}
            color="pink"
            variant="minimal"
          />
          <StatCard
            label="Published"
            value={publishedProgrammes.length}
            icon={Globe}
            color="emerald"
            variant="minimal"
          />
          <StatCard
            label="Active Programmes"
            value={activeProgrammes.length}
            icon={Activity}
            color="blue"
            variant="minimal"
          />
          <StatCard
            label="Total Actors"
            value={actors.length}
            icon={Users}
            color="violet"
            variant="minimal"
          />
        </div>

        {/* All Programmes – tabbed */}
        <section>
          <Tabs defaultValue="all">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">All Programmes</h2>
              <TabsList className="bg-slate-100 border border-slate-200 rounded-full p-1">
                <TabsTrigger value="all" className="rounded-full px-3 text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow">
                  All
                </TabsTrigger>
                <TabsTrigger value="pending" className="rounded-full px-3 text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow">
                  Pending
                </TabsTrigger>
                <TabsTrigger value="approved" className="rounded-full px-3 text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow">
                  Approved
                </TabsTrigger>
                <TabsTrigger value="published" className="rounded-full px-3 text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow">
                  Published
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {programmes.length === 0 ? (
                  <p className="col-span-3 py-12 text-center text-slate-400">No programmes yet.</p>
                ) : programmes.map((p) => (
                  <ProgrammeCard key={p.id} programme={p} role="admin" onDelete={handleDelete} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pendingProgrammes.length > 0 ? (
                  pendingProgrammes.map((p) => (
                    <ProgrammeCard key={p.id} programme={p} role="admin" onDelete={handleDelete} />
                  ))
                ) : (
                  <p className="col-span-3 py-12 text-center text-slate-400">No pending submissions.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="approved">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {programmes.filter((p) => p.status === "approved").length > 0 ? (
                  programmes.filter((p) => p.status === "approved").map((p) => (
                    <ProgrammeCard key={p.id} programme={p} role="admin" onDelete={handleDelete} />
                  ))
                ) : (
                  <p className="col-span-3 py-12 text-center text-slate-400">No approved programmes.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="published">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {publishedProgrammes.length > 0 ? (
                  publishedProgrammes.map((p) => (
                    <ProgrammeCard key={p.id} programme={p} role="admin" onDelete={handleDelete} />
                  ))
                ) : (
                  <p className="col-span-3 py-12 text-center text-slate-400">No published programmes.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
