import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlanningView from "./components/PlanningView";

export default function PlanningPage() {
  return (
    <div className="w-full p-4 md:p-6">
      <div className="w-full md:max-w-7xl md:mx-auto space-y-6">
        {/* Header moderne */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Planning</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <PlanningView />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
