import OrganizerSidebar from "@/components/layout/OrganizerSidebar";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <OrganizerSidebar />
      <main className="flex-1 pl-16">
        <div className="min-h-screen">{children}</div>
      </main>
    </div>
  );
}
