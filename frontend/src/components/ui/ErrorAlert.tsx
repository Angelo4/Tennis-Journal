"use client";

interface ErrorAlertProps {
  message?: string;
  title?: string;
}

export function ErrorAlert({
  message = "Something went wrong. Please try again.",
  title = "Error",
}: ErrorAlertProps) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      <p className="font-medium">{title}</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
}
