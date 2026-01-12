import RegistrationWizard from "@/app/(admin)/registration/components/RegistrationWizard";
import { getFamiliesMinimal } from "@/lib/dal/families";
import { getActiveCourses } from "@/lib/dal/courses";

export default async function RegistrationPage() {
  // Chargement via DAL Prisma
  const [families, courses] = await Promise.all([
    getFamiliesMinimal(),
    getActiveCourses(),
  ]);

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-4xl md:mx-auto">
        <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Guichet d’inscription</h1>
        <RegistrationWizard families={families} courses={courses} />
      </div>
    </div>
  );
}
