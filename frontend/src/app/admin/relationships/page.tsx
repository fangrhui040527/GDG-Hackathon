import { MOCK_RELATIONSHIPS } from "@/lib/mock-data";
import RelationshipTable from "@/components/relationships/RelationshipTable";

export default function AdminRelationshipsPage() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-slate-900">Relationships</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          All established relationships between ecosystem actors.
        </p>
      </div>
      <div className="p-8">
        <RelationshipTable relationships={MOCK_RELATIONSHIPS} />
      </div>
    </div>
  );
}
