"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerMentor, uploadMentorCv, uploadMentorVideo } from "@/lib/api";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export default function MentorRegistrationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    short_bio: "",
    job_title: "",
    organization_name: "",
    linkedin_profile_url: "",
    preferred_company_stage: "",
    preferred_industry: "",
    type_of_support_offered: "",
    available_hours_per_month: "",
    max_companies_to_mentor: "",
    current_availability_status: "Available",
    country: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((cvFile && cvFile.size > MAX_UPLOAD_BYTES) || (videoFile && videoFile.size > MAX_UPLOAD_BYTES)) {
      alert("Optional CV and video uploads must each be under 2MB.");
      return;
    }
    setSubmitting(true);
    try {
      const mentor = await registerMentor({
        ...form,
        available_hours_per_month: form.available_hours_per_month
          ? parseInt(form.available_hours_per_month)
          : null,
        max_companies_to_mentor: form.max_companies_to_mentor
          ? parseInt(form.max_companies_to_mentor)
          : null,
      });
      const mentorId = String(mentor.mentor_id ?? mentor.id ?? "");
      let mediaWarning = "";
      try {
        if (mentorId && cvFile) await uploadMentorCv(mentorId, cvFile);
        if (mentorId && videoFile) await uploadMentorVideo(mentorId, videoFile);
      } catch (error) {
        mediaWarning = ` Optional media upload failed: ${error instanceof Error ? error.message : String(error)}`;
      }
      alert(`Mentor registered successfully!${mediaWarning}`);
      router.push("/organizer/form-hub");
    } catch {
      alert("Failed to register mentor. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Mentor Registration</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Register as a mentor to support startups in the ecosystem.
        </p>
      </div>

      <div className="p-8">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => update("full_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="job_title">Job Title</Label>
                <Input
                  id="job_title"
                  value={form.job_title}
                  onChange={(e) => update("job_title", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="organization_name">Organisation</Label>
                <Input
                  id="organization_name"
                  value={form.organization_name}
                  onChange={(e) => update("organization_name", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="short_bio">Short Bio</Label>
              <Textarea
                id="short_bio"
                rows={3}
                value={form.short_bio}
                onChange={(e) => update("short_bio", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="preferred_industry">Preferred Industry</Label>
                <Input
                  id="preferred_industry"
                  value={form.preferred_industry}
                  onChange={(e) => update("preferred_industry", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="preferred_company_stage">Preferred Company Stage</Label>
                <Input
                  id="preferred_company_stage"
                  placeholder="e.g. Personal Business, Listed Company"
                  value={form.preferred_company_stage}
                  onChange={(e) => update("preferred_company_stage", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type_of_support_offered">Type of Support Offered</Label>
              <Textarea
                id="type_of_support_offered"
                rows={2}
                placeholder="e.g. Business strategy, fundraising, technical guidance"
                value={form.type_of_support_offered}
                onChange={(e) => update("type_of_support_offered", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="available_hours_per_month">Hours / Month</Label>
                <Input
                  id="available_hours_per_month"
                  type="number"
                  min={1}
                  value={form.available_hours_per_month}
                  onChange={(e) => update("available_hours_per_month", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="max_companies_to_mentor">Max Companies</Label>
                <Input
                  id="max_companies_to_mentor"
                  type="number"
                  min={1}
                  value={form.max_companies_to_mentor}
                  onChange={(e) => update("max_companies_to_mentor", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="current_availability_status">Availability Status</Label>
              <select
                id="current_availability_status"
                value={form.current_availability_status}
                onChange={(e) => update("current_availability_status", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="linkedin_profile_url">LinkedIn URL</Label>
              <Input
                id="linkedin_profile_url"
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={form.linkedin_profile_url}
                onChange={(e) => update("linkedin_profile_url", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cv_file">CV / Resume PDF</Label>
                <Input
                  id="cv_file"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="video_file">Video Introduction</Label>
                <Input
                  id="video_file"
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Register as Mentor"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
