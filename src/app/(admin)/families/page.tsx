import FamiliesList from "./components/FamiliesList";
import { getFamilies, getSchoolYears } from "@/lib/dal/families";

export const dynamic = 'force-dynamic';

export default async function FamiliesPage() {
  // Charger les données via le DAL Prisma (Architecture DDD)
  const [typedFamilies, typedSchoolYears] = await Promise.all([
    getFamilies(),
    getSchoolYears(),
  ]);

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto">
        <FamiliesList initialFamilies={typedFamilies} initialSchoolYears={typedSchoolYears} />
      </div>
    </div>
  );
}
