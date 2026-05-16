import Link from "next/link";
import { FileText, Globe, Activity, Users, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import ProgrammeCard from "@/components/dashboard/ProgrammeCard";
import { MOCK_PROGRAMMES, ADMIN_STATS } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const pendingProgrammes = MOCK_PROGRAMMES.filter((p) =>
    ["submitted", "pending_review", "changes_requested"].includes(p.status)
  );
  const publishedProgrammes = MOCK_PROGRAMMES.filter((p) =>
    ["published", "active"].includes(p.status)
  );

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
            value={ADMIN_STATS.pendingSubmissions}
            icon={FileText}
            highlight
            color="violet"
          />
          <StatCard label="Published" value={ADMIN_STATS.publishedProgrammes} icon={Globe} color="emerald" />
          <StatCard label="Active Programmes" value={ADMIN_STATS.activeProgrammes} icon={Activity} color="blue" />
          <StatCard label="Total Actors" value={ADMIN_STATS.totalActors} icon={Users} />
        </div>

        {/* Pending Review */}
        {pendingProgrammes.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Pending Review</h2>
              <Button asChild variant="ghost" size="sm" className="text-violet-600">
                <Link href="/admin/submissions">View all</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pendingProgrammes.slice(0, 3).map((programme) => (
                <ProgrammeCard key={programme.id} programme={programme} href={`/admin/submissions/${programme.id}`} />
              ))}
            </div>
          </section>
        )}

        {/* Published */}
        {publishedProgrammes.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Published Programmes</h2>
              <Button asChild variant="ghost" size="sm" className="text-violet-600">
                <Link href="/admin/published">View all</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publishedProgrammes.slice(0, 3).map((programme) => (
                <ProgrammeCard key={programme.id} programme={programme} href={`/admin/submissions/${programme.id}`} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
