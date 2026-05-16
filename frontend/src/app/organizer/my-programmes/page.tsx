"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProgrammeCard from "@/components/dashboard/ProgrammeCard";
import { fetchProgrammes } from "@/lib/api";
import type { Programme } from "@/types";

export default function MyProgrammesPage() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);

  useEffect(() => {
    fetchProgrammes().then(setProgrammes).catch(() => {});
  }, []);
  return (
    <div className="flex flex-col">
      <div className="border-b border-slate-200 bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Programmes</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              All programmes you have created and are managing.
            </p>
          </div>
          <Button variant="navy" className="gap-2" asChild>
            <Link href="/organizer/create-programme">
              <Plus className="h-4 w-4" />
              New Programme
            </Link>
          </Button>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search programmes..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programmes.map((p) => (
            <ProgrammeCard key={p.id} programme={p} role="organizer" />
          ))}
        </div>
      </div>
    </div>
  );
}
