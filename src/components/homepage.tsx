"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  ArrowRight,
  BookOpen,
  Star,
  Heart,
  GraduationCap,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl font-bold text-gray-900">École Reconnaissance</h1>
                <p className="text-sm text-gray-600">Arabe • Coran • Religion</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Phone size={16} />
                <span>01 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} />
                <span>contact@reconnaissance.fr</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-800 border-emerald-200">
              📚 Inscriptions ouvertes 2025
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight">
              Apprenez l’arabe et le Coran
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              Rejoignez notre école pour apprendre la langue arabe, mémoriser le Coran et
              approfondir vos connaissances religieuses dans un environnement bienveillant et
              professionnel.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 max-w-lg sm:max-w-2xl mx-auto mb-8 sm:mb-12 px-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">3</div>
                <div className="text-xs sm:text-sm text-gray-600">Disciplines</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">150+</div>
                <div className="text-xs sm:text-sm text-gray-600">Élèves</div>
              </div>
              <div className="text-center col-span-2 sm:col-span-1">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">5+</div>
                <div className="text-xs sm:text-sm text-gray-600">Années d’expérience</div>
              </div>
            </div>
          </div>

          {/* Main CTA Section */}
          <div className="mb-12 sm:mb-16 px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3 sm:mb-4">
              Choisissez votre parcours d’inscription
            </h2>
            <p className="text-center text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto">
              Sélectionnez l’option qui correspond à votre situation pour une inscription rapide et
              personnalisée.
            </p>

            <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              {/* Nouvelle famille */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-blue-600/5 group-hover:from-emerald-600/10 group-hover:to-blue-600/10 transition-all duration-300"></div>
                <CardHeader className="relative p-4 sm:p-6 flex-grow">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                      <Users className="text-white" size={24} />
                    </div>
                    <div className="text-center sm:text-left">
                      <Badge variant="outline" className="text-emerald-600 border-emerald-300 mb-2">
                        🆕 Nouvelle famille
                      </Badge>
                      <CardTitle className="text-xl sm:text-2xl text-gray-900">
                        Première inscription
                      </CardTitle>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-center sm:text-left">
                    Vous découvrez notre école ? Créez votre dossier famille et effectuez vos
                    inscriptions en quelques étapes simples. Nous vous accompagnons dans votre choix
                    de cours.
                  </p>
                </CardHeader>
                <CardContent className="relative p-4 sm:p-6 pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full shrink-0"></div>
                      <span>Création de votre dossier famille</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full shrink-0"></div>
                      <span>Inscription enfants ou adultes</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full shrink-0"></div>
                      <span>Rendez-vous personnalisé</span>
                    </div>
                  </div>
                  <Link href="/pre-registration" className="block">
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 group-hover:scale-105 transition-all duration-300 h-11 sm:h-12 text-sm sm:text-base">
                      <span>Faire une demande d’inscription</span>
                      <ArrowRight
                        className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
                        size={16}
                      />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Famille existante */}
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-300"></div>
                <CardHeader className="relative p-4 sm:p-6 flex-grow">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                      <UserPlus className="text-white" size={24} />
                    </div>
                    <div className="text-center sm:text-left">
                      <Badge variant="outline" className="text-blue-600 border-blue-300 mb-2">
                        👨‍👩‍👧‍👦 Famille existante
                      </Badge>
                      <CardTitle className="text-xl sm:text-2xl text-gray-900">
                        Ajouter un élève
                      </CardTitle>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-center sm:text-left mb-4">
                    Vous avez déjà des personnes inscrites chez nous ? Ajoutez facilement un nouvel
                    élève (enfant ou adulte) à votre dossier famille existant sans ressaisir vos
                    informations.
                  </p>
                  {/* Espace supplémentaire pour équilibrer avec la carte de gauche */}
                  <div className="hidden lg:block h-4"></div>
                </CardHeader>
                <CardContent className="relative p-4 sm:p-6 pt-0">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0"></div>
                      <span>Identification rapide de votre famille</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0"></div>
                      <span>Ajout du nouvel élève uniquement</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0"></div>
                      <span>Nouveau rendez-vous si nécessaire</span>
                    </div>
                  </div>
                  <Link href="/add-student" className="block">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 group-hover:scale-105 transition-all duration-300 h-11 sm:h-12 text-sm sm:text-base">
                      <span>Inscrire un élève supplémentaire</span>
                      <ArrowRight
                        className="ml-2 group-hover:translate-x-1 transition-transform duration-300"
                        size={16}
                      />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-12 sm:mb-16 px-4">
            <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
              Pourquoi choisir l’École Reconnaissance ?
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Star className="text-white" size={24} />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Enseignement de qualité
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  Un apprentissage progressif et adapté à chaque âge, avec des méthodes pédagogiques
                  éprouvées.
                </p>
              </div>
              <div className="text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="text-white" size={24} />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Cours adaptés
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  Des programmes personnalisés pour enfants et adultes, du niveau débutant au
                  perfectionnement.
                </p>
              </div>
              <div className="text-center group sm:col-span-2 lg:col-span-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="text-white" size={24} />
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  Environnement bienveillant
                </h4>
                <p className="text-gray-600 text-sm sm:text-base">
                  Un cadre respectueux et encourageant qui favorise l’épanouissement et
                  l’apprentissage.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t border-gray-200 pt-8 sm:pt-12 px-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8">
              <h4 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Des questions sur nos cours ?
              </h4>
              <p className="text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
                Notre équipe est là pour vous conseiller et vous accompagner dans le choix des cours
                les mieux adaptés à vos besoins et votre niveau.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone size={18} className="text-emerald-600" />
                  <span className="font-medium text-sm sm:text-base">01 23 45 67 89</span>
                </div>
                <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail size={18} className="text-blue-600" />
                  <span className="font-medium text-sm sm:text-base">
                    contact@reconnaissance.fr
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
