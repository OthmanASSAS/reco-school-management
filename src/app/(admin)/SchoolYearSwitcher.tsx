"use client";

import React from "react";
import { useSchoolYear } from "./SchoolYearProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SchoolYearSwitcher() {
  const { schoolYears, currentSchoolYearId, setCurrentSchoolYearId, loading } = useSchoolYear();

  if (loading) return null;
  if (!schoolYears.length) return null;

  return (
    <div className="px-4 py-2">
      <Select
        value={currentSchoolYearId || undefined}
        onValueChange={val => setCurrentSchoolYearId(val)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Année scolaire" />
        </SelectTrigger>
        <SelectContent>
          {schoolYears.map(y => (
            <SelectItem key={y.id} value={y.id}>
              {y.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
