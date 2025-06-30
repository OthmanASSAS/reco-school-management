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
  parentFirstName: string;
  familyName: string;
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
            {/* Informations principales */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                  <Users size={20} />
                  Informations principales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parentFirstName" className="text-base font-medium">
                      Prénom du parent *
                    </Label>
                    <Input
                      id="parentFirstName"
                      placeholder="Entrez le prénom"
                      value={family.parentFirstName}
                      onChange={e => setFamily({ ...family, parentFirstName: e.target.value })}
                      className="mt-2 h-11"
                      required
                    />
                    {state.errors?.firstName && (
                      <p className="text-sm text-red-500 mt-1">{state.errors.firstName[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="familyName" className="text-base font-medium">
                      Nom de famille *
                    </Label>
                    <Input
                      id="familyName"
                      placeholder="Entrez le nom de famille"
                      value={family.familyName}
                      onChange={e => setFamily({ ...family, familyName: e.target.value })}
                      className="mt-2 h-11"
                      required
                    />
                    {state.errors?.lastName && (
                      <p className="text-sm text-red-500 mt-1">{state.errors.lastName[0]}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                  <Mail size={20} />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactEmail" className="text-base font-medium">
                      Email de contact *
                    </Label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="famille@email.com"
                        value={family.contactEmail}
                        onChange={e => setFamily({ ...family, contactEmail: e.target.value })}
                        className="mt-2 h-11 pl-10"
                        required
                      />
                    </div>
                    {state.errors?.email && (
                      <p className="text-sm text-red-500 mt-1">{state.errors.email[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactPhone" className="text-base font-medium">
                      Téléphone
                    </Label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <Input
                        id="contactPhone"
                        placeholder="06 12 34 56 78"
                        value={family.contactPhone}
                        onChange={e => setFamily({ ...family, contactPhone: e.target.value })}
                        className="mt-2 h-11 pl-10"
                      />
                    </div>
                    {state.errors?.phone && (
                      <p className="text-sm text-red-500 mt-1">{state.errors.phone[0]}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adresse */}
            <Card className="border-purple-200 bg-purple-50/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-purple-800">
                  <MapPin size={20} />
                  Adresse
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address" className="text-base font-medium">
                    Adresse
                  </Label>
                  <Input
                    id="address"
                    placeholder="10 rue des écoles"
                    value={family.address}
                    onChange={e => setFamily({ ...family, address: e.target.value })}
                    className="mt-2 h-11"
                  />
                  {state.errors?.address && (
                    <p className="text-sm text-red-500 mt-1">{state.errors.address[0]}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode" className="text-base font-medium">
                      Code postal
                    </Label>
                    <Input
                      id="postalCode"
                      placeholder="75000"
                      value={family.postalCode}
                      onChange={e => setFamily({ ...family, postalCode: e.target.value })}
                      className="mt-2 h-11"
                    />
                    {state.errors?.postalCode && (
                      <p className="text-sm text-red-500 mt-1">{state.errors.postalCode[0]}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="city" className="text-base font-medium">
                      Ville
                    </Label>
                    <Input
                      id="city"
                      placeholder="Paris"
                      value={family.city}
                      onChange={e => setFamily({ ...family, city: e.target.value })}
                      className="mt-2 h-11"
                    />
                    {state.errors?.city && (
                      <p className="text-sm text-red-500 mt-1">{state.errors.city[0]}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="h-11 px-6"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-11 px-6"
              >
                <UserPlus size={16} className="mr-2" />
                Créer la famille
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
