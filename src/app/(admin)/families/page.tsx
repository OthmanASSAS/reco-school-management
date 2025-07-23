import FamiliesList from "./components/FamiliesList";

export default function FamiliesPage() {
  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto">
        <FamiliesList />
      </div>
    </div>
  );
}
