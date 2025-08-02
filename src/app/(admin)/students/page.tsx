import supabase from "@/lib/supabase";
import { Student, Course } from "@/types/families";
import StudentsList from "./components/StudentsList";

interface StudentWithFamily extends Omit<Student, "enrollments"> {
  family: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  enrollments: any[];
  created_at: string;
  activeEnrollments: any[];
  finishedEnrollments: any[];
  activeCoursesCount: number;
  hasHistory: boolean;
  hasMultipleCourses: boolean;
  course: string;
}

export default async function StudentsPage() {
  // Récupérer les données de base des étudiants côté serveur
  const { data: families, error: familiesError } = await supabase
    .from("families")
    .select(
      `
      id,
      last_name,
      first_name,
      email,
      phone,
      students!inner (
        id,
        first_name,
        last_name,
        birth_date,
        registration_type,
        level,
        notes,
        created_at,
        enrollments (
          id,
          status,
              start_date,
              end_date,
              created_at,
          courses:course_id (
                id,
                name,
                type,
                category,
            label,
            status
          )
<<<<<<< HEAD
        `);

      if (error) {
        console.error("Erreur Supabase :", error);
        setLoading(false);
        return;
      }

      // Récupérer tous les cours disponibles pour l'attribution
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("id, name, type, category, label, status")
        .eq("status", "active")
        .order("name");

      if (coursesError) {
        console.error("Erreur récupération cours :", coursesError);
      } else {
        setAvailableCourses(coursesData || []);
      }

      // Transformer les données avec gestion historique
      const allStudents = (data || []).flatMap((family: any) =>
        (family.students || []).map((student: any) => {
          const enrollments = student.enrollments || [];

          // Séparer les cours actifs et terminés
          const activeEnrollments = enrollments.filter((e: any) => e.status === "active");
          const finishedEnrollments = enrollments.filter((e: any) => e.status === "finished");

          // Cours principal (le plus récent actif, ou le premier actif)
          const primaryEnrollment = activeEnrollments.sort(
            (a: any, b: any) =>
              new Date(b.start_date || b.created_at).getTime() -
              new Date(a.start_date || a.created_at).getTime()
          )[0];

          const primaryCourse = primaryEnrollment?.courses;

          // Statistiques
          const totalEnrollments = enrollments.length;
          const activeCount = activeEnrollments.length;
          const finishedCount = finishedEnrollments.length;

          return {
            id: student.id,
            name: `${student.first_name} ${student.last_name}`,
            firstName: student.first_name,
            lastName: student.last_name,
            age: calculateAge(student.birth_date),
            birthDate: student.birth_date,

            // Cours principal
            course: primaryCourse?.name || "Non assigné",
            courseName: primaryCourse?.label || primaryCourse?.name || "Non assigné",
            courseType: primaryCourse?.type || null,
            courseId: primaryCourse?.id || null,

            // Informations sur les inscriptions
            type: student.registration_type || "child",
            level: student.level || null,
            notes: student.notes || null,

            // Famille
            family: `${family.last_name} ${family.first_name}`,
            familyEmail: family.email,
            familyPhone: family.phone,

            // Statistiques des cours
            activeCoursesCount: activeCount,
            totalCoursesCount: totalEnrollments,
            hasHistory: finishedCount > 0,
            hasMultipleCourses: activeCount > 1,

            // Listes détaillées
            activeCourses: activeEnrollments.map((e: any) => ({
              id: e.id,
              name: e.courses?.name,
              label: e.courses?.label || e.courses?.name,
              startDate: e.start_date,
              enrollmentId: e.id,
            })),

            courseHistory: finishedEnrollments
              .map((e: any) => ({
                id: e.id,
                name: e.courses?.name,
                label: e.courses?.label || e.courses?.name,
                startDate: e.start_date,
                endDate: e.end_date,
                enrollmentId: e.id,
              }))
              .sort(
                (a: any, b: any) =>
                  new Date(b.endDate || b.startDate).getTime() -
                  new Date(a.endDate || a.startDate).getTime()
              ),

            // Dates importantes
            firstEnrollment:
              enrollments.length > 0
                ? enrollments.sort(
                    (a: any, b: any) =>
                      new Date(a.start_date || a.created_at).getTime() -
                      new Date(b.start_date || b.created_at).getTime()
                  )[0].start_date || enrollments[0].created_at
                : student.created_at,

            latestEnrollment: primaryEnrollment?.start_date || primaryEnrollment?.created_at,

            // Données brutes pour les actions
            rawStudent: student,
            rawFamily: family,
            rawEnrollments: enrollments,
          };
        })
      );

      setStudents(allStudents);
    } catch (error) {
      console.error("Erreur générale :", error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour attribuer un cours à un étudiant
  const assignCourseToStudent = async () => {
    if (!selectedStudent || !selectedCourseForEdit) return;

    setEnrollmentLoading(true);

    try {
      // Créer le nouvel enrollment
      const { data, error } = await supabase
        .from("enrollments")
        .insert([
          {
            student_id: selectedStudent.id,
            course_id: selectedCourseForEdit,
            start_date: new Date().toISOString().split("T")[0],
            status: "active",
=======
        )
      )
    `
    )
    .order("last_name");

  if (familiesError) {
    console.error("Error fetching families:", familiesError);
    return null;
  }

  // Récupérer les cours disponibles
  const { data: courses, error: coursesError } = await supabase
    .from("courses")
    .select("id, name, type, category, label, status, price")
    .eq("status", "active")
    .order("name");

  if (coursesError) {
    console.error("Error fetching courses:", coursesError);
    return null;
  }

  // Transformer les données pour le composant client
  const students: StudentWithFamily[] =
    families?.flatMap(family =>
      family.students.map(student => {
        const enrollments = student.enrollments || [];
        const activeEnrollments = enrollments.filter(e => e.status === "active");
        const finishedEnrollments = enrollments.filter(e => e.status === "finished");
        const primaryCourse = activeEnrollments[0]?.courses;

        return {
          id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          birth_date: student.birth_date,
          registration_type: student.registration_type,
          level: student.level,
          notes: student.notes,
          created_at: student.created_at,
          enrollments,
          activeEnrollments,
          finishedEnrollments,
          activeCoursesCount: activeEnrollments.length,
          hasHistory: finishedEnrollments.length > 0,
          hasMultipleCourses: activeEnrollments.length > 1,
          course: primaryCourse?.name || "Non assigné",
          family: {
            id: family.id,
            name: `${family.last_name} ${family.first_name}`,
            email: family.email,
            phone: family.phone,
>>>>>>> main
          },
        };
      })
    ) || [];

  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto">
        <StudentsList initialStudents={students} availableCourses={courses || []} />
      </div>
<<<<<<< HEAD

      {/* Tableau */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Chargement des élèves...</div>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500 mb-2">Aucun élève trouvé</p>
          {searchTerm && (
            <p className="text-sm text-gray-400">
              Essayez de modifier votre recherche ou vos filtres
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Élève</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Cours</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Statut</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Famille</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">
                    Première inscription
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          {getTypeDisplay(student.type, student.age)}
                          {student.level && ` • ${student.level}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div
                          className={
                            student.course === "Non assigné"
                              ? "text-gray-400 italic"
                              : "text-gray-900"
                          }
                        >
                          {student.course}
                        </div>

                        {/* Badges pour cours multiples et historique */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {student.hasMultipleCourses && (
                            <Badge variant="outline" className="text-xs">
                              +{student.activeCoursesCount - 1} autre
                              {student.activeCoursesCount > 2 ? "s" : ""}
                            </Badge>
                          )}
                          {student.hasHistory && (
                            <Badge variant="secondary" className="text-xs">
                              <History size={10} className="mr-1" />
                              Historique
                            </Badge>
                          )}
                          {student.activeCoursesCount === 0 && student.totalCoursesCount > 0 && (
                            <Badge variant="outline" className="text-xs text-orange-600">
                              Cours terminés
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {student.activeCoursesCount > 0 ? (
                          <Badge className="bg-green-100 text-green-800">
                            {student.activeCoursesCount} actif
                            {student.activeCoursesCount > 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Sans cours</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-gray-900">{student.family}</div>
                        <div className="text-xs text-gray-500">{student.familyEmail}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(student.firstEnrollment)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="Voir les détails"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Eye size={16} />
                            </button>
                          </DialogTrigger>
                          {selectedStudent && <StudentDetailsModal student={selectedStudent} />}
                        </Dialog>

                        <button
                          className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                          title="Attribuer/Modifier cours"
                          onClick={() => {
                            setSelectedStudent(student);
                            setEditModalOpen(true);
                          }}
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-600">
            {filteredStudents.length} élève{filteredStudents.length > 1 ? "s" : ""} affiché
            {filteredStudents.length > 1 ? "s" : ""}
            {students.length !== filteredStudents.length && ` sur ${students.length} total`}
          </div>
        </div>
      )}

      {/* Modals */}
      <CourseAssignmentModal />
=======
>>>>>>> main
    </div>
  );
}
