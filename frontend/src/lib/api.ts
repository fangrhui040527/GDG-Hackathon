export type Mentor = {
  id: string;
  full_name: string;
  email: string;
  industries: string[];
  support_types: string[];
  stages: string[];
  languages: string[];
  capacity_score: number;
  bio?: string;
};

export type Company = {
  id: string;
  company_name: string;
  industry: string;
  stage: string;
  support_needed: string[];
  languages: string[];
  description?: string;
};

export type EventRecord = {
  id: string;
  event_name: string;
  event_type: string;
  programme_name: string;
  status: string;
};

export type MatchRecommendation = {
  entity_id: string;
  entity_name: string;
  score: number;
  fit_factors: string[];
  rationale: string;
};

export type DashboardMetrics = {
  mentors: number;
  companies: number;
  events: number;
  followups: number;
  selections: number;
  approved_selections: number;
  average_outcome_score: number;
};

/* ── Backend DTOs ────────────────────────────────────────────── */

export type ProgrammeDTO = {
  programme_id: number;
  name: string;
  description: string;
  category: string;
  status: string;
  start_date: string;
  end_date: string | null;
  cover_image: string | null;
  target_industry: string | null;
  target_country: string | null;
  target_company_stage: string | null;
  required_mentors: number;
  required_companies: number;
  required_partners: number;
  required_service_providers: number;
  eligibility_criteria: string | null;
  organiser_id: string | null;
  organiser_name: string | null;
  submitted_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ActorDTO = {
  id: number;
  name: string;
  type: string;
  category: string;
  country: string;
  status: string;
  registeredAt: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

/* ── Programme helpers ───────────────────────────────────────── */

import type { Programme, ProgrammeProgress } from "@/types/programme";
import type { ActorTableRow } from "@/types/actor";

function computeProgress(dto: ProgrammeDTO): ProgrammeProgress {
  const statusMap: Record<string, number> = {
    draft: 10,
    submitted: 30,
    pending_review: 40,
    changes_requested: 35,
    approved: 60,
    published: 80,
    active: 100,
    rejected: 0,
  };
  const value = statusMap[dto.status] ?? 0;
  return { label: dto.status.replace(/_/g, " "), value, status: dto.status };
}

export function toProgramme(dto: ProgrammeDTO): Programme {
  return {
    id: String(dto.programme_id),
    name: dto.name,
    description: dto.description,
    category: dto.category as Programme["category"],
    status: dto.status as Programme["status"],
    startDate: dto.start_date,
    endDate: dto.end_date ?? undefined,
    coverImage: dto.cover_image ?? undefined,
    requirements: {
      targetIndustry: dto.target_industry ?? "",
      targetCountry: dto.target_country ?? "",
      targetCompanyStage: (dto.target_company_stage ?? "Any") as Programme["requirements"]["targetCompanyStage"],
      requiredMentors: dto.required_mentors,
      requiredCompanies: dto.required_companies,
      requiredPartners: dto.required_partners,
      requiredServiceProviders: dto.required_service_providers,
      eligibilityCriteria: dto.eligibility_criteria ?? "",
    },
    progress: computeProgress(dto),
    organiserId: dto.organiser_id ?? "",
    organiserName: dto.organiser_name ?? "",
    submittedAt: dto.submitted_at ?? undefined,
    publishedAt: dto.published_at ?? undefined,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function toActorRow(dto: ActorDTO): ActorTableRow {
  return {
    id: `${dto.type}-${dto.id}`,
    name: dto.name,
    type: dto.type as ActorTableRow["type"],
    category: dto.category,
    country: dto.country,
    status: (dto.status === "active" ? "active" : dto.status === "pending" ? "pending" : "inactive") as ActorTableRow["status"],
    registeredAt: dto.registeredAt,
  };
}

/* ── Programmes API ──────────────────────────────────────────── */

export async function fetchProgrammes(status?: string): Promise<Programme[]> {
  const qs = status ? `?status=${status}` : "";
  const dtos = await apiGet<ProgrammeDTO[]>(`/programmes${qs}`);
  return dtos.map(toProgramme);
}

export async function fetchProgramme(id: string): Promise<Programme> {
  const dto = await apiGet<ProgrammeDTO>(`/programmes/${id}`);
  return toProgramme(dto);
}

export async function createProgramme(data: Record<string, unknown>): Promise<ProgrammeDTO> {
  return apiPost<ProgrammeDTO>("/programmes", data);
}

export async function submitProgramme(id: string): Promise<ProgrammeDTO> {
  return apiPost<ProgrammeDTO>(`/programmes/${id}/submit`, {});
}

export async function approveProgramme(id: string): Promise<ProgrammeDTO> {
  return apiPost<ProgrammeDTO>(`/programmes/${id}/approve`, {});
}

export async function publishProgramme(id: string): Promise<ProgrammeDTO> {
  return apiPost<ProgrammeDTO>(`/programmes/${id}/publish`, {});
}

export async function rejectProgramme(id: string): Promise<ProgrammeDTO> {
  return apiPost<ProgrammeDTO>(`/programmes/${id}/reject`, {});
}

export async function requestChangesProgramme(id: string): Promise<ProgrammeDTO> {
  return apiPost<ProgrammeDTO>(`/programmes/${id}/request-changes`, {});
}

export async function deleteProgramme(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/programmes/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await response.text());
}

export async function updateProgrammeStatus(id: string, status: string): Promise<Programme> {
  const actions: Record<string, (id: string) => Promise<ProgrammeDTO>> = {
    submitted: submitProgramme,
    approved: approveProgramme,
    published: publishProgramme,
    rejected: rejectProgramme,
    changes_requested: requestChangesProgramme,
  };
  const action = actions[status];
  if (!action) throw new Error(`Unknown status: ${status}`);
  const dto = await action(id);
  return toProgramme(dto);
}

/* ── Actors API ──────────────────────────────────────────────── */

export async function fetchActors(): Promise<ActorTableRow[]> {
  const dtos = await apiGet<ActorDTO[]>("/actors");
  return dtos.map(toActorRow);
}

export async function registerMentor(data: Record<string, unknown>): Promise<unknown> {
  return apiPost("/profiles/mentors", data);
}

export async function registerCompany(data: Record<string, unknown>): Promise<unknown> {
  return apiPost("/profiles/companies", data);
}

export async function registerPartner(data: Record<string, unknown>): Promise<unknown> {
  return apiPost("/profiles/partners", data);
}

export async function registerServiceProvider(data: Record<string, unknown>): Promise<unknown> {
  return apiPost("/profiles/service-providers", data);
}

function toMatchResult(raw: Record<string, unknown>, actorType: import("@/types").ActorType): import("@/types").MatchResult {
  const score = typeof raw.score === "number" ? Math.round(raw.score * 100) : Number(raw.score ?? 0);
  const normalised = score > 1 ? score : Math.round(score * 100);
  return {
    id: String(raw.entity_id ?? raw.id ?? Math.random()),
    actorId: String(raw.entity_id ?? raw.id ?? ""),
    actorType,
    actorName: String(raw.entity_name ?? raw.actorName ?? "Unknown"),
    profileSummary: String(raw.rationale ?? raw.profileSummary ?? ""),
    matchScore: normalised,
    matchTier: normalised >= 85 ? "Excellent" : normalised >= 70 ? "Strong" : normalised >= 55 ? "Good" : "Fair",
    aiExplanation: String(raw.rationale ?? raw.aiExplanation ?? ""),
    availabilityLabel: "Available",
    isAvailable: true,
    tags: Array.isArray(raw.fit_factors) ? (raw.fit_factors as string[]) : Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
  };
}

export async function fetchProgrammeMatches(programmeId: string): Promise<import("@/types").MatchResultsGroup> {
  const raw = await apiGet<Record<string, unknown[]>>(`/programmes/${programmeId}/match`);
  return {
    companies:        ((raw.companies        ?? []) as Record<string, unknown>[]).map((r) => toMatchResult(r, "company")),
    mentors:          ((raw.mentors          ?? []) as Record<string, unknown>[]).map((r) => toMatchResult(r, "mentor")),
    partners:         ((raw.partners         ?? []) as Record<string, unknown>[]).map((r) => toMatchResult(r, "partner")),
    serviceProviders: ((raw.serviceProviders ?? raw.service_providers ?? []) as Record<string, unknown>[]).map((r) => toMatchResult(r, "service_provider")),
  };
}

/* ── Dashboard API ───────────────────────────────────────────── */

export async function fetchDashboard(): Promise<DashboardMetrics> {
  return apiGet<DashboardMetrics>("/analytics/dashboard");
}

export async function uploadMentorCv(mentorId: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${API_URL}/mentors/${mentorId}/cv`, {
    method: "POST",
    body
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<{
    mentor_id: string;
    extracted_profile: Record<string, unknown>;
    extracted_text: string;
  }>;
}
