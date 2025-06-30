// Utilitaires partagés pour toutes les actions

// Fonction utilitaire pour convertir FormData en string
export function getFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);
  return value ? value.toString().trim() : "";
}

// Fonction utilitaire pour les booléens
export function getFormBoolean(formData: FormData, key: string): boolean {
  return formData.get(key) === "on";
}

// Types communs
export interface BaseState {
  message?: string | null;
  success?: boolean;
}

// Fonction utilitaire pour formater les erreurs Zod
export function formatZodErrors<T>(errors: any): Partial<Record<keyof T, string[]>> {
  const formatted: any = {};

  for (const [key, value] of Object.entries(errors)) {
    if (value && typeof value === "object" && "_errors" in value) {
      formatted[key] = (value as any)._errors;
    }
  }

  return formatted;
}
