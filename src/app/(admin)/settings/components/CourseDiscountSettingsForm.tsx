// /Users/oassas/Projets/inscription-app/src/app/(admin)/settings/components/CourseDiscountSettingsForm.tsx
"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateCourseDiscountSettings } from "../actions/actions.server";
import { Percent, Calculator, Save, Loader2 } from "lucide-react";

export default function CourseDiscountSettingsForm({ initialSettings }: { initialSettings: any }) {
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev: any) => ({
      ...prev,
      [name]: name === "startAt" || name === "step" ? Number(value) : value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    startTransition(async () => {
      try {
        await updateCourseDiscountSettings(settings);
        toast({
          title: "Paramètres enregistrés !",
          description: "Le dégressif est à jour.",
          variant: "default",
        });
      } catch (error: any) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } finally {
        setSaving(false);
      }
    });
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Calculator className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Paramètres du dégressif sur les cours
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Configurez les réductions automatiques pour les inscriptions multiples
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startAt" className="text-sm font-medium text-gray-700">
                À partir du cours n°
              </Label>
              <div className="relative">
                <Input
                  id="startAt"
                  name="startAt"
                  type="number"
                  min={1}
                  value={settings.startAt ?? ""}
                  onChange={handleChange}
                  className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                  placeholder="3"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Calculator className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Le dégressif commence à partir de ce nombre de cours
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="step" className="text-sm font-medium text-gray-700">
                Montant de la réduction (€)
              </Label>
              <div className="relative">
                <Input
                  id="step"
                  name="step"
                  type="number"
                  min={0}
                  value={settings.step ?? ""}
                  onChange={handleChange}
                  className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                  placeholder="25"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Percent className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              <p className="text-xs text-gray-500">Montant de la réduction appliquée</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mode" className="text-sm font-medium text-gray-700">
              Mode de réduction
            </Label>
            <Select
              name="mode"
              value={settings.mode}
              onValueChange={val => setSettings((prev: any) => ({ ...prev, mode: val }))}
            >
              <SelectTrigger className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200">
                <SelectValue placeholder="Sélectionner un mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cumulative">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    <span>Cumulatif (-25€, -50€, -75€...)</span>
                  </div>
                </SelectItem>
                <SelectItem value="fixed">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    <span>Fixe (-25€ chaque cours supplémentaire)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Choisissez comment la réduction s'applique</p>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button
              type="submit"
              disabled={saving || isPending}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {saving || isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
