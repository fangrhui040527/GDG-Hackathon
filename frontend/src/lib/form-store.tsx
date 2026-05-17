"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type FormType = "company" | "mentor" | "partner" | "service-provider";

export interface FormSubmission {
  id: string;
  formType: FormType;
  submittedAt: string;
  data: Record<string, string>;
}

interface FormStore {
  submissions: FormSubmission[];
  addSubmission: (formType: FormType, data: Record<string, string>) => void;
  getSubmissions: (formType: FormType) => FormSubmission[];
}

const FormStoreContext = createContext<FormStore | null>(null);

export function FormStoreProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("yokoyoko_form_submissions");
      if (stored) setSubmissions(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("yokoyoko_form_submissions", JSON.stringify(submissions));
    } catch {
      /* ignore */
    }
  }, [submissions, hydrated]);

  const addSubmission = useCallback((formType: FormType, data: Record<string, string>) => {
    const entry: FormSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      formType,
      submittedAt: new Date().toISOString(),
      data,
    };
    setSubmissions((prev) => [entry, ...prev]);
  }, []);

  const getSubmissions = useCallback(
    (formType: FormType) => submissions.filter((s) => s.formType === formType),
    [submissions]
  );

  return (
    <FormStoreContext.Provider value={{ submissions, addSubmission, getSubmissions }}>
      {children}
    </FormStoreContext.Provider>
  );
}

export function useFormStore() {
  const ctx = useContext(FormStoreContext);
  if (!ctx) throw new Error("useFormStore must be used within FormStoreProvider");
  return ctx;
}
