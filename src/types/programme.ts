export type ProgrammeStatus =
  | "draft"
  | "submitted"
  | "pending_review"
  | "changes_requested"
  | "approved"
  | "published"
  | "rejected"
  | "active";

export type ProgrammeCategory =
  | "Fintech"
  | "Healthcare"
  | "Sustainability"
  | "EdTech"
  | "AgriTech"
  | "DeepTech"
  | "E-Commerce"
  | "Logistics"
  | "CleanEnergy"
  | "Other";

export type CompanyStage =
  | "Pre-Seed"
  | "Seed"
  | "Series A"
  | "Series B"
  | "Growth"
  | "Any";

export interface ProgrammeRequirements {
  targetIndustry: string;
  targetCountry: string;
  targetCompanyStage: CompanyStage;
  requiredMentors: number;
  requiredCompanies: number;
  requiredPartners: number;
  requiredServiceProviders: number;
  eligibilityCriteria: string;
}

export interface ProgrammeProgress {
  label: string;
  value: number;
  status?: string;
}

export interface Programme {
  id: string;
  name: string;
  description: string;
  category: ProgrammeCategory;
  status: ProgrammeStatus;
  startDate: string;
  endDate?: string;
  coverImage?: string;
  requirements: ProgrammeRequirements;
  progress: ProgrammeProgress;
  organiserId: string;
  organiserName: string;
  submittedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgrammeFormStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export interface ProgrammeFormData {
  name: string;
  description: string;
  category: ProgrammeCategory | "";
  startDate: string;
  endDate: string;
  targetIndustry: string;
  targetCountry: string;
  targetCompanyStage: CompanyStage | "";
  requiredMentors: number;
  requiredCompanies: number;
  requiredPartners: number;
  requiredServiceProviders: number;
  eligibilityCriteria: string;
}
