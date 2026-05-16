import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { ADMIN_STATS, MOCK_PROGRAMMES } from "@/lib/mock-data";

export default function AdminReportsPage() {
  const totalProgrammes = MOCK_PROGRAMMES.length;
  const publishedCount = MOCK_PROGRAMMES.filter((p) => ["published", "active"].includes(p.status)).length;

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="mt-0.5 text-sm text-slate-500">Platform analytics and ecosystem performance.</p>
      </div>
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total Programmes" value={totalProgrammes} icon={BarChart3} color="violet" />
          <StatCard label="Published" value={publishedCount} icon={TrendingUp} color="emerald" />
          <StatCard label="Total Actors" value={ADMIN_STATS.totalActors} icon={Users} color="blue" />
          <StatCard label="Active" value={ADMIN_STATS.activeProgrammes} icon={Activity} color="amber" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Programmes by Status</h3>
            <div className="space-y-3">
              {["draft", "submitted", "pending_review", "approved", "published", "active", "rejected"].map((status) => {
                const count = MOCK_PROGRAMMES.filter((p) => p.status === status).length;
                if (count === 0) return null;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 capitalize">{status.replace(/_/g, " ")}</span>
                    <span className="text-sm font-bold text-slate-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Programmes by Category</h3>
            <div className="space-y-3">
              {Array.from(new Set(MOCK_PROGRAMMES.map((p) => p.category))).map((cat) => {
                const count = MOCK_PROGRAMMES.filter((p) => p.category === cat).length;
                return (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{cat}</span>
                    <span className="text-sm font-bold text-slate-900">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
