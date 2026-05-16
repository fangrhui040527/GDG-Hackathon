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

const minimalConfig = {
  violet:  { border: "border-t-violet-400", blob1: "bg-violet-400", blob2: "bg-purple-300",  icon: "bg-white/70 dark:bg-white/15", iconColor: "text-violet-600 dark:text-violet-300" },
  pink:    { border: "border-t-pink-400",   blob1: "bg-pink-400",   blob2: "bg-rose-300",    icon: "bg-white/70 dark:bg-white/15", iconColor: "text-pink-600 dark:text-pink-300"   },
  blue:    { border: "border-t-cyan-400",   blob1: "bg-cyan-400",   blob2: "bg-blue-300",    icon: "bg-white/70 dark:bg-white/15", iconColor: "text-cyan-600 dark:text-cyan-300"   },
  emerald: { border: "border-t-teal-400",   blob1: "bg-teal-400",   blob2: "bg-emerald-300", icon: "bg-white/70 dark:bg-white/15", iconColor: "text-teal-600 dark:text-teal-300"   },
  amber:   { border: "border-t-amber-400",  blob1: "bg-amber-400",  blob2: "bg-orange-300",  icon: "bg-white/70 dark:bg-white/15", iconColor: "text-amber-600 dark:text-amber-300" },
  slate:   { border: "border-t-slate-400",  blob1: "bg-slate-400",  blob2: "bg-slate-300",   icon: "bg-white/70 dark:bg-white/15", iconColor: "text-slate-600 dark:text-slate-300" },
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
    const cfg = minimalConfig[accentKey as keyof typeof minimalConfig] ?? minimalConfig.slate;

    return (
      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-2xl border-t-4 border border-white/80 dark:border-white/10 shadow-xl transition-all duration-200 hover:shadow-2xl hover:-translate-y-0.5",
          cfg.border
        )}
      >
        {/* Card base */}
        <div className="absolute inset-0 bg-white/20 dark:bg-slate-950/30" />

        {/* Colored blob — top-right */}
        <div className={cn("absolute -top-8 -right-8 h-28 w-28 rounded-full opacity-70 blur-2xl", cfg.blob1)} />
        {/* Colored blob — bottom-left */}
        <div className={cn("absolute -bottom-6 -left-6 h-20 w-20 rounded-full opacity-50 blur-xl", cfg.blob2)} />

        {/* Frosted glass surface */}
        <div className="absolute inset-0 bg-white/55 dark:bg-slate-900/50 backdrop-blur-md" />

        {/* Top light sheen */}
        <div className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-white/70 to-transparent dark:from-white/10" />
        {/* Bottom gloss edge */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-white/90 dark:bg-white/10" />

        {/* Content */}
        <div className="relative flex items-center justify-between px-5 pt-5 pb-1">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-2xl shadow-sm", cfg.icon)}>
            <Icon className={cn("h-5 w-5", cfg.iconColor)} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 text-right leading-tight">{label}</span>
        </div>
        <p className="relative px-5 pb-6 text-4xl font-bold tracking-tight text-slate-800 dark:text-white leading-none">{value}</p>
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
