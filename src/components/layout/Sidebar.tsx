// components/layout/Sidebar.tsx

"use client";

import { cn } from "@/lib/utils";
import {
  BookOpen,
  Building,
  Calendar,
  CreditCard,
  Home,
  LayoutDashboard,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "courses", label: "Cours", icon: BookOpen, href: "/courses" },
  { id: "families", label: "Familles", icon: Home, href: "/families" },
  { id: "students", label: "Élèves", icon: Users, href: "/students" },
  { id: "planning", label: "Planning", icon: Calendar, href: "/planning" },
  { id: "registration", label: "Inscription", icon: UserPlus, href: "/registration" },
  { id: "pre-registration", label: "Préinscription", icon: UserPlus, href: "/pre-registration" },
  { id: "payments", label: "Paiements", icon: CreditCard, href: "/payments" },
  { id: "settings", label: "Paramètres", icon: Settings, href: "/settings" },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <Building className="text-white" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">EcoleManager</h2>
            <p className="text-xs text-gray-600">Gestion scolaire</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {menuItems.map(item => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.id} href={item.href}>
              <div
                className={cn(
                  "group w-full flex justify-start items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100 hover:text-black"
                )}
              >
                <item.icon
                  className="w-5 h-5 shrink-0 text-gray-500 group-hover:text-black"
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </div>
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
    </div>
  );
};
