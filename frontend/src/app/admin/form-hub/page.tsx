"use client";

import Link from "next/link";
import { FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormStore } from "@/lib/form-store";

const MOCK_FORMS = [
  { id: "form-001", title: "Company Registration Form", category: "Onboarding", responses: 34, status: "active" },
  { id: "form-002", title: "Mentor Application Form", category: "Onboarding", responses: 18, status: "active" },
  { id: "form-003", title: "Partnership Interest Form", category: "Partnerships", responses: 12, status: "active" },
  { id: "form-004", title: "Programme Feedback Survey", category: "Feedback", responses: 56, status: "closed" },
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_FORMS.map((form) => (
            <div key={form.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                  <FileText className="h-5 w-5 text-violet-600" />
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  form.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{form.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{form.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{form.responses} responses</span>
                <Button variant="ghost" size="sm" className="gap-1 text-violet-600 h-7 px-2">
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
