import type { Relationship } from "@/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  company_mentor: "Company → Mentor",
  company_partner: "Company → Partner",
  company_service_provider: "Company → Service Provider",
  company_programme: "Company → Programme",
};

interface RelationshipTableProps {
  relationships: Relationship[];
}

function MatchScorePill({ score }: { score?: number }) {
  if (score === undefined) return <span className="text-slate-300">—</span>;
  const color =
    score >= 85
      ? "bg-violet-100 text-violet-700"
      : score >= 70
      ? "bg-blue-100 text-blue-700"
      : "bg-amber-100 text-amber-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      {score}%
    </span>
  );
}

export default function RelationshipTable({ relationships }: RelationshipTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-violet-50/60 border-b border-violet-100">
            <TableHead className="font-semibold text-slate-600">Relationship</TableHead>
            <TableHead className="font-semibold text-slate-600">Source</TableHead>
            <TableHead className="font-semibold text-slate-600">Target</TableHead>
            <TableHead className="font-semibold text-slate-600">Programme</TableHead>
            <TableHead className="font-semibold text-slate-600">Match Score</TableHead>
            <TableHead className="font-semibold text-slate-600">Status</TableHead>
            <TableHead className="font-semibold text-slate-600">Established</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {relationships.map((rel) => (
            <TableRow key={rel.id} className="hover:bg-violet-50/30 transition-colors">
              <TableCell>
                <span className="text-sm font-medium text-slate-700">
                  {TYPE_LABELS[rel.type] ?? rel.type}
                </span>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-medium text-slate-800">{rel.sourceName}</p>
                  <p className="text-xs text-slate-400">{rel.sourceType}</p>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-medium text-slate-800">{rel.targetName}</p>
                  <p className="text-xs text-slate-400">{rel.targetType}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-500">{rel.programmeName}</TableCell>
              <TableCell>
                <MatchScorePill score={(rel as { matchScore?: number }).matchScore} />
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    rel.status === "active"
                      ? "active"
                      : rel.status === "completed"
                      ? "published"
                      : "rejected"
                  }
                >
                  {rel.status.charAt(0).toUpperCase() + rel.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-500">
                {formatDate(rel.establishedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
