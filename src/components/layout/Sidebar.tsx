"use client";

import { cn } from "@/lib/utils";
import {
  BookOpen,
  Building,
  Calendar,
  CreditCard,
  Home,
  LayoutDashboard,
  Menu,
  Settings,
  UserPlus,
  Users,
  X,
  GraduationCap,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "courses", label: "Cours", icon: BookOpen, href: "/courses" },
  { id: "families", label: "Familles", icon: Home, href: "/families" },
  { id: "students", label: "Élèves", icon: Users, href: "/students" },
  { id: "teachers", label: "Professeurs", icon: GraduationCap, href: "/teachers" },
  { id: "rooms", label: "Salles", icon: MapPin, href: "/rooms" },
  { id: "planning", label: "Planning", icon: Calendar, href: "/planning" },
  { id: "grades", label: "Évaluations", icon: Star, href: "/grades" },
  { id: "registration", label: "Inscription", icon: UserPlus, href: "/registration" },
  {
    id: "pre-registration",
    label: "Pré-inscription",
    icon: UserPlus,
    href: "/pre-registration",
  },
  { id: "payments", label: "Paiements", icon: CreditCard, href: "/payments" },
  { id: "settings", label: "Paramètres", icon: Settings, href: "/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 🌐 Mobile toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded shadow"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={cn(
          "bg-white border-r border-gray-200 shadow-md fixed inset-y-0 left-0 w-64 transform transition-transform md:translate-x-0 z-50",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <Building className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">EcoleManager</h2>
            <p className="text-xs text-gray-600">Gestion scolaire</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map(item => {
            const isActive = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-black"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive ? "text-blue-600" : "text-gray-500 group-hover:text-black"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <p className="text-sm font-medium text-blue-900">École Primaire</p>
            <p className="text-xs text-blue-700">Les Petits Génies</p>
          </div>
        </div>
      </aside>

      {/* Overlay when sidebar is open on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black opacity-20 md:hidden z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};
