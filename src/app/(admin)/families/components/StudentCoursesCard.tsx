import { Student, Enrollment } from "@/types/families";
import { User } from "lucide-react";

interface StudentCoursesCardProps {
  student: Student;
  enrollments: Enrollment[];
  totalPaid: number;
  totalDue: number;
}

export default function StudentCoursesCard({
  student,
  enrollments,
  totalPaid,
  totalDue,
}: StudentCoursesCardProps) {
  const getPaymentStatus = () => {
    if (totalPaid >= totalDue && totalDue > 0) return "paid";
    if (totalPaid > 0) return "partial";
    return "pending";
  };

  const statusConfig = {
    paid: { label: "Payé", className: "bg-green-100 text-green-800" },
    partial: { label: "Partiel", className: "bg-orange-100 text-orange-800" },
    pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
  };

  const status = getPaymentStatus();

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <h5 className="font-medium text-sm flex items-center gap-2">
        <User size={16} />
        {student.first_name} {student.last_name}
        <span className="text-xs text-gray-500">
          ({student.registration_type === "child" ? "Enfant" : "Adulte"})
        </span>
      </h5>

      {enrollments.length > 0 ? (
        <div className="mt-2 space-y-1">
          {enrollments.map(enrollment => (
            <div
              key={enrollment.id || `${student.id}-${enrollment.courses?.id}`}
              className="flex items-center justify-between p-2 bg-white rounded"
            >
              <div>
                <span className="font-medium">{enrollment.courses?.name}</span>
                <div className="text-sm text-gray-600">{enrollment.courses?.type}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-lg">{enrollment.courses?.price || 0}€</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    statusConfig[status].className
                  }`}
                >
                  {statusConfig[status].label}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-xs text-yellow-700">
            ⚠️ Aucun cours inscrit pour cette année scolaire
          </p>
        </div>
      )}
    </div>
  );
}
