"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerServiceProvider } from "@/lib/api";

export default function ServiceProviderRegistrationPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    organisation_name: "",
    website_url: "",
    contact_person_name: "",
    contact_email: "",
    company_description: "",
    services_offered: "",
    detailed_service_description: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await registerServiceProvider(form);
      alert("Service provider registered successfully!");
      router.push("/organizer/form-hub");
    } catch {
      alert("Failed to register service provider. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Service Provider Registration</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Register your services to support companies in our ecosystem.
        </p>
      </div>

      <div className="p-8">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-200 bg-white p-8">
            <div className="space-y-1.5">
              <Label htmlFor="organisation_name">Organisation Name *</Label>
              <Input
                id="organisation_name"
                value={form.organisation_name}
                onChange={(e) => update("organisation_name", e.target.value)}
                required
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

            <div className="space-y-1.5">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                placeholder="https://example.com"
                value={form.website_url}
                onChange={(e) => update("website_url", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company_description">Company Description</Label>
              <Textarea
                id="company_description"
                rows={3}
                value={form.company_description}
                onChange={(e) => update("company_description", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="services_offered">Services Offered</Label>
              <Input
                id="services_offered"
                placeholder="e.g. Legal, Cloud, Finance, HR"
                value={form.services_offered}
                onChange={(e) => update("services_offered", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="detailed_service_description">Detailed Service Description</Label>
              <Textarea
                id="detailed_service_description"
                rows={4}
                placeholder="Describe your services in detail, including scope and past clients if applicable."
                value={form.detailed_service_description}
                onChange={(e) => update("detailed_service_description", e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Register as Service Provider"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
