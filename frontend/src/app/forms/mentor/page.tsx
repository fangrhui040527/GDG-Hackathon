"use client";

import { useState } from "react";
import { UserCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useFormStore } from "@/lib/form-store";
import { registerMentor } from "@/lib/api";
import { COUNTRIES, COMPANY_STAGES } from "@/lib/constants";

const INDUSTRIES = [
  "Fintech", "Healthcare", "Sustainability", "EdTech", "AgriTech",
  "DeepTech", "E-Commerce", "Logistics", "CleanEnergy", "General Business",
  "Marketing", "Legal", "Finance", "Product Management", "Engineering", "Other",
];

const SUPPORT_TYPES = [
  "Business Strategy", "Product Development", "Fundraising & Investor Relations",
  "Marketing & Growth", "Technical Mentorship", "Legal & Compliance",
  "Financial Planning", "Operations & Scaling", "HR & Talent", "Networking & BD",
];

const AVAILABILITY_STATUSES = [
  "Available – actively accepting mentees",
  "Limited – accepting 1-2 more",
  "Waitlist – full but open to future requests",
  "Unavailable – not accepting new mentees",
];

const EMPTY = {
  full_name: "", email: "", job_title: "", organization_name: "",
  linkedin_profile_url: "", short_bio: "", cv: "", video: "",
  preferred_company_stage: "", preferred_industry: "", type_of_support_offered: "",
  available_hours_per_month: "", max_companies_to_mentor: "",
  current_availability_status: "", country: "",
};

export default function MentorRegistrationForm() {
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
    if (!form.full_name.trim()) e.full_name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.job_title.trim()) e.job_title = "Job title is required";
    if (!form.organization_name.trim()) e.organization_name = "Organisation name is required";
    if (form.linkedin_profile_url && !/^https?:\/\//i.test(form.linkedin_profile_url))
      e.linkedin_profile_url = "URL must start with http:// or https://";
    if (!form.short_bio.trim()) e.short_bio = "Short bio is required";
    if (!form.preferred_company_stage) e.preferred_company_stage = "Preferred company stage is required";
    if (!form.preferred_industry) e.preferred_industry = "Preferred industry is required";
    if (!form.type_of_support_offered) e.type_of_support_offered = "Type of support is required";
    if (!form.available_hours_per_month) e.available_hours_per_month = "Available hours per month is required";
    else if (isNaN(Number(form.available_hours_per_month)) || Number(form.available_hours_per_month) < 1)
      e.available_hours_per_month = "Must be a positive number";
    if (!form.max_companies_to_mentor) e.max_companies_to_mentor = "Max companies to mentor is required";
    else if (isNaN(Number(form.max_companies_to_mentor)) || Number(form.max_companies_to_mentor) < 1)
      e.max_companies_to_mentor = "Must be a positive number";
    if (!form.current_availability_status) e.current_availability_status = "Availability status is required";
    if (!form.country) e.country = "Country is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    try {
      await registerMentor({
        full_name: form.full_name,
        email: form.email,
        job_title: form.job_title,
        organization_name: form.organization_name,
        linkedin_profile_url: form.linkedin_profile_url,
        short_bio: form.short_bio,
        preferred_company_stage: form.preferred_company_stage,
        preferred_industry: form.preferred_industry,
        type_of_support_offered: form.type_of_support_offered,
        available_hours_per_month: form.available_hours_per_month ? Number(form.available_hours_per_month) : null,
        max_companies_to_mentor: form.max_companies_to_mentor ? Number(form.max_companies_to_mentor) : null,
        current_availability_status: form.current_availability_status || "Available",
        country: form.country,
      });
      addSubmission("mentor", form);
      setSubmitted(true);
    } catch {
      setErrors({ full_name: "Failed to register. Please try again." });
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
        <p className="text-slate-500 mb-6">
          Thank you, <strong>{form.full_name}</strong>. Our team will review your mentor application.
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
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
          <UserCheck className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mentor Registration</h1>
          <p className="text-sm text-slate-500">Support high-growth startups in NexusAI ecosystem programmes</p>
        </div>
      </div>

      {/* Personal Information */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-900">Personal Information</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Full Name <span className="text-red-500">*</span></Label>
            <Input placeholder="Dr. Jane Smith" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} />
            {errors.full_name && <p className="text-xs text-red-500">{errors.full_name}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Email <span className="text-red-500">*</span></Label>
            <Input type="email" placeholder="jane@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Job Title <span className="text-red-500">*</span></Label>
            <Input placeholder="e.g. CTO, Partner, Director" value={form.job_title} onChange={(e) => set("job_title", e.target.value)} />
            {errors.job_title && <p className="text-xs text-red-500">{errors.job_title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Organisation Name <span className="text-red-500">*</span></Label>
            <Input placeholder="Company or Institution" value={form.organization_name} onChange={(e) => set("organization_name", e.target.value)} />
            {errors.organization_name && <p className="text-xs text-red-500">{errors.organization_name}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>LinkedIn Profile URL</Label>
            <Input placeholder="https://linkedin.com/in/yourprofile" value={form.linkedin_profile_url} onChange={(e) => set("linkedin_profile_url", e.target.value)} />
            {errors.linkedin_profile_url && <p className="text-xs text-red-500">{errors.linkedin_profile_url}</p>}
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
          <Label>Short Bio <span className="text-red-500">*</span></Label>
          <Textarea placeholder="A brief professional summary — who you are, your background, and what drives you to mentor..." rows={3} value={form.short_bio} onChange={(e) => set("short_bio", e.target.value)} />
          {errors.short_bio && <p className="text-xs text-red-500">{errors.short_bio}</p>}
        </div>
      </section>

      {/* Supporting Documents */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-900">Supporting Documents <span className="text-xs font-normal text-slate-400">(optional)</span></h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>CV / Resume URL</Label>
            <Input placeholder="https://drive.google.com/..." value={form.cv} onChange={(e) => set("cv", e.target.value)} />
            <p className="text-xs text-slate-400">Link to your CV on Google Drive, Dropbox, or similar</p>
          </div>
          <div className="space-y-1.5">
            <Label>Video Introduction URL</Label>
            <Input placeholder="https://youtube.com/..." value={form.video} onChange={(e) => set("video", e.target.value)} />
            <p className="text-xs text-slate-400">Short intro video (YouTube, Loom, etc.) — highly recommended</p>
          </div>
        </div>
      </section>

      {/* Mentoring Preferences */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-semibold text-slate-900">Mentoring Preferences</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Preferred Company Stage <span className="text-red-500">*</span></Label>
            <Select value={form.preferred_company_stage} onValueChange={(v) => set("preferred_company_stage", v)}>
              <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
              <SelectContent>{COMPANY_STAGES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            {errors.preferred_company_stage && <p className="text-xs text-red-500">{errors.preferred_company_stage}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Preferred Industry <span className="text-red-500">*</span></Label>
            <Select value={form.preferred_industry} onValueChange={(v) => set("preferred_industry", v)}>
              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
            {errors.preferred_industry && <p className="text-xs text-red-500">{errors.preferred_industry}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Type of Support Offered <span className="text-red-500">*</span></Label>
          <Select value={form.type_of_support_offered} onValueChange={(v) => set("type_of_support_offered", v)}>
            <SelectTrigger><SelectValue placeholder="Primary support type" /></SelectTrigger>
            <SelectContent>{SUPPORT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
          </Select>
          {errors.type_of_support_offered && <p className="text-xs text-red-500">{errors.type_of_support_offered}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Available Hours / Month <span className="text-red-500">*</span></Label>
            <Input type="number" min={1} placeholder="e.g. 8" value={form.available_hours_per_month} onChange={(e) => set("available_hours_per_month", e.target.value)} />
            {errors.available_hours_per_month && <p className="text-xs text-red-500">{errors.available_hours_per_month}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Max Companies to Mentor <span className="text-red-500">*</span></Label>
            <Input type="number" min={1} placeholder="e.g. 3" value={form.max_companies_to_mentor} onChange={(e) => set("max_companies_to_mentor", e.target.value)} />
            {errors.max_companies_to_mentor && <p className="text-xs text-red-500">{errors.max_companies_to_mentor}</p>}
          </div>
          <div className="space-y-1.5 sm:col-span-1">
            <Label>Current Availability Status <span className="text-red-500">*</span></Label>
            <Select value={form.current_availability_status} onValueChange={(v) => set("current_availability_status", v)}>
              <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
              <SelectContent>{AVAILABILITY_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            {errors.current_availability_status && <p className="text-xs text-red-500">{errors.current_availability_status}</p>}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-8">
          Submit Application
        </Button>
      </div>
    </form>
  );
}
