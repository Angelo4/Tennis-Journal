"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  color?: "green" | "yellow" | "purple" | "blue" | "red" | "gray";
  isLoading?: boolean;
}

const colorStyles = {
  green: {
    primary: "bg-green-600 hover:bg-green-700 text-white",
    secondary: "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
    ghost: "text-green-600 hover:text-green-800 hover:bg-green-50",
    link: "text-green-600 hover:text-green-800",
  },
  yellow: {
    primary: "bg-yellow-600 hover:bg-yellow-700 text-white",
    secondary: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300",
    ghost: "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50",
    link: "text-yellow-600 hover:text-yellow-800",
  },
  purple: {
    primary: "bg-purple-600 hover:bg-purple-700 text-white",
    secondary: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-300",
    ghost: "text-purple-600 hover:text-purple-800 hover:bg-purple-50",
    link: "text-purple-600 hover:text-purple-800",
  },
  blue: {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300",
    ghost: "text-blue-600 hover:text-blue-800 hover:bg-blue-50",
    link: "text-blue-600 hover:text-blue-800",
  },
  red: {
    primary: "bg-red-600 hover:bg-red-700 text-white",
    secondary: "bg-red-100 text-red-800 hover:bg-red-200 border-red-300",
    ghost: "text-red-600 hover:text-red-800 hover:bg-red-50",
    link: "text-red-600 hover:text-red-800",
  },
  gray: {
    primary: "bg-gray-600 hover:bg-gray-700 text-white",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300",
    ghost: "text-gray-600 hover:text-gray-800 hover:bg-gray-50",
    link: "text-gray-600 hover:text-gray-800",
  },
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      color = "gray",
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const getVariantStyle = () => {
      if (variant === "danger") {
        return colorStyles.red.primary;
      }
      return colorStyles[color][variant];
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variant !== "link" && sizeStyles[size],
          getVariantStyle(),
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
