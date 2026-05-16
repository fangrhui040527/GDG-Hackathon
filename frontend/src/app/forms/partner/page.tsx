"use client";

import { useState } from "react";
import { Handshake, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useFormStore } from "@/lib/form-store";
import { registerPartner } from "@/lib/api";
import { COUNTRIES } from "@/lib/constants";

const ORG_TYPES = ["Personal", "Business", "Listed", "International"];

const COLLABORATION_TYPES = [
  "Programme Co-creation", "Market Access & Distribution", "Funding / Investment",
  "Technology & Cloud Resources", "Talent Development", "Research Collaboration",
  "Mentorship Network", "International Expansion", "Brand & PR Partnership",
];

const INDUSTRIES = [
  "Fintech", "Healthcare", "Sustainability", "EdTech", "AgriTech",
  "DeepTech", "E-Commerce", "Logistics", "CleanEnergy", "General Business",
  "Marketing", "Legal", "Finance", "Engineering", "Other",
];

const EMPTY = {
  organisation_name: "", organisation_type: "", country: "", website: "",
  contact_person_name: "", contact_email: "", organisation_description: "",
  requirements: "", preferred_collaboration_type: "",
  resources_provided: "", support_offered: "", support_capacity: "",
};

export default function PartnerRegistrationForm() {
  const { addSubmission } = useFormStore();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [form, setForm] = useState({ ...EMPTY });

  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry) ? prev.filter((i) => i !== industry) : [...prev, industry]
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.organisation_name.trim()) e.organisation_name = "Organisation name is required";
    if (!form.organisation_type) e.organisation_type = "Organisation type is required";
    if (!form.country) e.country = "Country is required";
    if (form.website && !/^https?:\/\//i.test(form.website)) e.website = "URL must start with http:// or https://";
    if (!form.contact_person_name.trim()) e.contact_person_name = "Contact person name is required";
    if (!form.contact_email.trim()) e.contact_email = "Contact email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) e.contact_email = "Invalid email";
    if (!form.organisation_description.trim()) e.organisation_description = "Organisation description is required";
    if (!form.preferred_collaboration_type) e.preferred_collaboration_type = "Preferred collaboration type is required";
    if (!form.support_offered.trim()) e.support_offered = "Support offered is required";
    if (!form.support_capacity.trim()) e.support_capacity = "Support capacity is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    try {
      await registerPartner({
        ...form,
        industries_of_interest: selectedIndustries.join(", "),
      });
      addSubmission("partner", { ...form, industries_of_interest: selectedIndustries.join(", ") });
      setSubmitted(true);
    } catch {
      setErrors({ organisation_name: "Failed to register. Please try again." });
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
          Thank you, <strong>{form.organisation_name}</strong>. We'll reach out to discuss partnership opportunities.
        </p>
        <Button variant="outline" onClick={() => { setSubmitted(false); setSelectedIndustries([]); setForm({ ...EMPTY }); }}>
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
          <Handshake className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Partner Registration</h1>
          <p className="text-sm text-slate-500">Co-create programmes and open market opportunities for startups</p>
        </div>
      </div>

      {/* Organisation Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-900">Organisation Details</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Organisation Name <span className="text-red-500">*</span></Label>
            <Input placeholder="e.g. Petronas Digital" value={form.organisation_name} onChange={(e) => set("organisation_name", e.target.value)} />
            {errors.organisation_name && <p className="text-xs text-red-500">{errors.organisation_name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Organisation Type <span className="text-red-500">*</span></Label>
            <Select value={form.organisation_type} onValueChange={(v) => set("organisation_type", v)}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{ORG_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            {errors.organisation_type && <p className="text-xs text-red-500">{errors.organisation_type}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Country <span className="text-red-500">*</span></Label>
            <Select value={form.country} onValueChange={(v) => set("country", v)}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>{COUNTRIES.filter((c) => c !== "Any").map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input placeholder="https://yourorg.com" value={form.website} onChange={(e) => set("website", e.target.value)} />
            {errors.website && <p className="text-xs text-red-500">{errors.website}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Organisation Description <span className="text-red-500">*</span></Label>
          <Textarea placeholder="Describe your organisation, mission, and what value you bring to the ecosystem..." rows={3} value={form.organisation_description} onChange={(e) => set("organisation_description", e.target.value)} />
          {errors.organisation_description && <p className="text-xs text-red-500">{errors.organisation_description}</p>}
        </div>
      </section>

      {/* Industries of Interest */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-slate-900">Industries of Interest <span className="text-xs font-normal text-slate-400">(select all that apply)</span></h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {INDUSTRIES.map((industry) => (
            <label key={industry} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedIndustries.includes(industry)}
                onChange={() => toggleIndustry(industry)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{industry}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Partnership Offer */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-900">Partnership Offer</h2>

        <div className="space-y-1.5">
          <Label>Preferred Collaboration Type <span className="text-red-500">*</span></Label>
          <Select value={form.preferred_collaboration_type} onValueChange={(v) => set("preferred_collaboration_type", v)}>
            <SelectTrigger><SelectValue placeholder="Select collaboration type" /></SelectTrigger>
            <SelectContent>{COLLABORATION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          {errors.preferred_collaboration_type && <p className="text-xs text-red-500">{errors.preferred_collaboration_type}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Resources Provided <span className="text-xs font-normal text-slate-400">(optional)</span></Label>
          <Textarea placeholder="e.g. Cloud credits, office space, data sets, testing environments..." rows={2} value={form.resources_provided} onChange={(e) => set("resources_provided", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label>Support Offered <span className="text-red-500">*</span></Label>
          <Textarea placeholder="Describe the specific support you will provide to programme participants..." rows={3} value={form.support_offered} onChange={(e) => set("support_offered", e.target.value)} />
          {errors.support_offered && <p className="text-xs text-red-500">{errors.support_offered}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Support Capacity <span className="text-red-500">*</span></Label>
          <Input placeholder="e.g. Up to 10 startups per cohort, or 50 hours/year" value={form.support_capacity} onChange={(e) => set("support_capacity", e.target.value)} />
          {errors.support_capacity && <p className="text-xs text-red-500">{errors.support_capacity}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Requirements / Expectations <span className="text-xs font-normal text-slate-400">(optional)</span></Label>
          <Textarea placeholder="Any conditions, expectations, or requirements from startups you partner with..." rows={2} value={form.requirements} onChange={(e) => set("requirements", e.target.value)} />
        </div>
      </section>

      {/* Contact */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-900">Contact Person</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full Name <span className="text-red-500">*</span></Label>
            <Input placeholder="John Doe" value={form.contact_person_name} onChange={(e) => set("contact_person_name", e.target.value)} />
            {errors.contact_person_name && <p className="text-xs text-red-500">{errors.contact_person_name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Email <span className="text-red-500">*</span></Label>
            <Input type="email" placeholder="john@yourorg.com" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} />
            {errors.contact_email && <p className="text-xs text-red-500">{errors.contact_email}</p>}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
          Submit Registration
        </Button>
      </div>
    </form>
  );
}
