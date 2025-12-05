"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  dimmed?: boolean;
}

export function Card({
  children,
  className,
  onClick,
  hoverable = false,
  dimmed = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white border rounded-lg transition-shadow",
        hoverable && "hover:shadow-md cursor-pointer",
        dimmed ? "border-gray-300 opacity-75" : "border-gray-200",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function CardHeader({ children, className, actions }: CardHeaderProps) {
  return (
    <div className={cn("flex justify-between items-start p-5", className)}>
      <div className="flex-1">{children}</div>
      {actions && <div className="flex gap-1 ml-2">{actions}</div>}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn("px-5 pb-5", className)}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("px-5 pb-5 pt-2 border-t border-gray-100", className)}>
      {children}
    </div>
  );
}
