// /Users/oassas/Projets/inscription-app/src/app/(admin)/layout.tsx
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { NetworkStatusToast } from "@/components/NetworkStatusToast";
import { SchoolYearProvider } from "./SchoolYearProvider";
import { SchoolYearSwitcher } from "./SchoolYearSwitcher";
import { getSchoolYears } from "@/lib/dal/families";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Récupération des années scolaires via Prisma au coeur du Layout (Server Component)
  // Cela évite les erreurs de fetch Supabase côté client (ERR_NAME_NOT_RESOLVED)
  const schoolYears = await getSchoolYears();

  return (
    <>
      <NetworkStatusToast />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 md:ml-64 bg-gray-50 pt-16 md:pt-6">
          <SchoolYearProvider initialSchoolYears={schoolYears}>
            <div className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur border-b">
              <div className="flex items-center justify-end h-12">
                <SchoolYearSwitcher />
              </div>
            </div>
            {children}
          </SchoolYearProvider>
        </main>
      </div>
    </>
  );
}
