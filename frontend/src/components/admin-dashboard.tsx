"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  apiGet,
  apiPost,
  AgentChatResponse,
  Company,
  DashboardMetrics,
  EventRecord,
  MatchRecommendation,
  Mentor,
  Notification,
  Selection,
  streamAgentChat,
  uploadMentorCv
} from "@/lib/api";

const emptyMetrics: DashboardMetrics = {
  mentors: 0,
  companies: 0,
  events: 0,
  followups: 0,
  follow_ups: 0,
  selections: 0,
  approved_selections: 0,
  average_outcome_score: 0,
};

function toList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(emptyMetrics);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [status, setStatus] = useState("Ready");
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectionId, setSelectionId] = useState("");

  // Chat state
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatStreaming, setChatStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    const [nextMetrics, nextMentors, nextCompanies, nextEvents, nextNotifications, nextSelections] = await Promise.all([
      apiGet<DashboardMetrics>("/analytics/dashboard"),
      apiGet<Mentor[]>("/profiles/mentors"),
      apiGet<Company[]>("/profiles/companies"),
      apiGet<EventRecord[]>("/events"),
      apiGet<Notification[]>("/notifications").catch(() => []),
      apiGet<Selection[]>("/selections").catch(() => []),
    ]);
    setMetrics(nextMetrics);
    setMentors(nextMentors);
    setCompanies(nextCompanies);
    setEvents(nextEvents);
    setNotifications(nextNotifications);
    setSelections(nextSelections);
    setSelectedMentorId((current) => current || nextMentors[0]?.id || "");
    setSelectedCompanyId((current) => current || nextCompanies[0]?.id || "");
    setSelectedEventId((current) => current || nextEvents[0]?.id || "");
  }

  useEffect(() => {
    refresh().catch((error) => setStatus(error.message));
  }, []);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId),
    [companies, selectedCompanyId]
  );

  async function createMentor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await apiPost<Mentor>("/profiles/mentors", {
      full_name: form.get("full_name"),
      email: form.get("email"),
      industries: toList(String(form.get("industries") ?? "")),
      support_types: toList(String(form.get("support_types") ?? "")),
      stages: toList(String(form.get("stages") ?? "")),
      languages: toList(String(form.get("languages") ?? "")),
      capacity_score: Number(form.get("capacity_score") || 0.5)
    });
    event.currentTarget.reset();
    setStatus("Mentor created");
    await refresh();
  }

  async function createCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await apiPost<Company>("/profiles/companies", {
      company_name: form.get("company_name"),
      industry: form.get("industry"),
      stage: form.get("stage"),
      support_needed: toList(String(form.get("support_needed") ?? "")),
      languages: toList(String(form.get("languages") ?? ""))
    });
    event.currentTarget.reset();
    setStatus("Company created");
    await refresh();
  }

  async function createEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await apiPost<EventRecord>("/events", {
      event_name: form.get("event_name"),
      event_type: form.get("event_type"),
      programme_name: form.get("programme_name")
    });
    event.currentTarget.reset();
    setStatus("Event created");
    await refresh();
  }

  async function runMatching() {
    if (!selectedCompanyId || !selectedEventId) {
      setStatus("Create a company and event before matching");
      return;
    }
    const response = await apiPost<{ recommendations: MatchRecommendation[] }>("/matches/recommend", {
      event_id: selectedEventId,
      company_id: selectedCompanyId,
      top_k: 5
    });
    setRecommendations(response.recommendations);
    setStatus("Recommendations generated");
  }

  async function approveTopMatch() {
    const top = recommendations[0];
    if (!top || !selectedCompanyId || !selectedEventId) {
      setStatus("Generate a match first");
      return;
    }
    const selection = await apiPost<{
      id: string;
      approval_status: string;
    }>("/selections", {
      event_id: selectedEventId,
      purpose: `AI draft selection for ${selectedCompany?.company_name ?? "company"}`,
      company_id: selectedCompanyId,
      mentor_ids: [top.entity_id],
      match_scores: { [top.entity_id]: top.score }
    });
    const approved = await apiPost<{ id: string; approval_status: string }>(
      `/selections/${selection.id}/approve`,
      {}
    );
    setSelectionId(approved.id);
    setStatus(`Selection ${approved.approval_status}`);
    await refresh();
  }

  async function uploadCv(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("cv");
    if (!selectedMentorId || !(file instanceof File)) {
      setStatus("Choose a mentor and CV file");
      return;
    }
    const result = await uploadMentorCv(selectedMentorId, file);
    setStatus(`Document AI extracted profile for ${String(result.extracted_profile.full_name ?? "mentor")}`);
  }

  async function recordFollowup() {
    if (!selectionId || !selectedEventId) {
      setStatus("Approve a selection before recording a follow-up");
      return;
    }
    await apiPost("/followups", {
      event_id: selectedEventId,
      selection_id: selectionId,
      notes: "Mentor intro accepted. Pilot discussion scheduled.",
      outcome_score: 0.8
    });
    setStatus("Follow-up recorded");
    await refresh();
  }

  async function sendChat() {
    if (!chatInput.trim() || chatStreaming) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatStreaming(true);

    try {
      const response = await apiPost<AgentChatResponse>("/agent/chat", {
        message: userMsg,
        session_id: "admin-session",
      });
      setChatMessages((prev) => [...prev, { role: "assistant", content: response.reply }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: "assistant", content: `Error: ${err}` }]);
    } finally {
      setChatStreaming(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">NexusAI</p>
          <h1>Ecosystem Matching</h1>
        </div>
        <nav>
          <a href="#dashboard">Dashboard</a>
          <a href="#profiles">Profiles</a>
          <a href="#document-ai">Document AI</a>
          <a href="#matching">Matching</a>
          <a href="#copilot">Copilot</a>
          <a href="#selections">Selections</a>
          <a href="#notifications">Notifications</a>
          <a href="#settings">Settings</a>
        </nav>
        <p className="status">{status}</p>
      </aside>

      <section className="content">
        <section id="dashboard" className="band">
          <div className="section-heading">
            <p className="eyebrow">Admin cockpit</p>
            <h2>Live demo metrics</h2>
          </div>
          <div className="metrics">
            <Metric label="Mentors" value={metrics.mentors} />
            <Metric label="Companies" value={metrics.companies} />
            <Metric label="Events" value={metrics.events} />
            <Metric label="Selections" value={metrics.selections} />
            <Metric label="Follow-ups" value={metrics.follow_ups ?? metrics.followups} />
            <Metric label="Notifications" value={notifications.filter(n => !n.read_at).length} />
          </div>
        </section>

        <section id="profiles" className="grid two">
          <Panel title="Add mentor">
            <form onSubmit={createMentor} className="form">
              <input name="full_name" placeholder="Full name" required />
              <input name="email" placeholder="Email" required />
              <input name="industries" placeholder="Industries: fintech, payments" />
              <input name="support_types" placeholder="Support: fundraising, gtm" />
              <input name="stages" placeholder="Stages: seed, series_a" />
              <input name="languages" placeholder="Languages: en, ms" />
              <input name="capacity_score" type="number" min="0" max="1" step="0.1" defaultValue="0.8" />
              <button type="submit">Create mentor</button>
            </form>
          </Panel>

          <Panel title="Add company">
            <form onSubmit={createCompany} className="form">
              <input name="company_name" placeholder="Company name" required />
              <input name="industry" placeholder="Industry: fintech" />
              <input name="stage" placeholder="Stage: seed" />
              <input name="support_needed" placeholder="Needs: fundraising, market_access" />
              <input name="languages" placeholder="Languages: en" />
              <button type="submit">Create company</button>
            </form>
          </Panel>
        </section>

        <section className="grid two">
          <Panel title="Create event">
            <form onSubmit={createEvent} className="form">
              <input name="event_name" placeholder="Event name" required />
              <input name="event_type" placeholder="Event type" defaultValue="matchmaking" />
              <input name="programme_name" placeholder="Programme name" />
              <button type="submit">Create event</button>
            </form>
          </Panel>

          <Panel title="Current records">
            <div className="record-list">
              {mentors.map((mentor) => (
                <span key={mentor.id}>{mentor.full_name}</span>
              ))}
              {companies.map((company) => (
                <span key={company.id}>{company.company_name}</span>
              ))}
              {events.map((event) => (
                <span key={event.id}>{event.event_name}</span>
              ))}
            </div>
          </Panel>
        </section>

        <section id="document-ai" className="band">
          <div className="section-heading">
            <p className="eyebrow">Document AI MCP</p>
            <h2>Mentor CV extraction</h2>
          </div>
          <form onSubmit={uploadCv} className="toolbar">
            <select value={selectedMentorId} onChange={(event) => setSelectedMentorId(event.target.value)}>
              <option value="">Choose mentor</option>
              {mentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.full_name}
                </option>
              ))}
            </select>
            <input name="cv" type="file" accept=".pdf,.txt,.doc,.docx" />
            <button type="submit">Extract CV</button>
          </form>
        </section>

        <section id="matching" className="band">
          <div className="section-heading">
            <p className="eyebrow">Vertex AI matching</p>
            <h2>Recommend and approve</h2>
          </div>
          <div className="toolbar">
            <select value={selectedCompanyId} onChange={(event) => setSelectedCompanyId(event.target.value)}>
              <option value="">Choose company</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.company_name}
                </option>
              ))}
            </select>
            <select value={selectedEventId} onChange={(event) => setSelectedEventId(event.target.value)}>
              <option value="">Choose event</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.event_name}
                </option>
              ))}
            </select>
            <button type="button" onClick={runMatching}>
              Generate matches
            </button>
            <button type="button" onClick={approveTopMatch}>
              Approve top
            </button>
            <button type="button" onClick={recordFollowup}>
              Record follow-up
            </button>
          </div>
          <div className="recommendations">
            {recommendations.map((item) => (
              <article key={item.entity_id} className="match-card">
                <div>
                  <h3>{item.entity_name}</h3>
                  <p>{item.rationale}</p>
                </div>
                <strong>{Math.round(item.score * 100)}%</strong>
                <div className="chips">
                  {item.fit_factors.map((factor: string) => (
                    <span key={factor}>{factor}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="settings" className="band settings">
          <div className="section-heading">
            <p className="eyebrow">Runtime contract</p>
            <h2>Enabled architecture</h2>
          </div>
          <ul>
            <li>Vertex AI Gemini and embeddings are the AI runtime.</li>
            <li>Cloud PostgreSQL stores app data and agent checkpoints.</li>
            <li>Allowed MCP tools: BigQuery, Spanner Graph, Document AI, Chirp STT.</li>
            <li>Firestore, Gmail, Drive, and Calendar MCP tools are disabled.</li>
          </ul>
        </section>

        <section id="copilot" className="band">
          <div className="section-heading">
            <p className="eyebrow">NexusAI Copilot</p>
            <h2>Agent chat</h2>
          </div>
          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <p className="chat-hint">Ask the copilot anything: &quot;Match my fintech cohort to mentors&quot;, &quot;Show dashboard metrics&quot;, etc.</p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role}`}>
                  <strong>{msg.role === "user" ? "You" : "NexusAI"}:</strong>
                  <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, "<br/>") }} />
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="chat-input-row">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Type a message..."
                disabled={chatStreaming}
              />
              <button onClick={sendChat} disabled={chatStreaming}>
                {chatStreaming ? "..." : "Send"}
              </button>
            </div>
          </div>
        </section>

        <section id="selections" className="band">
          <div className="section-heading">
            <p className="eyebrow">Approval workflow</p>
            <h2>Selections ({selections.length})</h2>
          </div>
          <div className="record-list">
            {selections.map((sel) => (
              <article key={sel.selection_id} className="match-card">
                <div>
                  <h3>Selection #{sel.selection_id}: {sel.purpose || "Untitled"}</h3>
                  <p>Status: <strong>{sel.approval_status}</strong> | Items: {sel.items.length} | Version: {sel.version}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="notifications" className="band">
          <div className="section-heading">
            <p className="eyebrow">Communications</p>
            <h2>Notifications ({notifications.filter(n => !n.read_at).length} unread)</h2>
          </div>
          <div className="record-list">
            {notifications.map((notif) => (
              <article key={notif.notification_id} className={`match-card ${notif.read_at ? "read" : ""}`}>
                <div>
                  <h3>{notif.title}</h3>
                  <p>{notif.body} — <em>{notif.kind}</em> for {notif.user_email}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
