import type { MatchResultsGroup, MatchResult } from "@/types";
import MatchResultCard from "./MatchResultCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, GraduationCap, Handshake, Wrench, type LucideIcon } from "lucide-react";

import type { ShortlistItem } from "@/types";

interface MatchResultsSectionProps {
  results: MatchResultsGroup;
  shortlist: ShortlistItem[];
  onAddToShortlist?: (result: MatchResult) => void;
}

const TABS: Array<{ key: keyof MatchResultsGroup; label: string; icon: LucideIcon }> = [
  { key: "companies",       label: "Companies",        icon: Building2     },
  { key: "mentors",         label: "Mentors",          icon: GraduationCap },
  { key: "partners",        label: "Partners",         icon: Handshake     },
  { key: "serviceProviders",label: "Service Providers",icon: Wrench        },
];

export default function MatchResultsSection({
  results,
  shortlist,
  onAddToShortlist,
}: MatchResultsSectionProps) {
  return (
    <Tabs defaultValue="companies" className="w-full">
      <TabsList className="mb-4 bg-slate-100">
        {TABS.map(({ key, label, icon: Icon }) => (
          <TabsTrigger key={key} value={key} className="gap-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900">
            <Icon className="h-3.5 w-3.5" />
            {label}
            <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700">
              {(results[key] ?? []).length}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      {TABS.map(({ key }) => (
        <TabsContent key={key} value={key} className="space-y-3">
          {(results[key] ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No matches found.</p>
          ) : (
            (results[key] ?? []).map((result) => (
              <MatchResultCard
                key={result.id}
                result={result}
                isShortlisted={shortlist.some((s) => s.actorId === result.id)}
                onAddToShortlist={onAddToShortlist}
              />
            ))
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
