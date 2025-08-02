import { Settings, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CourseDiscountSettingsForm from "./components/CourseDiscountSettingsForm";

export default function SettingsPage() {
  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-4xl md:mx-auto space-y-6">
        {/* Header moderne */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Paramètres</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <CourseDiscountSettingsForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
