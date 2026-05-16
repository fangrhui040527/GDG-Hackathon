import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  highlight?: boolean;
  color?: "violet" | "pink" | "blue" | "emerald" | "amber" | "slate";
  variant?: "solid" | "minimal";
}

const colorMap = {
  violet: {
    card: "bg-gradient-to-br from-violet-500 to-violet-700 text-white",
    icon: "bg-white/20",
    iconColor: "text-white",
    label: "text-violet-100",
    value: "text-white",
  },
  pink: {
    card: "bg-gradient-to-br from-pink-500 to-rose-600 text-white",
    icon: "bg-white/20",
    iconColor: "text-white",
    label: "text-pink-100",
    value: "text-white",
  },
  blue: {
    card: "bg-gradient-to-br from-blue-500 to-blue-700 text-white",
    icon: "bg-white/20",
    iconColor: "text-white",
    label: "text-blue-100",
    value: "text-white",
  },
  emerald: {
    card: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
    icon: "bg-white/20",
    iconColor: "text-white",
    label: "text-emerald-100",
    value: "text-white",
  },
  amber: {
    card: "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
    icon: "bg-white/20",
    iconColor: "text-white",
    label: "text-amber-100",
    value: "text-white",
  },
};

const defaultStyle = {
  card: "bg-white border border-slate-200",
  icon: "bg-slate-50",
  iconColor: "text-slate-600",
  label: "text-slate-500",
  value: "text-slate-900",
};

const minimalAccentMap = {
  violet: "border-t-violet-500 text-violet-600",
  pink: "border-t-slate-900 text-slate-900",
  blue: "border-t-cyan-500 text-cyan-600",
  emerald: "border-t-teal-500 text-teal-600",
  amber: "border-t-amber-500 text-amber-600",
  slate: "border-t-slate-300 text-slate-500",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
  color,
  variant = "solid",
}: StatCardProps) {
  if (variant === "minimal") {
    const accentKey = color ?? (highlight ? "violet" : "slate");
    const accent = minimalAccentMap[accentKey as keyof typeof minimalAccentMap] ?? minimalAccentMap.slate;

    return (
      <div
        className={cn(
          "flex flex-col gap-4 rounded-2xl border border-slate-200 border-t-4 bg-white p-5 shadow-sm",
          accent
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50">
            <Icon className={cn("h-5 w-5", accent)} />
          </div>
        </div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
    );
  }

  const solidColor = color && color in colorMap ? (color as keyof typeof colorMap) : undefined;
  const style = solidColor ? colorMap[solidColor] : highlight ? colorMap.violet : defaultStyle;

  return (
    <div className={cn("flex flex-col gap-3 rounded-2xl p-5 shadow-sm", style.card)}>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-semibold uppercase tracking-wider", style.label)}>{label}</span>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", style.icon)}>
          <Icon className={cn("h-5 w-5", style.iconColor)} />
        </div>
      </div>
      <p className={cn("text-3xl font-bold", style.value)}>{value}</p>
    </div>
  );
}
