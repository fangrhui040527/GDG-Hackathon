export const APP_NAME = "NexusAI";
export const APP_TAGLINE = "Ecosystem Management Platform";

export const PROGRAMME_CATEGORIES = [
  "Fintech",
  "Healthcare",
  "Sustainability",
  "EdTech",
  "AgriTech",
  "DeepTech",
  "E-Commerce",
  "Logistics",
  "CleanEnergy",
  "Other",
] as const;

export const COMPANY_STAGES = [
  "Pre-Seed",
  "Seed",
  "Series A",
  "Series B",
  "Growth",
  "Any",
] as const;

export const COUNTRIES = [
  "Malaysia",
  "Singapore",
  "Indonesia",
  "Thailand",
  "Philippines",
  "Vietnam",
  "United States",
  "United Kingdom",
  "Germany",
  "Japan",
  "South Korea",
  "Australia",
  "India",
  "UAE",
  "Any",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted to Admin",
  pending_review: "Pending Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  published: "Published",
  rejected: "Rejected",
  active: "Active",
};

export const WIZARD_STEPS = [
  {
    id: 1,
    title: "Basic Information",
    description: "Programme name, description, category, and dates",
  },
  {
    id: 2,
    title: "Target Criteria",
    description: "Industry, country, and company stage targets",
  },
  {
    id: 3,
    title: "Resource Requirements",
    description: "Required mentors, partners, companies, and service providers",
  },
  {
    id: 4,
    title: "Eligibility",
    description: "Eligibility criteria and application requirements",
  },
  {
    id: 5,
    title: "Review & Submit",
    description: "Review all programme details before submission",
  },
];

export const FORM_HUB_LINKS = [
  {
    id: "company",
    title: "Company Registration Form",
    description:
      "Register your startup or company to join the NexusAI ecosystem.",
    icon: "Building2",
    color: "blue",
    url: "https://forms.google.com/company-registration",
  },
  {
    id: "mentor",
    title: "Mentor Registration Form",
    description:
      "Sign up as a mentor and support high-growth startups in our programmes.",
    icon: "UserCheck",
    color: "purple",
    url: "https://forms.google.com/mentor-registration",
  },
  {
    id: "partner",
    title: "Partner Registration Form",
    description:
      "Register as an ecosystem partner to co-create programmes and opportunities.",
    icon: "Handshake",
    color: "green",
    url: "https://forms.google.com/partner-registration",
  },
  {
    id: "service_provider",
    title: "Service Provider Registration Form",
    description:
      "Register your services to support companies in our ecosystem programmes.",
    icon: "Wrench",
    color: "orange",
    url: "https://forms.google.com/service-provider-registration",
  },
];
