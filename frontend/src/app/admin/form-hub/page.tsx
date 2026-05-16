import { FileText, Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminFormHubPage() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Form Hub</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage intake forms and view submissions.</p>
        </div>
        <Button variant="navy" className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Form
        </Button>
      </div>
      <div className="p-8">
        <div className="py-16 text-center text-slate-400">No forms configured yet.</div>
      </div>
    </div>
  );
}
