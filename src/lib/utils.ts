import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  if (!dateString) return "TBD";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatDateRange(start: string, end?: string): string {
  if (!end) return `${formatDate(start)} – Ongoing`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

export function getMatchTierColor(score: number): string {
  if (score >= 90) return "text-emerald-600 bg-emerald-50";
  if (score >= 75) return "text-blue-600 bg-blue-50";
  if (score >= 60) return "text-amber-600 bg-amber-50";
  return "text-slate-600 bg-slate-100";
}

export function getMatchTierLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Strong";
  if (score >= 60) return "Good";
  return "Fair";
}
