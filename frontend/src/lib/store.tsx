"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { MOCK_PROGRAMMES } from "@/lib/mock-data";
import type { Programme, ProgrammeStatus } from "@/types";

interface ProgrammeStore {
  programmes: Programme[];
  addProgramme: (p: Programme) => void;
  deleteProgramme: (id: string) => void;
  updateProgrammeStatus: (id: string, status: ProgrammeStatus) => void;
}

const ProgrammeStoreContext = createContext<ProgrammeStore | null>(null);

export function ProgrammeStoreProvider({ children }: { children: ReactNode }) {
  const [programmes, setProgrammes] = useState<Programme[]>(MOCK_PROGRAMMES);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("nexusai_programmes");
      if (stored) setProgrammes(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persist whenever programmes changes (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("nexusai_programmes", JSON.stringify(programmes));
    } catch {
      /* ignore */
    }
  }, [programmes, hydrated]);

  const addProgramme = useCallback((p: Programme) => {
    setProgrammes((prev) => [p, ...prev]);
  }, []);

  const deleteProgramme = useCallback((id: string) => {
    setProgrammes((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateProgrammeStatus = useCallback((id: string, status: ProgrammeStatus) => {
    const now = new Date().toISOString();
    setProgrammes((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status,
              updatedAt: now,
              ...(status === "submitted" ? { submittedAt: now } : {}),
              ...(status === "published" ? { publishedAt: now } : {}),
            }
          : p
      )
    );
  }, []);

  return (
    <ProgrammeStoreContext.Provider
      value={{ programmes, addProgramme, deleteProgramme, updateProgrammeStatus }}
    >
      {children}
    </ProgrammeStoreContext.Provider>
  );
}

export function useProgrammeStore() {
  const ctx = useContext(ProgrammeStoreContext);
  if (!ctx) throw new Error("useProgrammeStore must be used within ProgrammeStoreProvider");
  return ctx;
}
