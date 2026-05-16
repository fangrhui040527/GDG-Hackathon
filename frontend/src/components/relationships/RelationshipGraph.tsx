"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, ZoomIn, ZoomOut, Settings2 } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type NodeType = "institution" | "individual" | "government";
type ActorCategory = "programme" | "company" | "mentor" | "partner" | "service_provider";
type EdgeStrength = "strong" | "weak";

interface HistoryEntry {
  title: string;
  date: string;
  note: string;
}

interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  category: ActorCategory;
  x: number;
  y: number;
  r: number;
  sector: string;
  established: string;
  directLinks: number;
  influenceScore: number;
  activeProgrammes: string[];
  history: HistoryEntry[];
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  strength: EdgeStrength;
  score: number;
}

// ─── Colours ─────────────────────────────────────────────────────────────────
const TYPE_COLOR: Record<NodeType, { fill: string; stroke: string; light: string; text: string }> = {
  institution: { fill: "#4338ca", stroke: "#a5b4fc", light: "#e0e7ff", text: "Institution" },
  individual:  { fill: "#7c3aed", stroke: "#c4b5fd", light: "#ede9fe", text: "Individual"  },
  government:  { fill: "#b45309", stroke: "#fcd34d", light: "#fef3c7", text: "Government"  },
};

// ─── Seed data ────────────────────────────────────────────────────────────────
const NODES: GraphNode[] = [
  {
    id: "prog1", label: "Global FinTech", type: "institution", category: "programme",
    x: 0, y: 0, r: 40,
    sector: "Financial Technology", established: "2024",
    directLinks: 8, influenceScore: 9.2,
    activeProgrammes: ["Global FinTech", "FinTech Hub"],
    history: [
      { title: "Shortlist finalised", date: "May 16, 2026", note: "Admin Selection" },
      { title: "Programme submitted", date: "May 15, 2026", note: "Organiser Action" },
    ],
  },
  {
    id: "c1", label: "Axiata Digital", type: "institution", category: "company",
    x: -175, y: -130, r: 30,
    sector: "Telecommunications", established: "2014",
    directLinks: 5, influenceScore: 8.3,
    activeProgrammes: ["Global FinTech"],
    history: [
      { title: "Matched by AI", date: "May 16, 2026", note: "Score: 83%" },
      { title: "Profile registered", date: "Jan 10, 2025", note: "System" },
    ],
  },
  {
    id: "c2", label: "Grab Ventures", type: "institution", category: "company",
    x: -210, y: 70, r: 28,
    sector: "Super-App / VC", established: "2018",
    directLinks: 4, influenceScore: 8.6,
    activeProgrammes: ["Global FinTech"],
    history: [{ title: "Matched by AI", date: "May 16, 2026", note: "Score: 86%" }],
  },
  {
    id: "m1", label: "Dr. Sarah Lim", type: "individual", category: "mentor",
    x: 55, y: -195, r: 28,
    sector: "Healthcare Technology", established: "2020",
    directLinks: 3, influenceScore: 8.8,
    activeProgrammes: ["Global FinTech"],
    history: [
      { title: "Matched by AI", date: "May 16, 2026", note: "Score: 88%" },
      { title: "Mentor registered", date: "Feb 05, 2025", note: "System" },
    ],
  },
  {
    id: "m2", label: "Dr. Ahmad Farouk", type: "individual", category: "mentor",
    x: 185, y: -105, r: 28,
    sector: "FinTech Strategy", established: "2019",
    directLinks: 4, influenceScore: 9.1,
    activeProgrammes: ["Global FinTech"],
    history: [{ title: "Matched by AI", date: "May 16, 2026", note: "Score: 92%" }],
  },
  {
    id: "m3", label: "Ms. Priya Nair", type: "individual", category: "mentor",
    x: 210, y: 30, r: 26,
    sector: "Product & Growth", established: "2021",
    directLinks: 2, influenceScore: 8.0,
    activeProgrammes: ["Global FinTech"],
    history: [{ title: "Matched by AI", date: "May 16, 2026", note: "Score: 80%" }],
  },
  {
    id: "p1", label: "Khazanah Nasional", type: "government", category: "partner",
    x: 185, y: 150, r: 30,
    sector: "Investment / Gov", established: "1994",
    directLinks: 6, influenceScore: 9.4,
    activeProgrammes: ["Global FinTech", "Seed Fund MY"],
    history: [
      { title: "Partnership established", date: "May 16, 2026", note: "Strong Tie" },
      { title: "Matched by AI", date: "May 16, 2026", note: "Score: 91%" },
    ],
  },
  {
    id: "p2", label: "Cradle Fund", type: "government", category: "partner",
    x: 55, y: 205, r: 26,
    sector: "Early-Stage Funding", established: "2003",
    directLinks: 4, influenceScore: 7.8,
    activeProgrammes: ["Global FinTech"],
    history: [{ title: "Matched by AI", date: "May 16, 2026", note: "Score: 78%" }],
  },
  {
    id: "sp1", label: "AWS Startup Loft", type: "institution", category: "service_provider",
    x: -80, y: 210, r: 26,
    sector: "Cloud Infrastructure", established: "2015",
    directLinks: 3, influenceScore: 9.0,
    activeProgrammes: ["Global FinTech"],
    history: [{ title: "Matched by AI", date: "May 16, 2026", note: "Score: 90%" }],
  },
  {
    id: "sp2", label: "KPMG Advisory", type: "institution", category: "service_provider",
    x: -195, y: 170, r: 24,
    sector: "Financial Advisory", established: "1987",
    directLinks: 2, influenceScore: 7.5,
    activeProgrammes: ["Global FinTech"],
    history: [{ title: "Matched by AI", date: "May 16, 2026", note: "Score: 75%" }],
  },
];

const EDGES: GraphEdge[] = [
  { id: "e1",  source: "prog1", target: "c1",  strength: "strong", score: 83 },
  { id: "e2",  source: "prog1", target: "c2",  strength: "strong", score: 86 },
  { id: "e3",  source: "prog1", target: "m1",  strength: "strong", score: 88 },
  { id: "e4",  source: "prog1", target: "m2",  strength: "strong", score: 92 },
  { id: "e5",  source: "prog1", target: "m3",  strength: "strong", score: 80 },
  { id: "e6",  source: "prog1", target: "p1",  strength: "strong", score: 91 },
  { id: "e7",  source: "prog1", target: "p2",  strength: "weak",   score: 78 },
  { id: "e8",  source: "prog1", target: "sp1", strength: "strong", score: 90 },
  { id: "e9",  source: "prog1", target: "sp2", strength: "weak",   score: 75 },
  { id: "e10", source: "c1",    target: "m1",  strength: "weak",   score: 65 },
  { id: "e11", source: "p1",    target: "m2",  strength: "weak",   score: 70 },
];

// ─── SVG icons inside nodes ───────────────────────────────────────────────────
function NodeIcon({ type, cx, cy }: { type: NodeType; cx: number; cy: number }) {
  const s = 0.9;
  const dx = cx - 6 * s;
  const dy = cy - 6 * s;
  if (type === "individual") {
    return (
      <g transform={`translate(${dx},${dy}) scale(${s})`} fill="rgba(255,255,255,0.92)" stroke="none">
        <circle cx="6" cy="4.5" r="2.8" />
        <path d="M1 12 C1 8.5 3.4 7 6 7 C8.6 7 11 8.5 11 12" />
      </g>
    );
  }
  if (type === "government") {
    return (
      <g transform={`translate(${dx},${dy}) scale(${s})`} fill="rgba(255,255,255,0.92)" stroke="none">
        <rect x="1" y="10" width="10" height="1.5" rx="0.4" />
        <rect x="1.5" y="5" width="1.5" height="5" />
        <rect x="4.5" y="5" width="1.5" height="5" />
        <rect x="7.5" y="5" width="1.5" height="5" />
        <polygon points="6,1 11.5,4.5 0.5,4.5" />
      </g>
    );
  }
  // institution / default
  return (
    <g transform={`translate(${dx},${dy}) scale(${s})`} fill="rgba(255,255,255,0.92)" stroke="none">
      <rect x="1.5" y="4" width="9" height="8" rx="0.5" />
      <rect x="3" y="6"  width="1.8" height="1.8" fill="rgba(0,0,0,0.25)" />
      <rect x="6.2" y="6"  width="1.8" height="1.8" fill="rgba(0,0,0,0.25)" />
      <rect x="3" y="9"  width="1.8" height="1.8" fill="rgba(0,0,0,0.25)" />
      <rect x="6.2" y="9"  width="1.8" height="1.8" fill="rgba(0,0,0,0.25)" />
      <rect x="5" y="9.5" width="2" height="2.5" fill="rgba(0,0,0,0.25)" />
      <polygon points="6,1 11.5,4 0.5,4" />
    </g>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────
function DetailPanel({ node, onClose }: { node: GraphNode; onClose: () => void }) {
  const color = TYPE_COLOR[node.type];
  return (
    <div className="flex h-full flex-col overflow-auto bg-white">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <span
            className="mb-2 inline-block rounded px-2 py-0.5 text-xs font-semibold tracking-wide"
            style={{ backgroundColor: color.light, color: color.fill }}
          >
            {color.text}
          </span>
          <h2 className="text-lg font-bold text-slate-900">{node.label}</h2>
          <p className="text-xs text-slate-500">Core System Node</p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 mt-0.5 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 border-b border-slate-100 px-5 py-4">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Direct Links</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{node.directLinks}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Influence Score</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{node.influenceScore}</p>
        </div>
      </div>

      {/* Node details */}
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Node Details</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Primary Sector</span>
            <span className="font-medium text-slate-800">{node.sector}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Established</span>
            <span className="font-medium text-slate-800">{node.established}</span>
          </div>
          <div>
            <span className="text-slate-500">Active Programmes</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {node.activeProgrammes.map((p) => (
                <span key={p} className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Relationship history */}
      <div className="flex-1 px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Relationship History</p>
        <ul className="space-y-3">
          {node.history.map((h, i) => (
            <li key={i} className="flex gap-2.5 text-sm">
              <span
                className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full"
                style={{ backgroundColor: color.fill }}
              />
              <div>
                <p className="font-medium text-slate-800">{h.title}</p>
                <p className="text-xs text-slate-500">
                  {h.date} · {h.note}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 px-5 py-4">
        <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          View Full Actor Profile
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function RelationshipGraph() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [showStrong, setShowStrong] = useState(true);
  const [showWeak, setShowWeak] = useState(true);
  const [activeTypes, setActiveTypes] = useState<Set<NodeType>>(new Set(["institution", "individual", "government"]));
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [programmeFilter, setProgrammeFilter] = useState("All Programmes");
  const [actorFilter, setActorFilter] = useState("All Actor Types");
  const svgRef = useRef<SVGSVGElement>(null);

  // viewBox center
  const VW = 600;
  const VH = 480;
  const CX = VW / 2;
  const CY = VH / 2;

  // Filtered nodes
  const visibleNodes = NODES.filter((n) => activeTypes.has(n.type));
  const visibleIds = new Set(visibleNodes.map((n) => n.id));

  // Filtered edges
  const visibleEdges = EDGES.filter((e) => {
    if (!visibleIds.has(e.source) || !visibleIds.has(e.target)) return false;
    if (e.strength === "strong" && !showStrong) return false;
    if (e.strength === "weak" && !showWeak) return false;
    return true;
  });

  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));

  const toggleType = (t: NodeType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      next.has(t) ? next.delete(t) : next.add(t);
      return next;
    });
  };

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.3));
  const handleZoomReset = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as Element).closest("[data-node]")) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    setZoom((z) => Math.min(Math.max(z - e.deltaY * 0.001, 0.3), 3));
  }, []);

  // Curved edge path between two nodes
  function edgePath(s: GraphNode, t: GraphNode) {
    const sx = CX + s.x;
    const sy = CY + s.y;
    const tx = CX + t.x;
    const ty = CY + t.y;
    const mx = (sx + tx) / 2;
    const my = (sy + ty) / 2;
    const dx = tx - sx;
    const dy = ty - sy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const curve = len * 0.18;
    const bx = mx - (dy / len) * curve;
    const by = my + (dx / len) * curve;
    return `M ${sx} ${sy} Q ${bx} ${by} ${tx} ${ty}`;
  }

  // Midpoint for score label
  function edgeMid(s: GraphNode, t: GraphNode) {
    const sx = CX + s.x; const sy = CY + s.y;
    const tx = CX + t.x; const ty = CY + t.y;
    return { x: (sx + tx) / 2, y: (sy + ty) / 2 };
  }

  return (
    <div className="flex h-full flex-col">
      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 bg-white px-6 py-3 text-sm">
        <span className="font-semibold text-slate-500 uppercase tracking-wide text-[11px]">View Filters:</span>

        <select
          value={programmeFilter}
          onChange={(e) => setProgrammeFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 text-sm focus:outline-none"
        >
          <option>All Programmes</option>
          <option>Global FinTech</option>
          <option>HealthTech Accelerator</option>
        </select>

        <select
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 text-sm focus:outline-none"
        >
          <option>All Actor Types</option>
          <option>Companies</option>
          <option>Mentors</option>
          <option>Partners</option>
          <option>Service Providers</option>
        </select>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showStrong}
            onChange={(e) => setShowStrong(e.target.checked)}
            className="accent-indigo-600 h-4 w-4"
          />
          <span className="text-slate-700">Show Strong Linkages</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showWeak}
            onChange={(e) => setShowWeak(e.target.checked)}
            className="accent-indigo-600 h-4 w-4"
          />
          <span className="text-slate-700">Show Weak Linkages</span>
        </label>
      </div>

      {/* ── Content area ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Graph canvas ─────────────────────────────────────────────── */}
        <div className="relative flex-1 overflow-hidden bg-slate-50">
          {/* Dot grid background */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#cbd5e1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* Main SVG */}
          <svg
            ref={svgRef}
            className="h-full w-full cursor-grab active:cursor-grabbing select-none"
            viewBox={`0 0 ${VW} ${VH}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <g transform={`translate(${pan.x},${pan.y}) scale(${zoom})`} style={{ transformOrigin: `${CX}px ${CY}px` }}>

              {/* Edges */}
              {visibleEdges.map((edge) => {
                const s = nodeMap[edge.source];
                const t = nodeMap[edge.target];
                if (!s || !t) return null;
                const path = edgePath(s, t);
                const mid = edgeMid(s, t);
                const isStrong = edge.strength === "strong";
                const edgeColor = isStrong ? "#94a3b8" : "#cbd5e1";
                return (
                  <g key={edge.id}>
                    <path
                      d={path}
                      fill="none"
                      stroke={edgeColor}
                      strokeWidth={isStrong ? 1.8 : 1.2}
                      strokeDasharray={isStrong ? undefined : "5 4"}
                      opacity={0.75}
                    />
                    {/* Score label */}
                    <rect
                      x={mid.x - 14}
                      y={mid.y - 8}
                      width={28}
                      height={14}
                      rx={7}
                      fill="white"
                      stroke="#e2e8f0"
                      strokeWidth={0.8}
                    />
                    <text
                      x={mid.x}
                      y={mid.y + 4}
                      textAnchor="middle"
                      fontSize={8}
                      fontFamily="system-ui"
                      fontWeight={600}
                      fill="#64748b"
                    >
                      {edge.score}%
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {visibleNodes.map((node) => {
                const cx = CX + node.x;
                const cy = CY + node.y;
                const color = TYPE_COLOR[node.type];
                const isSelected = selectedNode?.id === node.id;
                const isProgramme = node.category === "programme";
                return (
                  <g
                    key={node.id}
                    data-node="true"
                    onClick={() => setSelectedNode(node)}
                    style={{ cursor: "pointer" }}
                  >
                    {/* Selection ring */}
                    {isSelected && (
                      <circle cx={cx} cy={cy} r={node.r + 8} fill="none" stroke={color.fill} strokeWidth={2} opacity={0.35} />
                    )}
                    {/* Glow for programme root */}
                    {isProgramme && (
                      <circle cx={cx} cy={cy} r={node.r + 12} fill={color.fill} opacity={0.08} />
                    )}
                    {/* Node circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={node.r}
                      fill={color.fill}
                      stroke={isSelected ? "white" : color.stroke}
                      strokeWidth={isSelected ? 3 : 1.5}
                      filter={isSelected ? "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" : undefined}
                    />
                    {/* Icon */}
                    <NodeIcon type={node.type} cx={cx} cy={cy} />
                    {/* Label */}
                    <text
                      x={cx}
                      y={cy + node.r + 14}
                      textAnchor="middle"
                      fontSize={isProgramme ? 11 : 9.5}
                      fontFamily="system-ui"
                      fontWeight={isProgramme ? 700 : 500}
                      fill="#1e293b"
                    >
                      {node.label.length > 16 ? node.label.slice(0, 15) + "…" : node.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Zoom controls */}
          <div className="absolute left-4 top-4 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white shadow-sm">
            <button
              onClick={handleZoomIn}
              className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-50 rounded-t-lg"
            >
              <ZoomIn size={15} />
            </button>
            <div className="h-px bg-slate-100" />
            <button
              onClick={handleZoomReset}
              className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-50"
            >
              <Settings2 size={14} />
            </button>
            <div className="h-px bg-slate-100" />
            <button
              onClick={handleZoomOut}
              className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-50 rounded-b-lg"
            >
              <ZoomOut size={15} />
            </button>
          </div>

          {/* Node legend */}
          <div className="absolute bottom-4 left-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Node Legend</p>
            <div className="space-y-1.5">
              {(["institution", "individual", "government"] as NodeType[]).map((t) => {
                const c = TYPE_COLOR[t];
                return (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`flex items-center gap-2 text-xs capitalize transition-opacity ${
                      activeTypes.has(t) ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: c.fill }} />
                    {c.text}
                  </button>
                );
              })}
              <div className="mt-2 border-t border-slate-100 pt-2 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg width="24" height="6"><line x1="0" y1="3" x2="24" y2="3" stroke="#94a3b8" strokeWidth="1.8" /></svg>
                  AI-matched
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <svg width="24" height="6"><line x1="0" y1="3" x2="24" y2="3" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="5 4" /></svg>
                  Weak link
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Detail panel ───────────────────────────────────────────────── */}
        {selectedNode ? (
          <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-white">
            <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
          </div>
        ) : (
          <div className="flex w-80 flex-shrink-0 items-center justify-center border-l border-slate-200 bg-white">
            <p className="text-sm text-slate-400">Click a node to see details</p>
          </div>
        )}
      </div>
    </div>
  );
}
