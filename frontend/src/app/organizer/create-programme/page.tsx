"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WIZARD_STEPS, PROGRAMME_CATEGORIES, COMPANY_STAGES, COUNTRIES } from "@/lib/constants";
import { createProgramme } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { ProgrammeCategory, CompanyStage } from "@/types";

export default function CreateProgrammePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = WIZARD_STEPS.length;

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    targetIndustry: "",
    targetCountry: "",
    targetCompanyStage: "",
    requiredMentors: 4,
    requiredCompanies: 10,
    requiredPartners: 3,
    requiredServiceProviders: 2,
    eligibilityCriteria: "",
  });

  const update = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const dto = await createProgramme({
        name: form.name,
        description: form.description,
        category: form.category,
        start_date: form.startDate,
        end_date: form.endDate || null,
        target_industry: form.targetIndustry,
        target_country: form.targetCountry,
        target_company_stage: form.targetCompanyStage,
        required_mentors: form.requiredMentors,
        required_companies: form.requiredCompanies,
        required_partners: form.requiredPartners,
        required_service_providers: form.requiredServiceProviders,
        eligibility_criteria: form.eligibilityCriteria,
        organiser_name: "Organiser",
      });
      router.push(`/organizer/programmes/${dto.programme_id}/ai-matching`);
    } catch {
      alert("Failed to create programme");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Create Programme</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Set up a new programme or event for your ecosystem.
        </p>
      </div>

      <div className="p-8">
        <div className="mx-auto max-w-3xl">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-start">
              {WIZARD_STEPS.map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors",
                        step > s.id
                          ? "bg-blue-600 text-white"
                          : step === s.id
                          ? "border-2 border-blue-600 text-blue-600"
                          : "border-2 border-slate-200 text-slate-400"
                      )}
                    >
                      {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                    </div>
                    <p
                      className={cn(
                        "mt-1 hidden text-center text-xs font-medium sm:block max-w-[80px]",
                        step === s.id ? "text-blue-600" : "text-slate-400"
                      )}
                    >
                      {s.title}
                    </p>
                  </div>
                  {i < WIZARD_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mt-4 h-0.5 flex-1 mx-2",
                        step > s.id ? "bg-blue-600" : "bg-slate-200"
                      )}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900">
                {WIZARD_STEPS[step - 1].title}
              </h2>
              <p className="text-sm text-slate-500">{WIZARD_STEPS[step - 1].description}</p>
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Programme Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Global Fintech Accelerator 2025"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the programme goals, structure, and expected outcomes..."
                    rows={4}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={(v) => update("category", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROGRAMME_CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <DatePicker
                      id="startDate"
                      value={form.startDate}
                      onChange={(v) => update("startDate", v)}
                      placeholder="Pick start date"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="endDate">End Date</Label>
                    <DatePicker
                      id="endDate"
                      value={form.endDate}
                      onChange={(v) => update("endDate", v)}
                      placeholder="Pick end date"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Target Criteria */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="targetIndustry">Target Industry *</Label>
                  <Input
                    id="targetIndustry"
                    placeholder="e.g. Financial Technology"
                    value={form.targetIndustry}
                    onChange={(e) => update("targetIndustry", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Target Country *</Label>
                  <Select
                    value={form.targetCountry}
                    onValueChange={(v) => update("targetCountry", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Target Company Stage *</Label>
                  <Select
                    value={form.targetCompanyStage}
                    onValueChange={(v) => update("targetCompanyStage", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select company stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_STAGES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Resource Requirements */}
            {step === 3 && (
              <div className="space-y-5">
                <p className="text-sm text-slate-500">
                  Specify how many of each actor type you need. YokoYoko AI will use these to generate match results.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "requiredCompanies", label: "Required Companies" },
                    { key: "requiredMentors", label: "Required Mentors" },
                    { key: "requiredPartners", label: "Required Partners" },
                    { key: "requiredServiceProviders", label: "Required Service Providers" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-1.5">
                      <Label htmlFor={key}>{label}</Label>
                      <Input
                        id={key}
                        type="number"
                        min={1}
                        max={50}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => update(key, Number(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Eligibility */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="eligibility">Eligibility Criteria *</Label>
                  <Textarea
                    id="eligibility"
                    placeholder="Describe who is eligible to apply, any prerequisites, requirements, and restrictions..."
                    rows={6}
                    value={form.eligibilityCriteria}
                    onChange={(e) => update("eligibilityCriteria", e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="space-y-5">
                <p className="text-sm text-slate-500">
                  Review your programme details before running AI matching.
                </p>

                {/* Programme Identity */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Programme</p>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    {[
                      { label: "Name", value: form.name || "—" },
                      { label: "Category", value: form.category || "—" },
                      { label: "Start Date", value: form.startDate || "—" },
                      { label: "End Date", value: form.endDate || "—" },
                    ].map(({ label, value }, i, arr) => (
                      <div
                        key={label}
                        className={`flex items-center justify-between px-4 py-3 bg-slate-50 ${i < arr.length - 1 ? "border-b border-slate-200" : ""}`}
                      >
                        <span className="text-sm text-slate-500 font-medium">{label}</span>
                        <span className="text-sm font-semibold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Target Criteria */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Target Criteria</p>
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    {[
                      { label: "Industry", value: form.targetIndustry || "—" },
                      { label: "Country", value: form.targetCountry || "—" },
                      { label: "Company Stage", value: form.targetCompanyStage || "—" },
                    ].map(({ label, value }, i, arr) => (
                      <div
                        key={label}
                        className={`flex items-center justify-between px-4 py-3 bg-slate-50 ${i < arr.length - 1 ? "border-b border-slate-200" : ""}`}
                      >
                        <span className="text-sm text-slate-500 font-medium">{label}</span>
                        <span className="text-sm font-semibold text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Capacity</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Companies", value: form.requiredCompanies, color: "bg-blue-50 border-blue-200 text-blue-700" },
                      { label: "Mentors", value: form.requiredMentors, color: "bg-purple-50 border-purple-200 text-purple-700" },
                      { label: "Partners", value: form.requiredPartners, color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
                      { label: "Service Providers", value: form.requiredServiceProviders, color: "bg-orange-50 border-orange-200 text-orange-700" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className={`rounded-xl border px-4 py-3 flex flex-col gap-1 ${color}`}>
                        <span className="text-xs font-medium opacity-75">{label}</span>
                        <span className="text-2xl font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="mt-8 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 1}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              {step < totalSteps ? (
                <Button variant="navy" onClick={handleNext} className="gap-2">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="navy" onClick={handleSubmit} className="gap-2">
                  Run AI Matching
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
