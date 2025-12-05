"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useSessions, useDeleteSession, useStrings } from "@/hooks/useApi";
import type { TennisSession } from "@/api";
import { SessionForm } from "./SessionForm";

const sessionTypeLabels: Record<number, string> = {
  0: "Practice",
  1: "Match",
  2: "Lesson",
  3: "Tournament",
  4: "Hitting Session",
};

const surfaceLabels: Record<number, string> = {
  0: "Hard Court",
  1: "Clay",
  2: "Grass",
  3: "Carpet",
  4: "Indoor",
};

export function SessionsList() {
  const { data: sessions, isLoading, error } = useSessions();
  const { data: strings } = useStrings();
  const deleteSession = useDeleteSession();
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<TennisSession | null>(null);

  const getStringName = (stringId: string | null | undefined) => {
    if (!stringId || !strings) return "No string assigned";
    const str = strings.find((s) => s.id === stringId);
    return str ? `${str.brand} ${str.model}` : "Unknown string";
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this session?")) {
      deleteSession.mutate(id);
    }
  };

  const handleEdit = (session: TennisSession) => {
    setEditingSession(session);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSession(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading sessions. Please make sure the API is running.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Tennis Sessions</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + New Session
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <SessionForm
              session={editingSession}
              onClose={handleFormClose}
            />
          </div>
        </div>
      )}

      {sessions && sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No sessions recorded yet.</p>
          <p className="text-gray-400 mt-2">
            Click &quot;New Session&quot; to log your first tennis session!
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions?.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {sessionTypeLabels[session.type ?? 0]}
                    </span>
                    {session.surface !== undefined && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {surfaceLabels[session.surface]}
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {session.sessionDate
                      ? format(new Date(session.sessionDate), "EEEE, MMMM d, yyyy")
                      : "Unknown date"}
                  </p>
                  <div className="mt-2 space-y-1 text-gray-600">
                    <p>
                      <span className="font-medium">Duration:</span>{" "}
                      {session.durationMinutes} minutes
                    </p>
                    {session.location && (
                      <p>
                        <span className="font-medium">Location:</span>{" "}
                        {session.location}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">String:</span>{" "}
                      {getStringName(session.stringId)}
                    </p>
                    {session.stringFeelingRating && (
                      <p>
                        <span className="font-medium">String Feel:</span>{" "}
                        {session.stringFeelingRating}/10
                      </p>
                    )}
                  </div>
                  {session.notes && (
                    <p className="mt-3 text-gray-500 text-sm italic">
                      {session.notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(session)}
                    className="text-blue-600 hover:text-blue-800 px-3 py-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(session.id!)}
                    className="text-red-600 hover:text-red-800 px-3 py-1"
                    disabled={deleteSession.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
