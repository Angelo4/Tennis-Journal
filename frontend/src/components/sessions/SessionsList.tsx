"use client";

import { useState } from "react";
import type { TennisSession } from "@/api";
import { useSessions, useDeleteSession } from "@/hooks/useSessions";
import { useStrings } from "@/hooks/useStrings";
import {
  Button,
  Modal,
  EmptyState,
  LoadingContainer,
  ErrorAlert,
} from "@/components/ui";
import { SessionCard } from "./SessionCard";
import { SessionForm } from "./SessionForm";

export function SessionsList() {
  const { data: sessions, isLoading, error } = useSessions();
  const { data: strings } = useStrings();
  const deleteSession = useDeleteSession();

  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<TennisSession | null>(
    null
  );

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

  if (error) {
    return (
      <ErrorAlert message="Error loading sessions. Please make sure the API is running." />
    );
  }

  return (
    <LoadingContainer isLoading={isLoading} spinnerColor="green">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tennis Sessions</h2>
          <Button color="green" onClick={() => setShowForm(true)}>
            + New Session
          </Button>
        </div>

        {/* Form Modal */}
        <Modal isOpen={showForm} onClose={handleFormClose} size="lg">
          <SessionForm session={editingSession} onClose={handleFormClose} />
        </Modal>

        {/* Content */}
        {sessions && sessions.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No sessions recorded yet."
            description='Click "New Session" to log your first tennis session!'
          />
        ) : (
          <div className="grid gap-4">
            {sessions?.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                strings={strings}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={deleteSession.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </LoadingContainer>
  );
}
