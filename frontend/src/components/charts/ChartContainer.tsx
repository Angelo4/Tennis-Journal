"use client";

import { cn } from "@/lib/cn";

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function ChartContainer({
  title,
  children,
  className,
  emptyMessage = "No data available",
  isEmpty = false,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm p-6 border border-gray-100",
        className
      )}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {isEmpty ? (
        <p className="text-gray-500 text-center py-12">{emptyMessage}</p>
      ) : (
        children
      )}
    </div>
  );
}
