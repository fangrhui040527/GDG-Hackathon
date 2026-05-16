"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerPartner } from "@/lib/api";

export default function PartnerRegistrationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    organisation_name: "",
    organisation_type: "Personal",
    country: "",
    website: "",
    contact_person_name: "",
    contact_email: "",
    organisation_description: "",
    industries_of_interest: "",
    requirements: "",
    preferred_collaboration_type: "",
    resources_provided: "",
    support_offered: "",
    support_capacity: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await registerPartner(form);
      alert("Partner registered successfully!");
      router.push("/organizer/form-hub");
    } catch {
      alert("Failed to register partner. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Partner Registration</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Register as an ecosystem partner to co-create programmes and open market opportunities.
        </p>
      </div>

      <div className="p-8">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="organisation_name">Organisation Name *</Label>
                <Input
                  id="organisation_name"
                  value={form.organisation_name}
                  onChange={(e) => update("organisation_name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="organisation_type">Organisation Type</Label>
                <select
                  id="organisation_type"
                  value={form.organisation_type}
                  onChange={(e) => update("organisation_type", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Personal">Personal</option>
                  <option value="Business">Business</option>
                  <option value="Listed">Listed</option>
                  <option value="International">International</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="organisation_description">Organisation Description</Label>
              <Textarea
                id="organisation_description"
                rows={3}
                value={form.organisation_description}
                onChange={(e) => update("organisation_description", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="contact_person_name">Contact Person</Label>
                <Input
                  id="contact_person_name"
                  value={form.contact_person_name}
                  onChange={(e) => update("contact_person_name", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => update("contact_email", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="industries_of_interest">Industries of Interest</Label>
                <Input
                  id="industries_of_interest"
                  placeholder="e.g. FinTech, HealthTech"
                  value={form.industries_of_interest}
                  onChange={(e) => update("industries_of_interest", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="resources_provided">Resources Provided</Label>
              <Textarea
                id="resources_provided"
                rows={2}
                placeholder="What resources can your organisation provide?"
                value={form.resources_provided}
                onChange={(e) => update("resources_provided", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="support_offered">Support Offered</Label>
              <Textarea
                id="support_offered"
                rows={2}
                placeholder="What kind of support can you offer to startups?"
                value={form.support_offered}
                onChange={(e) => update("support_offered", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="preferred_collaboration_type">Collaboration Type</Label>
                <Input
                  id="preferred_collaboration_type"
                  placeholder="e.g. Sponsorship, Mentoring"
                  value={form.preferred_collaboration_type}
                  onChange={(e) => update("preferred_collaboration_type", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="support_capacity">Support Capacity</Label>
                <Input
                  id="support_capacity"
                  placeholder="e.g. 5 startups per cohort"
                  value={form.support_capacity}
                  onChange={(e) => update("support_capacity", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                rows={2}
                placeholder="Any requirements from startups you work with?"
                value={form.requirements}
                onChange={(e) => update("requirements", e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Register as Partner"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
