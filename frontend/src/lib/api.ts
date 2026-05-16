/* ─── NexusAI API Client ─────────────────────────────────────────────
   Connects the Next.js frontend to the FastAPI backend.
   All functions use the NEXT_PUBLIC_API_URL env var (default: http://localhost:8000).
   ──────────────────────────────────────────────────────────────────── */

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Generic helpers ──────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${API}${path}`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

async function patch<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

// ── Backend response types ───────────────────────────────────────

export interface ProgrammeDTO {
  programme_id: number;
  name: string;
  description: string | null;
  category: string | null;
  status: string;
  start_date: string | null;
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
  created_at: string | null;
  updated_at: string | null;
}

export interface MentorDTO {
  mentor_id: number;
  full_name: string;
  email: string;
  short_bio: string | null;
  job_title: string | null;
  organization_name: string | null;
  preferred_industry: string | null;
  type_of_support_offered: string | null;
  preferred_company_stage: string | null;
  available_hours_per_month: number | null;
  max_companies_to_mentor: number | null;
  current_availability_status: string | null;
  country: string | null;
}

export interface CompanyDTO {
  company_id: number;
  company_name: string;
  company_description: string | null;
  country: string | null;
  industry: string | null;
  business_stage: string | null;
  support_needed: string | null;
  availability: string | null;
  event_id: number | null;
}

export interface PartnerDTO {
  partner_id: number;
  organisation_name: string;
  organisation_type: string;
  country: string;
  contact_person_name: string;
  contact_email: string;
  organisation_description: string;
  industries_of_interest: string;
}

export interface ServiceProviderDTO {
  sp_id: number;
  organisation_name: string;
  contact_person_name: string;
  contact_email: string;
  company_description: string;
  services_offered: string;
}

export interface EventDTO {
  event_id: number;
  event_name: string;
  event_description: string | null;
  event_date: string | null;
  event_location: string | null;
}

export interface MatchRecommendation {
  entity_id: number;
  entity_name: string;
  score: number;
  fit_factors: string[];
  rationale: string;
}

export interface SelectionDTO {
  selection_id: number;
  event_id: number | null;
  purpose: string | null;
  approval_status: string;
  ai_generated: boolean;
  approved_by: string | null;
  approved_at: string | null;
  version: number;
  items: SelectionItemDTO[];
}

export interface SelectionItemDTO {
  entity_type: string;
  entity_id: number;
  entity_name: string | null;
  match_score: number | null;
  rationale: string | null;
}

export interface NotificationDTO {
  notification_id: number;
  user_email: string;
  kind: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string | null;
}

export interface ActorDTO {
  id: number;
  name: string;
  type: string;
  category: string;
  country: string;
  status: string;
  registeredAt: string;
}

export interface DashboardMetrics {
  mentors: number;
  companies: number;
  events: number;
  follow_ups: number;
  selections: number;
}

export interface AgentChatResponse {
  session_id: string;
  intent?: string;
  reply: string;
  candidates?: MatchRecommendation[];
  selection_id?: number;
  error?: string;
}

// ── Programme API ────────────────────────────────────────────────

export const fetchProgrammes = (status?: string) =>
  get<ProgrammeDTO[]>(status ? `/programmes?status=${status}` : "/programmes");

export const fetchProgramme = (id: number) =>
  get<ProgrammeDTO>(`/programmes/${id}`);

export const createProgramme = (data: {
  name: string;
  description?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  target_industry?: string;
  target_country?: string;
  target_company_stage?: string;
  required_mentors?: number;
  required_companies?: number;
  required_partners?: number;
  required_service_providers?: number;
  eligibility_criteria?: string;
  organiser_name?: string;
}) => post<ProgrammeDTO>("/programmes", data);

export const updateProgramme = (id: number, data: Record<string, unknown>) =>
  patch<ProgrammeDTO>(`/programmes/${id}`, data);

export const submitProgramme = (id: number) =>
  post<ProgrammeDTO>(`/programmes/${id}/submit`);

export const approveProgramme = (id: number) =>
  post<ProgrammeDTO>(`/programmes/${id}/approve`);

export const publishProgramme = (id: number) =>
  post<ProgrammeDTO>(`/programmes/${id}/publish`);

export const rejectProgramme = (id: number) =>
  post<ProgrammeDTO>(`/programmes/${id}/reject`);

export const requestChangesProgramme = (id: number) =>
  post<ProgrammeDTO>(`/programmes/${id}/request-changes`);

// ── Profile / Actor API ──────────────────────────────────────────

export const fetchMentors = () => get<MentorDTO[]>("/profiles/mentors");
export const fetchCompanies = () => get<CompanyDTO[]>("/profiles/companies");
export const fetchPartners = () => get<PartnerDTO[]>("/profiles/partners");
export const fetchServiceProviders = () => get<ServiceProviderDTO[]>("/profiles/service-providers");
export const fetchActors = () => get<ActorDTO[]>("/actors");

export const createMentor = (data: Record<string, unknown>) =>
  post<MentorDTO>("/profiles/mentors", data);
export const createCompany = (data: Record<string, unknown>) =>
  post<CompanyDTO>("/profiles/companies", data);
export const createPartner = (data: Record<string, unknown>) =>
  post<PartnerDTO>("/profiles/partners", data);
export const createServiceProvider = (data: Record<string, unknown>) =>
  post<ServiceProviderDTO>("/profiles/service-providers", data);

// ── Event API ────────────────────────────────────────────────────

export const fetchEvents = () => get<EventDTO[]>("/events");
export const createEvent = (data: Record<string, unknown>) =>
  post<EventDTO>("/events", data);

// ── Matching API ─────────────────────────────────────────────────

export const recommendMatches = (eventId: number, companyId: number, topK = 10) =>
  post<{ recommendations: MatchRecommendation[] }>("/matches/recommend", {
    event_id: eventId,
    company_id: companyId,
    top_k: topK,
  });

// ── Selection API ────────────────────────────────────────────────

export const fetchSelections = () => get<SelectionDTO[]>("/selections");
export const fetchSelection = (id: number) => get<SelectionDTO>(`/selections/${id}`);

export const createSelection = (data: {
  event_id?: number;
  purpose?: string;
  ai_generated?: boolean;
  items: { entity_type: string; entity_id: number; entity_name: string; match_score?: number; rationale?: string }[];
}) => post<SelectionDTO>("/selections", data);

export const approveSelection = (id: number) =>
  post<SelectionDTO>(`/selections/${id}/approve`);

export const rejectSelection = (id: number) =>
  post<SelectionDTO>(`/selections/${id}/reject`);

// ── Notification API ─────────────────────────────────────────────

export const fetchNotifications = (email?: string) =>
  get<NotificationDTO[]>(email ? `/notifications?email=${email}` : "/notifications");

export const markNotificationRead = (id: number) =>
  patch<{ status: string }>(`/notifications/${id}/read`);

// ── Follow-up API ────────────────────────────────────────────────

export const createFollowUp = (data: {
  company_id: number;
  action_decision?: string;
  discussion?: string;
  person_recorded?: string;
}) => post("/followups", data);

// ── Dashboard API ────────────────────────────────────────────────

export const fetchDashboard = () => get<DashboardMetrics>("/analytics/dashboard");

// ── Agent Chat API ───────────────────────────────────────────────

export const agentChat = (message: string, sessionId = "default") =>
  post<AgentChatResponse>("/agent/chat", { message, session_id: sessionId });

export function streamAgentChat(message: string, sessionId = "default") {
  return fetch(`${API}/agent/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, session_id: sessionId }),
  });
}

// ── CV Upload API ────────────────────────────────────────────────

export async function uploadMentorCv(mentorId: number, file: File) {
  const body = new FormData();
  body.append("file", file);
  const r = await fetch(`${API}/mentors/${mentorId}/cv`, { method: "POST", body });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<{
    mentor_id: number;
    extracted_text: string;
    extracted_profile: Record<string, unknown>;
  }>;
}

// ── Audit API ────────────────────────────────────────────────────

export const fetchAuditHistory = (entityType: string, entityId: number) =>
  get<{ log_id: number; action: string; detail: string | null; created_at: string | null }[]>(
    `/audit?entity_type=${entityType}&entity_id=${entityId}`
  );

// ── Graph API ────────────────────────────────────────────────────

export const fetchGraphSubgraph = (entityType: string, entityId: number) =>
  get<{ nodes: unknown[]; edges: unknown[]; total: number }>(
    `/graph/subgraph?entity_type=${entityType}&entity_id=${entityId}`
  );

// ── Helpers for type conversion ──────────────────────────────────

/** Convert a backend ProgrammeDTO to the frontend Programme shape */
export function toProgramme(p: ProgrammeDTO) {
  return {
    id: String(p.programme_id),
    name: p.name,
    description: p.description ?? "",
    category: p.category ?? "Other",
    status: p.status,
    startDate: p.start_date ?? "",
    endDate: p.end_date ?? undefined,
    coverImage: p.cover_image ?? undefined,
    requirements: {
      targetIndustry: p.target_industry ?? "",
      targetCountry: p.target_country ?? "",
      targetCompanyStage: p.target_company_stage ?? "Any",
      requiredMentors: p.required_mentors,
      requiredCompanies: p.required_companies,
      requiredPartners: p.required_partners,
      requiredServiceProviders: p.required_service_providers,
      eligibilityCriteria: p.eligibility_criteria ?? "",
    },
    progress: {
      label: p.status === "published" ? "Active" : "Setup",
      value: p.status === "published" ? 100 : p.status === "submitted" ? 60 : 30,
      status: p.status,
    },
    organiserId: p.organiser_id ?? "",
    organiserName: p.organiser_name ?? "",
    submittedAt: p.submitted_at ?? undefined,
    publishedAt: p.published_at ?? undefined,
    createdAt: p.created_at ?? "",
    updatedAt: p.updated_at ?? "",
  };
}

/** Convert a backend ActorDTO to the frontend ActorTableRow shape */
export function toActorRow(a: ActorDTO) {
  return {
    id: String(a.id),
    name: a.name,
    type: a.type as "company" | "mentor" | "partner" | "service_provider",
    category: a.category,
    country: a.country,
    status: a.status as "active" | "inactive" | "pending",
    registeredAt: a.registeredAt,
  };
}
