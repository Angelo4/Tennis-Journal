"use client";

import { useState } from "react";
import { useCreateString, useUpdateString } from "@/hooks/useApi";
import type { TennisString, CreateTennisStringRequest } from "@/api";

interface StringFormProps {
  string?: TennisString | null;
  onClose: () => void;
}

export function StringForm({ string, onClose }: StringFormProps) {
  const createString = useCreateString();
  const updateString = useUpdateString();
  const isEditing = !!string?.id;

  const [formData, setFormData] = useState<CreateTennisStringRequest>({
    brand: string?.brand ?? "",
    model: string?.model ?? "",
    gauge: string?.gauge ?? "",
    type: string?.type ?? 0,
    mainTension: string?.mainTension ?? undefined,
    crossTension: string?.crossTension ?? undefined,
    dateStrung: string?.dateStrung
      ? new Date(string.dateStrung).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    notes: string?.notes ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateTennisStringRequest = {
      ...formData,
      brand: formData.brand || "",
      model: formData.model || "",
      dateStrung: formData.dateStrung ? new Date(formData.dateStrung).toISOString() : new Date().toISOString(),
    };

    if (isEditing && string?.id) {
      await updateString.mutateAsync({ id: string.id, data });
    } else {
      await createString.mutateAsync(data);
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
          {isEditing ? "Edit String" : "New String Setup"}
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
            Brand *
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand ?? ""}
            onChange={handleChange}
            placeholder="e.g., Luxilon, Wilson, Babolat"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Model *
          </label>
          <input
            type="text"
            name="model"
            value={formData.model ?? ""}
            onChange={handleChange}
            placeholder="e.g., ALU Power, NXT, RPM Blast"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gauge
          </label>
          <input
            type="text"
            name="gauge"
            value={formData.gauge ?? ""}
            onChange={handleChange}
            placeholder="e.g., 16, 16L, 17"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            String Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value={0}>Polyester</option>
            <option value={1}>Multifilament</option>
            <option value={2}>Synthetic Gut</option>
            <option value={3}>Natural Gut</option>
            <option value={4}>Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Main Tension (lbs)
          </label>
          <input
            type="number"
            name="mainTension"
            value={formData.mainTension ?? ""}
            onChange={handleChange}
            min={30}
            max={70}
            placeholder="e.g., 52"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cross Tension (lbs)
          </label>
          <input
            type="number"
            name="crossTension"
            value={formData.crossTension ?? ""}
            onChange={handleChange}
            min={30}
            max={70}
            placeholder="e.g., 50"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Strung
          </label>
          <input
            type="date"
            name="dateStrung"
            value={formData.dateStrung}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes ?? ""}
          onChange={handleChange}
          rows={3}
          placeholder="Initial impressions, why you chose this string, etc."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={createString.isPending || updateString.isPending}
          className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          {createString.isPending || updateString.isPending
            ? "Saving..."
            : isEditing
            ? "Update String"
            : "Add String"}
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
