"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, FileText } from "lucide-react";

interface GradesOverviewProps {
  courses: any[];
  subjects: any[];
  students: any[];
  schoolYears: any[];
  enrollments?: any[];
}

export function GradesOverview({
  courses,
  subjects,
  students,
  schoolYears,
  enrollments = [],
}: GradesOverviewProps) {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Vue d'ensemble des notes
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Visualisez les statistiques et exportez les bulletins
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Vue d'ensemble en cours de développement
            </h3>
            <p className="text-gray-500 mb-6">
              Cette section permettra de visualiser les statistiques, graphiques et exporter les
              bulletins.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Graphiques
              </Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Statistiques
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Export PDF
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
