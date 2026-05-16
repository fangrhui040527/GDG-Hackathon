import type { ShortlistItem } from "@/types";
import { cn } from "@/lib/utils";
import { Building2, GraduationCap, Handshake, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const TYPE_ICONS = {
  company: Building2,
  mentor: GraduationCap,
  partner: Handshake,
  service_provider: Wrench,
};

const TYPE_LABELS = {
  company: "Company",
  mentor: "Mentor",
  partner: "Partner",
  service_provider: "Service Provider",
};

interface ShortlistPanelProps {
  items: ShortlistItem[];
  readOnly?: boolean;
  onRemove?: (id: string) => void;
  onSubmit?: () => void;
}

export default function ShortlistPanel({ items, readOnly = false, onRemove, onSubmit }: ShortlistPanelProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-400">No items in shortlist yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const Icon = TYPE_ICONS[item.actorType] ?? Building2;
        const typeLabel = TYPE_LABELS[item.actorType] ?? item.actorType;
        const scoreColor =
          item.matchScore >= 90
            ? "bg-emerald-100 text-emerald-700"
            : item.matchScore >= 75
            ? "bg-blue-100 text-blue-700"
            : "bg-amber-100 text-amber-700";

        return (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100">
              <Icon className="h-4 w-4 text-violet-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{item.actorName}</p>
              <p className="text-xs text-slate-500">{typeLabel}</p>
            </div>
            <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", scoreColor)}>
              {item.matchScore}%
            </span>
            {item.isAdminSelected && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                Admin Pick
              </span>
            )}
            {!readOnly && onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-slate-400 hover:text-red-600"
                onClick={() => onRemove(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      })}
      {!readOnly && onSubmit && (
        <Button variant="navy" className="w-full mt-2" onClick={onSubmit}>
          Submit Shortlist to Admin
        </Button>
      )}
    </div>
  );
}
