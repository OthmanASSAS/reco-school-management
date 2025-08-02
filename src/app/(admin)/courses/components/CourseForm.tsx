"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CourseFormProps {
  initialData?: any;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

export default function CourseForm({ initialData, onSubmit, onCancel }: CourseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
    } catch (error) {
      console.error("Erreur soumission:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission du formulaire.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Nom du cours</Label>
          <Input id="name" name="name" defaultValue={initialData?.name} required className="mt-1" />
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <Select name="type" defaultValue={initialData?.type || "enfants"}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="enfants">Enfants</SelectItem>
              <SelectItem value="adultes">Adultes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="label">Label</Label>
          <Input id="label" name="label" defaultValue={initialData?.label} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="category">Catégorie</Label>
          <Input
            id="category"
            name="category"
            defaultValue={initialData?.category}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="status">Statut</Label>
          <Select name="status" defaultValue={initialData?.status || "active"}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="capacity">Capacité</Label>
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min="0"
            defaultValue={initialData?.capacity}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="price">Prix</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initialData?.price}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}
