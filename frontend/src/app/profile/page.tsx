"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Building2,
  ShieldCheck,
  Layers,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  Check,
  Zap,
  Trophy,
  Star,
  TrendingUp,
  Globe,
  Calendar,
  Pencil,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MOCK_USER = {
  name: "Alex Morgan",
  email: "organizer@yokoyoko.ai",
  role: "organizer" as const,
  organisation: "YokoYoko AI Foundation",
  joinedAt: "January 2025",
  location: "Kuala Lumpur, MY",
  stats: {
    programmes: 12,
    matches: 148,
    partners: 34,
    successRate: 94,
  },
  badges: [
    { label: "Early Adopter", icon: Star,   color: "from-yellow-400 to-orange-400" },
    { label: "Top Organizer", icon: Trophy,  color: "from-purple-500 to-pink-500"  },
    { label: "Power User",    icon: Zap,     color: "from-blue-500 to-cyan-400"    },
  ],
};

const ROLE_META = {
  organizer: {
    label: "Programme Organizer",
    icon: Layers,
    gradient: "from-blue-600 to-indigo-600",
    ring: "ring-blue-500",
    badge: "bg-blue-500/10 text-blue-600 border border-blue-200",
    dot: "bg-blue-500",
    avatarGradient: "from-blue-500 via-indigo-500 to-violet-600",
  },
  admin: {
    label: "System Admin",
    icon: ShieldCheck,
    gradient: "from-purple-600 to-fuchsia-600",
    ring: "ring-purple-500",
    badge: "bg-purple-500/10 text-purple-600 border border-purple-200",
    dot: "bg-purple-500",
    avatarGradient: "from-purple-500 via-fuchsia-500 to-pink-600",
  },
};

function Avatar({ name, gradient, size = 88 }: { name: string; gradient: string; size?: number }) {
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div
      className={cn("flex items-center justify-center rounded-full bg-gradient-to-br text-white font-bold select-none shadow-lg", gradient)}
      style={{ width: size, height: size, fontSize: size * 0.33 }}
    >
      {initials}
    </div>
  );
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "text-red-500", "text-orange-500", "text-yellow-500", "text-emerald-500"];
const BAR_COLORS     = ["bg-slate-200", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];

export default function ProfilePage() {
  const router = useRouter();
  const role = MOCK_USER.role;
  const meta = ROLE_META[role];
  const RoleIcon = meta.icon;

  const [editing, setEditing] = useState(false);
  const [form,  setForm]  = useState({ name: MOCK_USER.name, email: MOCK_USER.email, organisation: MOCK_USER.organisation, location: MOCK_USER.location });
  const [draft, setDraft] = useState(form);
  const [saved, setSaved] = useState(false);

  const [pwForm,       setPwForm]       = useState({ current: "", next: "", confirm: "" });
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNext,     setShowNext]     = useState(false);
  const [pwError,      setPwError]      = useState("");
  const [pwSaved,      setPwSaved]      = useState(false);

  const strength = Math.min(Math.floor(pwForm.next.length / 3), 4);

  const handleSave = () => { setForm(draft); setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const handleCancel = () => { setDraft(form); setEditing(false); };

  const handlePasswordSave = () => {
    if (!pwForm.current)          { setPwError("Enter your current password."); return; }
    if (pwForm.next.length < 8)   { setPwError("New password must be at least 8 characters."); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords do not match."); return; }
    setPwError(""); setPwSaved(true);
    setPwForm({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-[#0d0f14]">

      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-slate-200/80 dark:border-white/5 bg-white/80 dark:bg-[#0d0f14]/80 backdrop-blur px-6 py-3.5 flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-xs text-slate-400">Manage your account &amp; preferences</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <Check className="h-3.5 w-3.5" /> Saved
          </span>
        )}
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-4">

        {/* Hero card */}
        <div className="rounded-3xl bg-white dark:bg-[#161a23] shadow-sm border border-slate-100 dark:border-white/5 px-6 py-5">
          <div className="flex items-center gap-4 mb-4">
            <div className={cn("ring-4 ring-white dark:ring-[#161a23] rounded-full shrink-0", meta.ring)}>
              <Avatar name={form.name} gradient={meta.avatarGradient} size={84} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">{form.name}</h2>
                <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", meta.badge)}>
                  <RoleIcon className="h-3 w-3" />{meta.label}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">{form.email}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400" />{form.organisation}</span>
            <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-slate-400" />{form.location}</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-400" />Member since {MOCK_USER.joinedAt}</span>
            <span className="flex items-center gap-1.5 ml-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />Active
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Programmes", value: MOCK_USER.stats.programmes, icon: TrendingUp, color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-500/10"    },
            { label: "Matches",    value: MOCK_USER.stats.matches,    icon: Zap,        color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-500/10" },
            { label: "Partners",   value: MOCK_USER.stats.partners,   icon: Globe,      color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="rounded-2xl bg-white dark:bg-[#161a23] border border-slate-100 dark:border-white/5 p-4 flex flex-col items-center gap-2 shadow-sm">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", bg)}>
                <Icon className={cn("h-4 w-4", color)} />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">{value}</span>
              <span className="text-[11px] text-slate-400 text-center leading-tight">{label}</span>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="rounded-2xl bg-white dark:bg-[#161a23] border border-slate-100 dark:border-white/5 shadow-sm p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Achievements</h3>
          <div className="flex gap-3 flex-wrap">
            {MOCK_USER.badges.map(({ label, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/5 px-3 py-2">
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-white shrink-0", color)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Account details */}
        <div className="rounded-2xl bg-white dark:bg-[#161a23] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account Details</h3>
              <p className="text-xs text-slate-400 mt-0.5">Update your personal information</p>
            </div>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
                <Pencil className="h-3 w-3" /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleCancel} className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <X className="h-3 w-3" /> Cancel
                </button>
                <button onClick={handleSave} className="flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors">
                  <Check className="h-3 w-3" /> Save
                </button>
              </div>
            )}
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</Label>
                <Input id="name" value={editing ? draft.name : form.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} disabled={!editing} className={cn(!editing && "bg-slate-50 dark:bg-white/5 cursor-default")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Organisation</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="org" value={editing ? draft.organisation : form.organisation} onChange={(e) => setDraft({ ...draft, organisation: e.target.value })} disabled={!editing} className={cn("pl-9", !editing && "bg-slate-50 dark:bg-white/5 cursor-default")} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="email" type="email" value={editing ? draft.email : form.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} disabled={!editing} className={cn("pl-9", !editing && "bg-slate-50 dark:bg-white/5 cursor-default")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="location" value={editing ? draft.location : form.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} disabled={!editing} className={cn("pl-9", !editing && "bg-slate-50 dark:bg-white/5 cursor-default")} />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</Label>
              <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 text-sm text-slate-500 cursor-not-allowed select-none">
                <RoleIcon className="h-4 w-4" />{meta.label}
                <span className="ml-auto text-[11px] text-slate-400 rounded-md bg-slate-100 dark:bg-white/10 px-2 py-0.5">Read-only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl bg-white dark:bg-[#161a23] border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-white/5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-white/10">
              <KeyRound className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security</h3>
              <p className="text-xs text-slate-400">Update your password</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-pw" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Password</Label>
              <div className="relative">
                <Input id="current-pw" type={showCurrent ? "text" : "password"} value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} placeholder="••••••••" className="pr-10" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pw" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">New Password</Label>
              <div className="relative">
                <Input id="new-pw" type={showNext ? "text" : "password"} value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} placeholder="Min. 8 characters" className="pr-10" />
                <button type="button" onClick={() => setShowNext(!showNext)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showNext ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {pwForm.next && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((lvl) => (
                      <div key={lvl} className={cn("h-1.5 flex-1 rounded-full transition-all duration-300", lvl <= strength ? BAR_COLORS[strength] : "bg-slate-100 dark:bg-white/10")} />
                    ))}
                  </div>
                  <p className={cn("text-xs font-medium", STRENGTH_COLORS[strength])}>{STRENGTH_LABELS[strength]}</p>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Confirm Password</Label>
              <Input id="confirm-pw" type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="Re-enter new password" />
              {pwForm.confirm && pwForm.next && pwForm.confirm !== pwForm.next && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
              {pwForm.confirm && pwForm.next && pwForm.confirm === pwForm.next && <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1"><Check className="h-3 w-3" /> Passwords match</p>}
            </div>
            {pwError && <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 px-4 py-2.5 text-xs text-red-600 dark:text-red-400">{pwError}</div>}
            <div className="flex justify-end pt-1">
              <Button onClick={handlePasswordSave} className={cn("gap-2 transition-all", pwSaved ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200")}>
                {pwSaved ? <><Check className="h-4 w-4" /> Updated!</> : <><Save className="h-4 w-4" /> Update Password</>}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
