"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormStore } from "@/lib/form-store";
import type { FormType } from "@/lib/form-store";

const FORM_LABELS: Record<FormType, string> = {
  company: "Company Registration Form",
  mentor: "Mentor Registration Form",
  partner: "Partner Registration Form",
  "service-provider": "Service Provider Registration Form",
};

const FIELD_LABELS: Record<string, string> = {
  // company (DB columns)
  company_name: "Company Name",
  company_description: "Company Description",
  country: "Country",
  industry: "Industry",
  business_stage: "Business Stage",
  support_needed: "Support Needed",
  availability: "Availability",
  event_id: "Event ID",
  // mentor (DB columns)
  full_name: "Full Name", email: "Email",
  job_title: "Job Title", organization_name: "Organisation Name",
  linkedin_profile_url: "LinkedIn Profile URL",
  short_bio: "Short Bio", cv: "CV / Resume URL", video: "Video Introduction URL",
  preferred_company_stage: "Preferred Company Stage",
  preferred_industry: "Preferred Industry",
  type_of_support_offered: "Type of Support Offered",
  available_hours_per_month: "Available Hours / Month",
  max_companies_to_mentor: "Max Companies to Mentor",
  current_availability_status: "Current Availability Status",
  // partner (DB columns)
  organisation_name: "Organisation Name",
  organisation_type: "Organisation Type",
  organisation_description: "Organisation Description",
  industries_of_interest: "Industries of Interest",
  preferred_collaboration_type: "Preferred Collaboration Type",
  resources_provided: "Resources Provided",
  support_offered: "Support Offered",
  support_capacity: "Support Capacity",
  requirements: "Requirements / Expectations",
  contact_person_name: "Contact Person Name",
  contact_email: "Contact Email",
  // service-provider (DB columns)
  service_provider_type: "Service Provider Type",
  country_region: "Country / Region",
  website_url: "Website URL",
  services_offered: "Services Offered",
  detailed_service_description: "Detailed Service Description",
  target_company_stage: "Target Company Stage",
  pricing_model: "Pricing Model",
  current_capacity: "Current Capacity",
};

export default function AdminFormResponsesPage({ params }: { params: Promise<{ formId: string }> }) {
  const { formId } = use(params);
  const { getSubmissions } = useFormStore();

  const formType = formId as FormType;
  const responses = getSubmissions(formType);
  const title = FORM_LABELS[formType] ?? "Form Responses";

  const handleExportCSV = () => {
    if (responses.length === 0) return;
    const allKeys = Array.from(new Set(responses.flatMap((r) => Object.keys(r.data))));
    const header = ["Submitted At", ...allKeys.map((k) => FIELD_LABELS[k] ?? k)].join(",");
    const rows = responses.map((r) =>
      [new Date(r.submittedAt).toLocaleString(), ...allKeys.map((k) => `"${(r.data[k] ?? "").replace(/"/g, '""')}"`)]
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${formId}-responses.csv`;
    a.click();
  };

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="mb-3">
          <Button asChild variant="ghost" size="sm" className="gap-1.5 text-slate-500">
            <Link href="/admin/form-hub"><ChevronLeft className="h-4 w-4" />Back to Form Hub</Link>
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{responses.length} submissions</p>
          </div>
          {responses.length > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExportCSV}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <div className="p-8">
        {responses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
            <p className="text-slate-400">No responses yet.</p>
            <p className="text-sm text-slate-400 mt-1">Share the form link with applicants to start collecting data.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((response, idx) => (
              <div key={response.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Response #{responses.length - idx}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(response.submittedAt).toLocaleString()}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(response.data)
                    .filter(([, v]) => v)
                    .map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-slate-400">{FIELD_LABELS[key] ?? key}</p>
                        <p className="text-sm font-medium text-slate-800 break-words">{value}</p>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
