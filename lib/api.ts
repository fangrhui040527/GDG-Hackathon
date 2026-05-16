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
  approved_selections: number;
  followups: number;
  average_outcome_score: number;
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
