"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type FormInfo = {
  id: string;
  title: string;
  category: string;
  responses: number;
  status: string;
  href: string;
};

export default function AdminFormHubPage() {
  const [forms, setForms] = useState<FormInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/analytics/dashboard`);
        if (!res.ok) throw new Error();
        const metrics = await res.json();
        setForms([
          { id: "companies", title: "Company Registration", category: "Onboarding", responses: metrics.companies ?? 0, status: "active", href: "/forms/company" },
          { id: "mentors", title: "Mentor Application", category: "Onboarding", responses: metrics.mentors ?? 0, status: "active", href: "/forms/mentor" },
          { id: "partners", title: "Partner Registration", category: "Partnerships", responses: 0, status: "active", href: "/forms/partner" },
          { id: "service-providers", title: "Service Provider Registration", category: "Onboarding", responses: 0, status: "active", href: "/forms/service-provider" },
        ]);
        const actorsRes = await fetch(`${API}/actors`);
        if (actorsRes.ok) {
          const actors: { type?: string }[] = await actorsRes.json();
          const counts: Record<string, number> = {};
          for (const a of actors) {
            const t = (a.type ?? "").toLowerCase();
            counts[t] = (counts[t] || 0) + 1;
          }
          setForms((prev) =>
            prev.map((f) => {
              if (f.id === "partners") return { ...f, responses: counts["partner"] ?? 0 };
              if (f.id === "service-providers") return { ...f, responses: counts["service_provider"] ?? counts["serviceprovider"] ?? 0 };
              return f;
            })
          );
        }
      } catch {
        setForms([
          { id: "companies", title: "Company Registration", category: "Onboarding", responses: 0, status: "active", href: "/forms/company" },
          { id: "mentors", title: "Mentor Application", category: "Onboarding", responses: 0, status: "active", href: "/forms/mentor" },
          { id: "partners", title: "Partner Registration", category: "Partnerships", responses: 0, status: "active", href: "/forms/partner" },
          { id: "service-providers", title: "Service Provider Registration", category: "Onboarding", responses: 0, status: "active", href: "/forms/service-provider" },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Form Hub</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage intake forms and view submissions.</p>
        </div>
      </div>
      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <div key={form.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                    <FileText className="h-5 w-5 text-violet-600" />
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs font-medium">
                    Active
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{form.title}</h3>
                <p className="text-xs text-slate-400 mb-3">{form.category}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    {form.responses} submissions
                  </span>
                  <Button asChild variant="ghost" size="sm" className="gap-1 text-violet-600 h-7 px-2">
                    <Link href={form.href}>Open Form</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
