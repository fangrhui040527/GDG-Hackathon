"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerCompany } from "@/lib/api";

export default function CompanyRegistrationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    company_description: "",
    country: "",
    industry: "",
    business_stage: "",
    support_needed: "",
    availability: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await registerCompany(form);
      alert("Company registered successfully!");
      router.push("/organizer/form-hub");
    } catch {
      alert("Failed to register company. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Company Registration</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Register your startup or company to join the NexusAI ecosystem.
        </p>
      </div>

      <div className="p-8">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-8">
            <div className="space-y-1.5">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={form.company_name}
                onChange={(e) => update("company_name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company_description">Company Description</Label>
              <Textarea
                id="company_description"
                rows={3}
                placeholder="What does your company do?"
                value={form.company_description}
                onChange={(e) => update("company_description", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g. FinTech, HealthTech"
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="business_stage">Business Stage</Label>
                <Input
                  id="business_stage"
                  placeholder="e.g. Seed, Series A, Growth"
                  value={form.business_stage}
                  onChange={(e) => update("business_stage", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  placeholder="e.g. Full-time, Part-time"
                  value={form.availability}
                  onChange={(e) => update("availability", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="support_needed">Support Needed</Label>
              <Textarea
                id="support_needed"
                rows={2}
                placeholder="What kind of support is your company looking for?"
                value={form.support_needed}
                onChange={(e) => update("support_needed", e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Register Company"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
