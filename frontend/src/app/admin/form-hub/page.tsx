"use client";

import Link from "next/link";
import { FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormStore } from "@/lib/form-store";
import type { FormType } from "@/lib/form-store";

const FORMS: { id: FormType; title: string; category: string; color: string }[] = [
  { id: "company", title: "Company Registration Form", category: "Onboarding", color: "bg-blue-100 text-blue-600" },
  { id: "mentor", title: "Mentor Registration Form", category: "Onboarding", color: "bg-purple-100 text-purple-600" },
  { id: "partner", title: "Partner Registration Form", category: "Partnerships", color: "bg-emerald-100 text-emerald-600" },
  { id: "service-provider", title: "Service Provider Registration Form", category: "Onboarding", color: "bg-orange-100 text-orange-600" },
];

export default function AdminFormHubPage() {
  const { getSubmissions } = useFormStore();

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Form Hub</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage intake forms and view submissions.</p>
        </div>
      </div>
      <div className="p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {FORMS.map((form) => {
            const responses = getSubmissions(form.id);
            return (
              <div key={form.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${form.color}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    Active
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{form.title}</h3>
                <p className="text-xs text-slate-400 mb-4">{form.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">{responses.length}</span> responses
                  </span>
                  <Button asChild variant="ghost" size="sm" className="gap-1 text-violet-600 h-7 px-2">
                    <Link href={`/admin/form-hub/${form.id}`}>
                      <Eye className="h-3.5 w-3.5" />
                      View Responses
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
