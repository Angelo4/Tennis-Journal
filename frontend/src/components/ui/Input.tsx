"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  color?: "green" | "yellow" | "purple" | "blue";
}

const focusColors = {
  green: "focus:ring-green-500",
  yellow: "focus:ring-yellow-500",
  purple: "focus:ring-purple-500",
  blue: "focus:ring-blue-500",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, color = "blue", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900",
            "placeholder-gray-400 focus:ring-2 focus:border-transparent",
            focusColors[color],
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500">{hint}</p>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
