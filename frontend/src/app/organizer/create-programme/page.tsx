"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WIZARD_STEPS, PROGRAMME_CATEGORIES, COMPANY_STAGES, COUNTRIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useProgrammeStore } from "@/lib/store";
import type { Programme, ProgrammeCategory, CompanyStage } from "@/types";

export default function CreateProgrammePage() {
  const router = useRouter();
  const { addProgramme } = useProgrammeStore();
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

  const handleSubmit = () => {
    const now = new Date().toISOString();
    const newProgramme: Programme = {
      id: `prog-${Date.now()}`,
      name: form.name || "Untitled Programme",
      description: form.description || "",
      category: (form.category as ProgrammeCategory) || "Other",
      status: "draft",
      startDate: form.startDate || now.slice(0, 10),
      endDate: form.endDate || undefined,
      requirements: {
        targetIndustry: form.targetIndustry,
        targetCountry: form.targetCountry,
        targetCompanyStage: (form.targetCompanyStage as CompanyStage) || "Any",
        requiredMentors: Number(form.requiredMentors),
        requiredCompanies: Number(form.requiredCompanies),
        requiredPartners: Number(form.requiredPartners),
        requiredServiceProviders: Number(form.requiredServiceProviders),
        eligibilityCriteria: form.eligibilityCriteria,
      },
      progress: { label: "Draft Progress", value: 0, status: "0%" },
      organiserId: "org-001",
      organiserName: "Sarah Chen",
      createdAt: now,
      updatedAt: now,
    };
    addProgramme(newProgramme);
    router.push("/organizer/my-programmes");
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
            <div className="flex items-center justify-between">
              {WIZARD_STEPS.map((s, i) => (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
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
                        "mt-1 hidden text-center text-xs font-medium sm:block",
                        step === s.id ? "text-blue-600" : "text-slate-400"
                      )}
                    >
                      {s.title}
                    </p>
                  </div>
                  {i < WIZARD_STEPS.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-0.5 flex-1",
                        step > s.id ? "bg-blue-600" : "bg-slate-200"
                      )}
                    />
                  )}
                </div>
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
                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => update("startDate", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={form.endDate}
                      onChange={(e) => update("endDate", e.target.value)}
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
                  Specify how many of each actor type you need. NexusAI AI will use these to generate match results.
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
              <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  Review your programme details before running AI matching.
                </p>
                <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                  {[
                    { label: "Name", value: form.name || "—" },
                    { label: "Category", value: form.category || "—" },
                    { label: "Start Date", value: form.startDate || "—" },
                    { label: "Target Industry", value: form.targetIndustry || "—" },
                    { label: "Target Country", value: form.targetCountry || "—" },
                    { label: "Company Stage", value: form.targetCompanyStage || "—" },
                    { label: "Required Companies", value: String(form.requiredCompanies) },
                    { label: "Required Mentors", value: String(form.requiredMentors) },
                    { label: "Required Partners", value: String(form.requiredPartners) },
                    {
                      label: "Required Service Providers",
                      value: String(form.requiredServiceProviders),
                    },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-sm text-slate-500">{label}</span>
                      <span className="text-sm font-medium text-slate-800">{value}</span>
                    </div>
                  ))}
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
