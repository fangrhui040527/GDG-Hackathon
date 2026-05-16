import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShortlistPanel from "@/components/shortlist/ShortlistPanel";

export default async function ShortlistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

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
        <ShortlistPanel items={[]} readOnly />
      </div>
    </div>
  );
}
