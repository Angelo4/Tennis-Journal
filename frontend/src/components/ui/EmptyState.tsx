"use client";

import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = "📭",
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "text-center py-12 px-4 bg-gray-50 rounded-lg",
        className
      )}
    >
      <span className="text-4xl mb-4 block">{icon}</span>
      <p className="text-gray-600 text-lg font-medium">{title}</p>
      {description && (
        <p className="text-gray-400 mt-2 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
