import FormCard from "@/components/form-hub/FormCard";

const FORMS = [
  {
    id: "company",
    title: "Company Registration Form",
    description:
      "Register your startup or company to join the NexusAI ecosystem and be considered for active programmes.",
    colorClass: "bg-blue-500",
    iconBgClass: "bg-blue-50",
    url: "/organizer/form-hub/company",
  },
  {
    id: "mentor",
    title: "Mentor Registration Form",
    description:
      "Sign up as a mentor and support high-growth startups in our ecosystem programmes.",
    colorClass: "bg-purple-500",
    iconBgClass: "bg-purple-50",
    url: "/organizer/form-hub/mentor",
  },
  {
    id: "partner",
    title: "Partner Registration Form",
    description:
      "Register as an ecosystem partner to co-create programmes and open market opportunities for startups.",
    colorClass: "bg-emerald-500",
    iconBgClass: "bg-emerald-50",
    url: "/organizer/form-hub/partner",
  },
  {
    id: "service_provider",
    title: "Service Provider Registration Form",
    description:
      "Register your services — legal, cloud, finance, or more — to support companies in our ecosystem.",
    colorClass: "bg-orange-500",
    iconBgClass: "bg-orange-50",
    url: "/organizer/form-hub/service-provider",
  },
];

export default function OrganizerFormHubPage() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Form Hub</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Share registration forms with companies, mentors, partners, and service providers.
        </p>
      </div>
      <div className="p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {FORMS.map((form) => (
            <FormCard key={form.id} {...form} />
          ))}
        </div>
      </div>
    </div>
  );
}
