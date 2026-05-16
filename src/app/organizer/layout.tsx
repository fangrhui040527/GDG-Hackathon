import OrganizerSidebar from "@/components/layout/OrganizerSidebar";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <OrganizerSidebar />
      <main className="flex-1 pl-60">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
