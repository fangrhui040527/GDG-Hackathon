"use client";

import { useState } from "react";
import { Building2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useFormStore } from "@/lib/form-store";
import { registerCompany } from "@/lib/api";
import { PROGRAMME_CATEGORIES, COMPANY_STAGES, COUNTRIES } from "@/lib/constants";

const SUPPORT_OPTIONS = [
  "Mentorship & Advisory", "Fundraising & Investor Introductions",
  "Market Access & Distribution", "Technology & Cloud Resources",
  "Legal & Compliance", "Financial & Accounting Services",
  "Talent & Recruitment", "Product Development Guidance",
  "International Expansion", "Brand & Marketing Support",
];

const AVAILABILITY_OPTIONS = [
  "Full-time (40+ hrs/week)", "Part-time (20–40 hrs/week)",
  "Limited (< 20 hrs/week)", "Weekdays only", "Weekends only", "Flexible",
];

const EMPTY = {
  company_name: "", company_description: "", country: "",
  industry: "", business_stage: "", support_needed: "",
  availability: "", event_id: "",
};

export default function CompanyRegistrationForm() {
  const { addSubmission } = useFormStore();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ ...EMPTY });

  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.company_name.trim()) e.company_name = "Company name is required";
    if (!form.company_description.trim()) e.company_description = "Company description is required";
    if (!form.country) e.country = "Country is required";
    if (!form.industry) e.industry = "Industry is required";
    if (!form.business_stage) e.business_stage = "Business stage is required";
    if (!form.support_needed) e.support_needed = "Support needed is required";
    if (!form.availability) e.availability = "Availability is required";
    if (form.event_id && isNaN(Number(form.event_id)))
      e.event_id = "Event ID must be a number";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    try {
      await registerCompany({
        ...form,
        event_id: form.event_id ? Number(form.event_id) : null,
      });
      addSubmission("company", form);
      setSubmitted(true);
    } catch {
      setErrors({ company_name: "Failed to register. Please try again." });
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Submitted!</h2>
        <p className="text-slate-500 mb-6">
          Thank you for registering <strong>{form.company_name}</strong>. We'll be in touch soon.
        </p>
        <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ ...EMPTY }); }}>
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Company Registration</h1>
          <p className="text-sm text-slate-500">Join the NexusAI ecosystem and be matched to active programmes</p>
        </div>
      </div>

      {/* Company Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-900">Company Information</h2>

        <div className="grid gap-4 sm:grid-cols-1">
          <div className="space-y-1.5">
            <Label>Company Name <span className="text-red-500">*</span></Label>
            <Input placeholder="e.g. Acme Technologies" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} />
            {errors.company_name && <p className="text-xs text-red-500">{errors.company_name}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Industry <span className="text-red-500">*</span></Label>
            <Select value={form.industry} onValueChange={(v) => set("industry", v)}>
              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>{PROGRAMME_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.industry && <p className="text-xs text-red-500">{errors.industry}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Business Stage <span className="text-red-500">*</span></Label>
            <Select value={form.business_stage} onValueChange={(v) => set("business_stage", v)}>
              <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
              <SelectContent>{COMPANY_STAGES.filter((s) => s !== "Any").map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            {errors.business_stage && <p className="text-xs text-red-500">{errors.business_stage}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Country <span className="text-red-500">*</span></Label>
            <Select value={form.country} onValueChange={(v) => set("country", v)}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>{COUNTRIES.filter((c) => c !== "Any").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Company Description <span className="text-red-500">*</span></Label>
          <Textarea placeholder="What does your company do? What problem are you solving?" rows={4} value={form.company_description} onChange={(e) => set("company_description", e.target.value)} />
          {errors.company_description && <p className="text-xs text-red-500">{errors.company_description}</p>}
        </div>
      </section>

      {/* Programme Fit */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-900">Programme Fit</h2>

        <div className="space-y-1.5">
          <Label>Support Needed <span className="text-red-500">*</span></Label>
          <Select value={form.support_needed} onValueChange={(v) => set("support_needed", v)}>
            <SelectTrigger><SelectValue placeholder="What type of support are you looking for?" /></SelectTrigger>
            <SelectContent>{SUPPORT_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          {errors.support_needed && <p className="text-xs text-red-500">{errors.support_needed}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Availability <span className="text-red-500">*</span></Label>
          <Select value={form.availability} onValueChange={(v) => set("availability", v)}>
            <SelectTrigger><SelectValue placeholder="How available is your team?" /></SelectTrigger>
            <SelectContent>{AVAILABILITY_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
          </Select>
          {errors.availability && <p className="text-xs text-red-500">{errors.availability}</p>}
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Submit Registration
        </Button>
      </div>
    </form>
  );
}
