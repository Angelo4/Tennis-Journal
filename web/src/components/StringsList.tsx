"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useStrings, useDeleteString, useStringUsage } from "@/hooks/useApi";
import type { TennisString } from "@/api";
import { StringForm } from "./StringForm";

const stringTypeLabels: Record<number, string> = {
  0: "Polyester",
  1: "Multifilament",
  2: "Synthetic Gut",
  3: "Natural Gut",
  4: "Hybrid",
};

function StringUsageInfo({ stringId }: { stringId: string }) {
  const { data: usage, isLoading } = useStringUsage(stringId);

  if (isLoading) {
    return <span className="text-gray-400">Loading stats...</span>;
  }

  if (!usage) return null;

  return (
    <div className="mt-2 pt-2 border-t border-gray-100 text-sm text-gray-500">
      <span className="mr-4">
        <strong>{usage.totalSessions ?? 0}</strong> sessions
      </span>
      <span className="mr-4">
        <strong>{Math.round((usage.totalMinutesPlayed ?? 0) / 60)}h</strong> played
      </span>
      {(usage.averageFeelingRating ?? 0) > 0 && (
        <span>
          Avg feel: <strong>{(usage.averageFeelingRating ?? 0).toFixed(1)}</strong>/10
        </span>
      )}
    </div>
  );
}

export function StringsList() {
  const { data: strings, isLoading, error } = useStrings();
  const deleteString = useDeleteString();
  const [showForm, setShowForm] = useState(false);
  const [editingString, setEditingString] = useState<TennisString | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this string setup?")) {
      deleteString.mutate(id);
    }
  };

  const handleEdit = (str: TennisString) => {
    setEditingString(str);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingString(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading strings. Please make sure the API is running.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Strings</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New String
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <StringForm
              string={editingString}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}

      {strings && strings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No strings added yet.</p>
          <p className="text-gray-400 mt-2">
            Click &quot;New String&quot; to add your string setup!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {strings?.map((str) => (
            <div
              key={str.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {str.brand} {str.model}
                  </h3>
                  <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full mt-1">
                    {stringTypeLabels[str.type ?? 0]}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(str)}
                    className="text-blue-600 hover:text-blue-800 p-1 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(str.id!)}
                    className="text-red-600 hover:text-red-800 p-1 text-sm"
                    disabled={deleteString.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                {str.gauge && (
                  <p>
                    <span className="font-medium">Gauge:</span> {str.gauge}
                  </p>
                )}
                <p>
                  <span className="font-medium">Tension:</span>{" "}
                  {str.mainTension && str.crossTension
                    ? `${str.mainTension}/${str.crossTension} lbs`
                    : str.mainTension
                    ? `${str.mainTension} lbs`
                    : "Not set"}
                </p>
                <p>
                  <span className="font-medium">Strung:</span>{" "}
                  {str.dateStrung
                    ? format(new Date(str.dateStrung), "MMM d, yyyy")
                    : "Unknown"}
                </p>
              </div>

              {str.notes && (
                <p className="mt-2 text-gray-500 text-sm italic">{str.notes}</p>
              )}

              {str.id && <StringUsageInfo stringId={str.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
