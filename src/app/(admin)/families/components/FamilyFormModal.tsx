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
import { UserPlus, AlertCircle, Users, Mail, MapPin, Home, Phone } from "lucide-react";
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
    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300">
      <UserPlus size={16} className="mr-2" />
      Nouvelle famille
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerButton || defaultTrigger}</DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <DialogHeader className="text-center pb-6 flex-shrink-0">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Nouvelle famille
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-y-auto px-6">
          {/* Message de feedback */}
          {state.message && (
            <Alert
              className={
                state.success
                  ? "border-green-500 bg-green-50 shadow-lg"
                  : "border-red-500 bg-red-50 shadow-lg"
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
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  Informations de la famille
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="parentFirstName" className="text-sm font-medium text-gray-700">
                      Prénom du parent *
                    </Label>
                    <Input
                      id="parentFirstName"
                      value={family.parentFirstName}
                      onChange={e => setFamily({ ...family, parentFirstName: e.target.value })}
                      placeholder="Prénom"
                      className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                      required
                    />
                    {state.errors?.firstName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="familyName" className="text-sm font-medium text-gray-700">
                      Nom de famille *
                    </Label>
                    <Input
                      id="familyName"
                      value={family.familyName}
                      onChange={e => setFamily({ ...family, familyName: e.target.value })}
                      placeholder="Nom de famille"
                      className="h-11 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                      required
                    />
                    {state.errors?.lastName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.lastName}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informations de contact */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  Informations de contact
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={family.contactEmail}
                    onChange={e => setFamily({ ...family, contactEmail: e.target.value })}
                    placeholder="email@exemple.com"
                    className="h-11 border-gray-200 focus:border-green-300 focus:ring-green-200"
                    required
                  />
                  {state.errors?.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-sm font-medium text-gray-700">
                    Téléphone
                  </Label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={family.contactPhone}
                      onChange={e => setFamily({ ...family, contactPhone: e.target.value })}
                      placeholder="06 12 34 56 78"
                      className="h-11 pl-10 border-gray-200 focus:border-green-300 focus:ring-green-200"
                    />
                  </div>
                  {state.errors?.phone && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.phone}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Adresse */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Home className="h-5 w-5 text-purple-600" />
                  </div>
                  Adresse
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Adresse
                  </Label>
                  <Input
                    id="address"
                    value={family.address}
                    onChange={e => setFamily({ ...family, address: e.target.value })}
                    placeholder="123 Rue de la Paix"
                    className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                  />
                  {state.errors?.address && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {state.errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                      Code postal
                    </Label>
                    <Input
                      id="postalCode"
                      value={family.postalCode}
                      onChange={e => setFamily({ ...family, postalCode: e.target.value })}
                      placeholder="75001"
                      className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                    />
                    {state.errors?.postalCode && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.postalCode}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                      Ville
                    </Label>
                    <Input
                      id="city"
                      value={family.city}
                      onChange={e => setFamily({ ...family, city: e.target.value })}
                      placeholder="Paris"
                      className="h-11 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                    />
                    {state.errors?.city && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {state.errors.city}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Boutons d'action */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 flex-shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 border-gray-300 hover:bg-gray-50"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={state.success}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
