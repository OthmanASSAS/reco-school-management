"use client";

import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";
import { updateCourseDiscountSettings } from "../actions/actions.server";

const DEFAULTS = { startAt: 3, step: 25, mode: "cumulative" };

export default function CourseDiscountSettingsForm() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "course_discount")
        .single();
      if (data?.value) setSettings(data.value);
      setLoading(false);
    }
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
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
    <form
      onSubmit={handleSave}
      className="max-w-md mx-auto space-y-6 bg-white p-6 rounded-lg border shadow"
    >
      <h2 className="text-xl font-bold mb-2">Paramètres du dégressif sur les cours</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="startAt">À partir du cours n°</Label>
          <Input
            id="startAt"
            name="startAt"
            type="number"
            min={1}
            value={settings.startAt || ""}
            onChange={handleChange}
            className="mt-1"
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="step">Montant de la réduction (€)</Label>
          <Input
            id="step"
            name="step"
            type="number"
            min={0}
            value={settings.step}
            onChange={handleChange}
            className="mt-1"
            disabled={loading}
          />
        </div>
        <div>
          <Label htmlFor="mode">Mode de réduction</Label>
          <Select
            name="mode"
            value={settings.mode}
            onValueChange={val => setSettings(prev => ({ ...prev, mode: val }))}
            disabled={loading}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cumulative">Cumulatif (-25€, -50€, ...)</SelectItem>
              <SelectItem value="fixed">Fixe (-25€ chaque cours supplémentaire)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={loading || saving || isPending}>
          {saving || isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
