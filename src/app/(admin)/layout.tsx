// app/(admin)/layout.tsx
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-64 bg-gray-50 pt-16 md:pt-6">{children}</main>
    </div>
  );
}
