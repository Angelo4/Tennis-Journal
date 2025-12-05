"use client";

import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  color?: "green" | "yellow" | "purple" | "blue" | "orange" | "gray";
  className?: string;
}

const colorStyles = {
  green: "text-green-600",
  yellow: "text-yellow-600",
  purple: "text-purple-600",
  blue: "text-blue-600",
  orange: "text-orange-600",
  gray: "text-gray-600",
};

export function StatCard({ label, value, color = "gray", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm p-4 border border-gray-100",
        className
      )}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className={cn("text-2xl font-bold", colorStyles[color])}>{value}</p>
    </div>
  );
}
