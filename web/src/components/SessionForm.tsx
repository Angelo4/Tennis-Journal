"use client";

import { useState } from "react";
import {
  useCreateSession,
  useUpdateSession,
  useStrings,
} from "@/hooks/useApi";
import type { TennisSession, CreateTennisSessionRequest } from "@/api";

interface SessionFormProps {
  session?: TennisSession | null;
  onClose: () => void;
}

export function SessionForm({ session, onClose }: SessionFormProps) {
  const { data: strings } = useStrings();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const isEditing = !!session?.id;

  const [formData, setFormData] = useState<CreateTennisSessionRequest>({
    sessionDate: session?.sessionDate
      ? new Date(session.sessionDate).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    type: session?.type ?? 0,
    durationMinutes: session?.durationMinutes ?? 60,
    location: session?.location ?? "",
    surface: session?.surface ?? 0,
    stringId: session?.stringId ?? "",
    stringFeelingRating: session?.stringFeelingRating ?? undefined,
    stringNotes: session?.stringNotes ?? "",
    notes: session?.notes ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: CreateTennisSessionRequest = {
      ...formData,
      sessionDate: new Date(formData.sessionDate!).toISOString(),
      stringId: formData.stringId || undefined,
    };

    if (isEditing && session?.id) {
      await updateSession.mutateAsync({ id: session.id, data });
    } else {
      await createSession.mutateAsync(data);
    }
    
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          {isEditing ? "Edit Session" : "New Session"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date & Time
          </label>
          <input
            type="datetime-local"
            name="sessionDate"
            value={formData.sessionDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Session Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value={0}>Practice</option>
            <option value={1}>Match</option>
            <option value={2}>Lesson</option>
            <option value={3}>Tournament</option>
            <option value={4}>Hitting Session</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            name="durationMinutes"
            value={formData.durationMinutes}
            onChange={handleChange}
            min={1}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Court Surface
          </label>
          <select
            name="surface"
            value={formData.surface ?? 0}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value={0}>Hard Court</option>
            <option value={1}>Clay</option>
            <option value={2}>Grass</option>
            <option value={3}>Carpet</option>
            <option value={4}>Indoor</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location ?? ""}
            onChange={handleChange}
            placeholder="Tennis club, park, etc."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <hr className="my-4" />

      <h4 className="font-semibold text-gray-800">String Information</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            String Used
          </label>
          <select
            name="stringId"
            value={formData.stringId ?? ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">No string selected</option>
            {strings?.map((str) => (
              <option key={str.id} value={str.id ?? ""}>
                {str.brand} {str.model} ({str.gauge})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            String Feel Rating (1-10)
          </label>
          <input
            type="number"
            name="stringFeelingRating"
            value={formData.stringFeelingRating ?? ""}
            onChange={handleChange}
            min={1}
            max={10}
            placeholder="How did the strings feel?"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            String Notes
          </label>
          <textarea
            name="stringNotes"
            value={formData.stringNotes ?? ""}
            onChange={handleChange}
            rows={2}
            placeholder="How did the strings perform? Tension, spin, control..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Session Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes ?? ""}
          onChange={handleChange}
          rows={3}
          placeholder="General notes about the session..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={createSession.isPending || updateSession.isPending}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          {createSession.isPending || updateSession.isPending
            ? "Saving..."
            : isEditing
            ? "Update Session"
            : "Create Session"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
