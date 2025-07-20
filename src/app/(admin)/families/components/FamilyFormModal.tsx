"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, AlertCircle, Users, Mail, Phone, MapPin } from "lucide-react";
import { createFamily, FamilyState } from "@/lib/actions/families";

interface FamilyFormModalProps {
  onFamilyCreated?: () => void; // Callback après création réussie
  triggerButton?: React.ReactNode; // Bouton personnalisé
}

type FamilyInfo = {
  familyName: string;
  parentFirstName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  postalCode: string;
  city: string;
};

export default function FamilyFormModal({ onFamilyCreated, triggerButton }: FamilyFormModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [family, setFamily] = useState<FamilyInfo>({
    parentFirstName: "",
    familyName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    postalCode: "",
    city: "",
  });

  // Action serveur
  const initialState: FamilyState = { message: null, errors: {}, success: false };
  const [state, action] = useActionState(createFamily, initialState);

  // Fermer la modale et reset en cas de succès
  if (state.success && isOpen) {
    setIsOpen(false);
    setFamily({
      parentFirstName: "",
      familyName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      postalCode: "",
      city: "",
    });
    onFamilyCreated?.(); // Callback pour rafraîchir la liste
  }

  const handleSubmit = (formData: FormData) => {
    // Ajouter les données du state au FormData
    formData.set("firstName", family.parentFirstName);
    formData.set("lastName", family.familyName);
    formData.set("email", family.contactEmail);
    formData.set("phone", family.contactPhone);
    formData.set("address", family.address);
    formData.set("postalCode", family.postalCode);
    formData.set("city", family.city);

    action(formData);
  };

  const defaultTrigger = (
    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
      <UserPlus size={16} className="mr-2" />
      Nouvelle famille
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton || defaultTrigger}</DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users size={24} />
            Nouvelle famille
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Message de feedback */}
          {state.message && (
            <Alert
              className={
                state.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
              }
            >
              <AlertCircle
                className={`h-4 w-4 ${state.success ? "text-green-600" : "text-red-600"}`}
              />
              <AlertDescription className={state.success ? "text-green-800" : "text-red-800"}>
                {state.message}
              </AlertDescription>
            </Alert>
          )}

          <form action={handleSubmit} className="space-y-6">
            {/* Informations de la famille */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  Informations de la famille
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentFirstName">Prénom du parent *</Label>
                    <Input
                      id="parentFirstName"
                      value={family.parentFirstName}
                      onChange={e => setFamily({ ...family, parentFirstName: e.target.value })}
                      placeholder="Prénom"
                      required
                    />
                    {state.errors?.firstName && (
                      <p className="text-sm text-red-600">{state.errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyName">Nom de famille *</Label>
                    <Input
                      id="familyName"
                      value={family.familyName}
                      onChange={e => setFamily({ ...family, familyName: e.target.value })}
                      placeholder="Nom de famille"
                      required
                    />
                    {state.errors?.lastName && (
                      <p className="text-sm text-red-600">{state.errors.lastName}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations de contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail size={20} />
                  Informations de contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={family.contactEmail}
                    onChange={e => setFamily({ ...family, contactEmail: e.target.value })}
                    placeholder="email@exemple.com"
                    required
                  />
                  {state.errors?.email && (
                    <p className="text-sm text-red-600">{state.errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Téléphone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={family.contactPhone}
                    onChange={e => setFamily({ ...family, contactPhone: e.target.value })}
                    placeholder="06 12 34 56 78"
                  />
                  {state.errors?.phone && (
                    <p className="text-sm text-red-600">{state.errors.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Adresse */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin size={20} />
                  Adresse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={family.address}
                    onChange={e => setFamily({ ...family, address: e.target.value })}
                    placeholder="123 Rue de la Paix"
                  />
                  {state.errors?.address && (
                    <p className="text-sm text-red-600">{state.errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code postal</Label>
                    <Input
                      id="postalCode"
                      value={family.postalCode}
                      onChange={e => setFamily({ ...family, postalCode: e.target.value })}
                      placeholder="75001"
                    />
                    {state.errors?.postalCode && (
                      <p className="text-sm text-red-600">{state.errors.postalCode}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      value={family.city}
                      onChange={e => setFamily({ ...family, city: e.target.value })}
                      placeholder="Paris"
                    />
                    {state.errors?.city && (
                      <p className="text-sm text-red-600">{state.errors.city}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={state.success}>
                Créer la famille
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
