"use client";

import { cn } from "@/lib/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "green" | "yellow" | "purple" | "blue" | "gray";
  className?: string;
}

const sizeStyles = {
  sm: "h-6 w-6",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

const colorStyles = {
  green: "border-green-600",
  yellow: "border-yellow-600",
  purple: "border-purple-600",
  blue: "border-blue-600",
  gray: "border-gray-600",
};

export function LoadingSpinner({
  size = "md",
  color = "gray",
  className,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex justify-center items-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-b-2",
          sizeStyles[size],
          colorStyles[color]
        )}
      />
    </div>
  );
}

interface LoadingContainerProps {
  isLoading: boolean;
  children: React.ReactNode;
  spinnerColor?: "green" | "yellow" | "purple" | "blue" | "gray";
  minHeight?: string;
}

export function LoadingContainer({
  isLoading,
  children,
  spinnerColor = "gray",
  minHeight = "h-64",
}: LoadingContainerProps) {
  if (isLoading) {
    return (
      <div className={cn("flex justify-center items-center", minHeight)}>
        <LoadingSpinner color={spinnerColor} />
      </div>
    );
  }

  return <>{children}</>;
}
