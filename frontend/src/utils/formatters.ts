import { format, formatDistanceToNow, parseISO } from "date-fns";

/**
 * Format a date for display (e.g., "Dec 5, 2025")
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "Unknown date";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

/**
 * Format a date with day name (e.g., "Friday, December 5, 2025")
 */
export function formatDateLong(date: string | Date | null | undefined): string {
  if (!date) return "Unknown date";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEEE, MMMM d, yyyy");
}

/**
 * Format a date for datetime-local input (e.g., "2025-12-05T10:30")
 */
export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) return new Date().toISOString().slice(0, 16);
  const d = typeof date === "string" ? parseISO(date) : date;
  return d.toISOString().slice(0, 16);
}

/**
 * Format a date for date input (e.g., "2025-12-05")
 */
export function formatDateOnlyForInput(date: string | Date | null | undefined): string {
  if (!date) return new Date().toISOString().slice(0, 10);
  const d = typeof date === "string" ? parseISO(date) : date;
  return d.toISOString().slice(0, 10);
}

/**
 * Format a relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format minutes as hours (e.g., 90 -> "1.5h")
 */
export function formatMinutesAsHours(minutes: number): string {
  const hours = Math.round((minutes / 60) * 10) / 10;
  return `${hours}h`;
}

/**
 * Format duration in minutes (e.g., 90 -> "1h 30m")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format tension display (e.g., "52/50 lbs" or "52 lbs")
 */
export function formatTension(
  mainTension: number | null | undefined,
  crossTension: number | null | undefined
): string {
  if (!mainTension) return "Not set";
  if (crossTension && crossTension !== mainTension) {
    return `${mainTension}/${crossTension} lbs`;
  }
  return `${mainTension} lbs`;
}

/**
 * Format rating (e.g., "8/10")
 */
export function formatRating(rating: number | null | undefined): string {
  if (!rating || rating === 0) return "-";
  return `${rating}/10`;
}
