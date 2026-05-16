export type Selection = {
  selection_id: number;
  event_id: number | null;
  purpose: string | null;
  approval_status: string;
  ai_generated: boolean;
  approved_by: string | null;
  approved_at: string | null;
  version: number;
  items: SelectionItem[];
};

export type SelectionItem = {
  entity_type: string;
  entity_id: number;
  entity_name: string | null;
  match_score: number | null;
  rationale: string | null;
};

export type Notification = {
  notification_id: number;
  user_email: string;
  kind: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string | null;
};

export type AgentChatResponse = {
  session_id: string;
  intent?: string;
  reply: string;
  candidates?: MatchRecommendation[] | null;
  error?: string;
};

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
  selections: number;
  follow_ups: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("nexusai_session");
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
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
    headers: getAuthHeaders(),
    body,
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

export function streamAgentChat(
  message: string,
  sessionId: string,
  onEvent: (event: { node: string; intent?: string; response?: string; candidates?: MatchRecommendation[] }) => void,
  onDone: () => void,
  onError: (error: string) => void,
): AbortController {
  const controller = new AbortController();

  fetch(`${API_URL}/agent/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ message, session_id: sessionId }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        onError(await response.text());
        return;
      }
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let eventType = "";
        for (const line of lines) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              if (eventType === "node") {
                onEvent(parsed);
              } else if (eventType === "done") {
                onDone();
              } else if (eventType === "error") {
                onError(parsed.error);
              }
            } catch {
              // skip malformed SSE data
            }
          }
        }
      }
      onDone();
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        onError(String(err));
      }
    });

  return controller;
}
