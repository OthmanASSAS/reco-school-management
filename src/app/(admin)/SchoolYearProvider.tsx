// /Users/oassas/Projets/inscription-app/src/app/(admin)/SchoolYearProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SchoolYearListItem = { 
  id: string; 
  label: string; 
  start_date: string; 
  end_date: string | null;
  is_current?: boolean | null;
};

type SchoolYearContextValue = {
  schoolYears: SchoolYearListItem[];
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

export function SchoolYearProvider({ 
  children, 
  initialSchoolYears = [] 
}: { 
  children: React.ReactNode;
  initialSchoolYears?: SchoolYearListItem[];
}) {
  const [schoolYears, setSchoolYears] = useState<SchoolYearListItem[]>(initialSchoolYears);
  const [currentSchoolYearId, setCurrentSchoolYearId] = useState<string | null>(null);
  const [loading, setLoading] = useState(initialSchoolYears.length === 0);

  // Initialisation du school year courant
  useEffect(() => {
    if (schoolYears.length > 0 && !currentSchoolYearId) {
      const saved = typeof window !== "undefined" ? localStorage.getItem("selectedSchoolYearId") : null;
      
      if (saved && schoolYears.find(y => y.id === saved)) {
        setCurrentSchoolYearId(saved);
      } else {
        // Chercher l'année marquée comme courante ou l'année calendaire actuelle
        const currentByFlag = schoolYears.find(y => y.is_current);
        if (currentByFlag) {
          setCurrentSchoolYearId(currentByFlag.id);
        } else {
          setCurrentSchoolYearId(schoolYears[0].id);
        }
      }
      setLoading(false);
    }
  }, [schoolYears, currentSchoolYearId]);

  // Sauvegarde dans le localStorage
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
