"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Programme, ProgrammeStatus } from "@/types";

interface ProgrammeStore {
  programmes: Programme[];
  addProgramme: (p: Programme) => void;
  deleteProgramme: (id: string) => void;
  updateProgrammeStatus: (id: string, status: ProgrammeStatus) => void;
}

const ProgrammeStoreContext = createContext<ProgrammeStore | null>(null);

export function ProgrammeStoreProvider({ children }: { children: ReactNode }) {
  const [programmes, setProgrammes] = useState<Programme[]>([]);

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
