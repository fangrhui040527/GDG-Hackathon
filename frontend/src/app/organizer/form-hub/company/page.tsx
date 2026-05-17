"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerCompany, uploadCompanyVideo } from "@/lib/api";
import { COMPANY_STAGES } from "@/lib/constants";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export default function CompanyRegistrationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
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
    if (videoFile && videoFile.size > MAX_UPLOAD_BYTES) {
      alert("Company video must be under 2MB.");
      return;
    }
    setSubmitting(true);
    try {
      const company = await registerCompany(form);
      const companyId = String(company.company_id ?? company.id ?? "");
      let mediaWarning = "";

      if (videoFile) {
        if (!companyId) {
          mediaWarning = " Company was created, but the API response did not include a company ID for media upload.";
        } else {
          try {
            await uploadCompanyVideo(companyId, videoFile);
          } catch {
            mediaWarning = " Company was created, but the intro video upload failed.";
          }
        }
      }

      alert(`Company registered successfully!${mediaWarning}`);
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
          Register your startup or company to join the YokoYoko AI ecosystem.
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
                <select
                  id="business_stage"
                  value={form.business_stage}
                  onChange={(e) => update("business_stage", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select business stage</option>
                  {COMPANY_STAGES.filter((stage) => stage !== "Any").map((stage) => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
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

            <div className="space-y-1.5">
              <Label htmlFor="video">Company Intro Video</Label>
              <Input
                id="video"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-slate-500">
                Optional. MP4, WebM, or MOV under 2MB.
              </p>
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
