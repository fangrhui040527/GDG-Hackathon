import Link from "next/link";
import {
  FolderOpen,
  FilePenLine,
  Send,
  Clock,
  Globe,
  Download,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import StatCard from "@/components/dashboard/StatCard";
import ProgrammeCard from "@/components/dashboard/ProgrammeCard";
import { MOCK_PROGRAMMES, ORGANIZER_STATS } from "@/lib/mock-data";

export default function OrganizerDashboardPage() {
  const allProgrammes = MOCK_PROGRAMMES;
  const drafts = allProgrammes.filter((p) => p.status === "draft");
  const active = allProgrammes.filter((p) =>
    ["active", "published"].includes(p.status)
  );

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage your ecosystem programmes and track their statuses.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
          <Button
            variant="navy"
            asChild
          >
            <Link href="/organizer/create-programme">
              <Plus className="h-4 w-4" />
              New Programme
            </Link>
          </Button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard
            label="Total Programmes"
            value={ORGANIZER_STATS.totalProgrammes}
            icon={FolderOpen}
            color="pink"
            variant="minimal"
          />
          <StatCard label="Draft" value={ORGANIZER_STATS.draft} icon={FilePenLine} color="violet" variant="minimal" />
          <StatCard
            label="Submitted to Admin"
            value={ORGANIZER_STATS.submittedToAdmin}
            icon={Send}
            color="blue"
            variant="minimal"
          />
          <StatCard
            label="Pending Review"
            value={ORGANIZER_STATS.pendingReview}
            icon={Clock}
            color="emerald"
            variant="minimal"
          />
          <StatCard
            label="Published"
            value={ORGANIZER_STATS.published}
            icon={Globe}
            color="pink"
            variant="minimal"
          />
        </div>

        {/* Recent Programmes */}
        <section>
          <Tabs defaultValue="all">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Programmes</h2>
              <TabsList className="bg-slate-100 border border-slate-200 rounded-full p-1">
                <TabsTrigger
                  value="all"
                  className="rounded-full px-3 text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="drafts"
                  className="rounded-full px-3 text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow"
                >
                  Drafts
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="rounded-full px-3 text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow"
                >
                  Active
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {allProgrammes.map((p) => (
                  <ProgrammeCard key={p.id} programme={p} role="organizer" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="drafts">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {drafts.length > 0 ? (
                  drafts.map((p) => <ProgrammeCard key={p.id} programme={p} role="organizer" />)
                ) : (
                  <p className="col-span-3 py-12 text-center text-slate-400">No drafts found.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="active">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {active.length > 0 ? (
                  active.map((p) => <ProgrammeCard key={p.id} programme={p} role="organizer" />)
                ) : (
                  <p className="col-span-3 py-12 text-center text-slate-400">
                    No active programmes.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
