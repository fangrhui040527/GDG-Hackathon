import { Brain, Plus, Check, ExternalLink } from "lucide-react";
import type { MatchResult } from "@/types";
import { cn, getMatchTierColor, getMatchTierLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MatchResultCardProps {
  result: MatchResult;
  isShortlisted?: boolean;
  onAddToShortlist?: (result: MatchResult) => void;
}

function MatchScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
      : score >= 70
      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      : "bg-gradient-to-r from-amber-400 to-orange-500 text-white";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold shadow-sm", color)}>
      {score}%
    </span>
  );
}

export default function MatchResultCard({
  result,
  isShortlisted = false,
  onAddToShortlist,
}: MatchResultCardProps) {
  const tierLabel = getMatchTierLabel(result.matchScore);

  return (
    <div className="group rounded-2xl border border-violet-100 bg-white p-5 shadow-sm transition-all hover:shadow-lg hover:ring-1 hover:ring-violet-200">
      <div className="flex items-start justify-between gap-4">
        {/* Left: name + score */}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900">{result.actorName}</h4>
            <MatchScoreBadge score={result.matchScore} />
            <span className="text-xs font-medium text-slate-400">{tierLabel} Match</span>
            {!result.isAvailable && (
              <Badge variant="outline" className="text-slate-400">
                Unavailable
              </Badge>
            )}
          </div>
          <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{result.profileSummary}</p>
        </div>

        {/* Right: CTA buttons */}
        <div className="shrink-0 flex flex-col gap-2">
          {isShortlisted ? (
            <Button size="sm" variant="secondary" disabled className="gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200">
              <Check className="h-4 w-4" />
              Added
            </Button>
          ) : (
            <Button
              size="sm"
              variant="navy"
              className="gap-1.5"
              onClick={() => onAddToShortlist?.(result)}
            >
              <Plus className="h-4 w-4" />
              Shortlist
            </Button>
          )}
          <Button size="sm" variant="outline" className="gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50">
            <ExternalLink className="h-3.5 w-3.5" />
            View Profile
          </Button>
        </div>
      </div>

      {/* AI explanation */}
      <div className="mt-4 flex gap-2 rounded-xl bg-violet-50 p-3.5">
        <Brain className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
        <p className="text-xs leading-relaxed text-violet-700">{result.aiExplanation}</p>
      </div>

      {/* Footer: tags + availability */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {result.tags.map((tag: string) => (
            <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
              {tag}
            </span>
          ))}
        </div>
        <span
          className={cn(
            "text-xs font-semibold",
            result.isAvailable ? "text-emerald-600" : "text-slate-400"
          )}
        >
          {result.availabilityLabel}
        </span>
      </div>
    </div>
  );
}
