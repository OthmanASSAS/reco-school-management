import { Suspense } from "react";
import PreRegistrationForm from "@/components/pre-registration-form";

export default function PreRegistrationPage() {
  return (
    <div className="w-full p-4 md:p-6">
      <Suspense fallback={<div>Chargement...</div>}>
        <PreRegistrationForm />
      </Suspense>
    </div>
  );
}
