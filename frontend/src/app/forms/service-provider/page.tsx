"use client";

import { useState } from "react";
import { Wrench, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useFormStore } from "@/lib/form-store";
import { COUNTRIES, COMPANY_STAGES } from "@/lib/constants";

const SERVICE_PROVIDER_TYPES = [
  "Legal & Compliance", "Cloud & Infrastructure", "Finance & Accounting",
  "Marketing & Branding", "HR & Talent", "Cybersecurity", "Product Design",
  "Data & Analytics", "Other",
];
const PRICING_MODELS = ["Free / Pro-bono", "Subsidized (Ecosystem Rate)", "Market Rate", "Custom / Negotiable"];
const CURRENT_CAPACITY = ["Available — Actively taking new clients", "Limited — A few slots remaining", "At Capacity — Not accepting new clients"];

const EMPTY = {
  organisation_name: "", service_provider_type: "", country_region: "",
  website_url: "", contact_person_name: "", contact_email: "",
  company_description: "", services_offered: "", detailed_service_description: "",
  target_company_stage: "", pricing_model: "", current_capacity: "",
};

export default function ServiceProviderRegistrationForm() {
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
    if (!form.organisation_name.trim()) e.organisation_name = "Organisation name is required";
    if (!form.service_provider_type) e.service_provider_type = "Service provider type is required";
    if (!form.country_region) e.country_region = "Country / Region is required";
    if (form.website_url && !/^https?:\/\//i.test(form.website_url))
      e.website_url = "URL must start with http:// or https://";
    if (!form.contact_person_name.trim()) e.contact_person_name = "Contact person name is required";
    if (!form.contact_email.trim()) e.contact_email = "Contact email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) e.contact_email = "Invalid email";
    if (!form.company_description.trim()) e.company_description = "Company description is required";
    if (!form.services_offered.trim()) e.services_offered = "Services offered is required";
    if (!form.detailed_service_description.trim()) e.detailed_service_description = "Detailed description is required";
    if (!form.target_company_stage) e.target_company_stage = "Target company stage is required";
    if (!form.pricing_model) e.pricing_model = "Pricing model is required";
    if (!form.current_capacity) e.current_capacity = "Current capacity is required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    addSubmission("service-provider", form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Submitted!</h2>
        <p className="text-slate-500 mb-6">
          Thank you, <strong>{form.organisation_name}</strong>. We'll be in touch about joining the ecosystem as a service provider.
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
          <Wrench className="h-6 w-6 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Service Provider Registration</h1>
          <p className="text-sm text-slate-500">Offer your services — legal, cloud, finance, and more — to ecosystem companies</p>
        </div>
      </div>

      {/* Organisation Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-900">Organisation Details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Organisation Name <span className="text-red-500">*</span></Label>
            <Input placeholder="e.g. CloudPeak Solutions" value={form.organisation_name} onChange={(e) => set("organisation_name", e.target.value)} />
            {errors.organisation_name && <p className="text-xs text-red-500">{errors.organisation_name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Service Provider Type <span className="text-red-500">*</span></Label>
            <Select value={form.service_provider_type} onValueChange={(v) => set("service_provider_type", v)}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{SERVICE_PROVIDER_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            {errors.service_provider_type && <p className="text-xs text-red-500">{errors.service_provider_type}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Country / Region <span className="text-red-500">*</span></Label>
            <Select value={form.country_region} onValueChange={(v) => set("country_region", v)}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>{COUNTRIES.filter(c => c !== "Any").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.country_region && <p className="text-xs text-red-500">{errors.country_region}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Website URL</Label>
            <Input placeholder="https://yourcompany.com" value={form.website_url} onChange={(e) => set("website_url", e.target.value)} />
            {errors.website_url && <p className="text-xs text-red-500">{errors.website_url}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Company Description <span className="text-red-500">*</span></Label>
          <Textarea placeholder="Briefly describe your company and what you do..." rows={3} value={form.company_description} onChange={(e) => set("company_description", e.target.value)} />
          {errors.company_description && <p className="text-xs text-red-500">{errors.company_description}</p>}
        </div>
      </section>

      {/* Services */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-900">Services</h2>

        <div className="space-y-1.5">
          <Label>Services Offered <span className="text-red-500">*</span></Label>
          <Input placeholder="e.g. Legal advisory, contract drafting, IP registration" value={form.services_offered} onChange={(e) => set("services_offered", e.target.value)} />
          <p className="text-xs text-slate-400">A short summary of the services you offer (comma-separated)</p>
          {errors.services_offered && <p className="text-xs text-red-500">{errors.services_offered}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Detailed Service Description <span className="text-red-500">*</span></Label>
          <Textarea placeholder="Provide a detailed description of your services, processes, and how you support ecosystem companies..." rows={4} value={form.detailed_service_description} onChange={(e) => set("detailed_service_description", e.target.value)} />
          {errors.detailed_service_description && <p className="text-xs text-red-500">{errors.detailed_service_description}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Target Company Stage <span className="text-red-500">*</span></Label>
            <Select value={form.target_company_stage} onValueChange={(v) => set("target_company_stage", v)}>
              <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
              <SelectContent>{COMPANY_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            {errors.target_company_stage && <p className="text-xs text-red-500">{errors.target_company_stage}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Pricing Model <span className="text-red-500">*</span></Label>
            <Select value={form.pricing_model} onValueChange={(v) => set("pricing_model", v)}>
              <SelectTrigger><SelectValue placeholder="Select model" /></SelectTrigger>
              <SelectContent>{PRICING_MODELS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
            {errors.pricing_model && <p className="text-xs text-red-500">{errors.pricing_model}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Current Capacity <span className="text-red-500">*</span></Label>
            <Select value={form.current_capacity} onValueChange={(v) => set("current_capacity", v)}>
              <SelectTrigger><SelectValue placeholder="Select capacity" /></SelectTrigger>
              <SelectContent>{CURRENT_CAPACITY.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.current_capacity && <p className="text-xs text-red-500">{errors.current_capacity}</p>}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-900">Contact Person</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full Name <span className="text-red-500">*</span></Label>
            <Input placeholder="Alex Tan" value={form.contact_person_name} onChange={(e) => set("contact_person_name", e.target.value)} />
            {errors.contact_person_name && <p className="text-xs text-red-500">{errors.contact_person_name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Email <span className="text-red-500">*</span></Label>
            <Input type="email" placeholder="alex@company.com" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
            {errors.contact_email && <p className="text-xs text-red-500">{errors.contact_email}</p>}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-8">
          Submit Registration
        </Button>
      </div>
    </form>
  );
}
