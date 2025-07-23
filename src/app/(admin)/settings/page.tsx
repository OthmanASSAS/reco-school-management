import CourseDiscountSettingsForm from "./components/CourseDiscountSettingsForm";

export default function SettingsPage() {
  return (
    <div className="w-full p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
      <CourseDiscountSettingsForm />
    </div>
  );
}
