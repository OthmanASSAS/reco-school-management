"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabase";

export type SchoolYear = { id: string; label: string; start_date: string; end_date: string | null };

type SchoolYearContextValue = {
  schoolYears: SchoolYear[];
  currentSchoolYearId: string | null;
  setCurrentSchoolYearId: (id: string | null) => void;
  loading: boolean;
};

const SchoolYearContext = createContext<SchoolYearContextValue | null>(null);

export function useSchoolYear() {
  const ctx = useContext(SchoolYearContext);
  if (!ctx) throw new Error("useSchoolYear must be used within SchoolYearProvider");
  return ctx;
}

export function SchoolYearProvider({ children }: { children: React.ReactNode }) {
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);
  const [currentSchoolYearId, setCurrentSchoolYearId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("school_years")
        .select("id, label, start_date, end_date")
        .order("start_date", { ascending: false });
      if (!isMounted) return;
      if (!error && data) {
        setSchoolYears(data as SchoolYear[]);
        const saved =
          typeof window !== "undefined" ? localStorage.getItem("selectedSchoolYearId") : null;
        if (saved && data.find(y => y.id === saved)) {
          setCurrentSchoolYearId(saved);
        } else {
          const now = new Date();
          const current = data.find(y => {
            const s = new Date(y.start_date);
            const e = y.end_date ? new Date(y.end_date) : new Date(s.getFullYear() + 1, 7, 31);
            return now >= s && now <= e;
          });
          setCurrentSchoolYearId(current?.id || data[0]?.id || null);
        }
      }
      setLoading(false);
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (currentSchoolYearId && typeof window !== "undefined") {
      localStorage.setItem("selectedSchoolYearId", currentSchoolYearId);
    }
  }, [currentSchoolYearId]);

  const value = useMemo(
    () => ({ schoolYears, currentSchoolYearId, setCurrentSchoolYearId, loading }),
    [schoolYears, currentSchoolYearId, loading]
  );

  return <SchoolYearContext.Provider value={value}>{children}</SchoolYearContext.Provider>;
}
