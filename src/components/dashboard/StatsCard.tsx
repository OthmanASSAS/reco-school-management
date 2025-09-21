"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  href: string;
  bgColor?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  href,
  bgColor = "bg-gray-100",
}: StatsCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-all cursor-pointer group hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`p-3 rounded-full ${bgColor} group-hover:scale-110 transition-transform`}
              >
                {icon}
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
