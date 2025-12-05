"use client";

import { useState } from "react";
import type { TennisString } from "@/api";
import {
  useStrings,
  useDeleteString,
  useRemoveString,
  useRestoreString,
} from "@/hooks/useStrings";
import {
  Button,
  Modal,
  Tabs,
  EmptyState,
  LoadingContainer,
  ErrorAlert,
} from "@/components/ui";
import { StringCard } from "./StringCard";
import { StringForm } from "./StringForm";

type StringFilter = "active" | "removed" | "all";

export function StringsList() {
  const { data: strings, isLoading, error } = useStrings();
  const deleteString = useDeleteString();
  const removeString = useRemoveString();
  const restoreString = useRestoreString();

  const [showForm, setShowForm] = useState(false);
  const [editingString, setEditingString] = useState<TennisString | null>(null);
  const [filter, setFilter] = useState<StringFilter>("active");

  const filteredStrings = strings?.filter((str) => {
    if (filter === "active") return str.isActive !== false;
    if (filter === "removed") return str.isActive === false;
    return true;
  });

  const activeCount = strings?.filter((s) => s.isActive !== false).length ?? 0;
  const removedCount = strings?.filter((s) => s.isActive === false).length ?? 0;

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this string setup?")) {
      deleteString.mutate(id);
    }
  };

  const handleRemove = async (str: TennisString) => {
    if (confirm("Mark this string as removed from your racquet?")) {
      removeString.mutate(str.id!);
    }
  };

  const handleRestore = async (str: TennisString) => {
    restoreString.mutate(str.id!);
  };

  const handleEdit = (str: TennisString) => {
    setEditingString(str);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingString(null);
  };

  const filterTabs = [
    { id: "active", label: "Active", icon: "🎾", count: activeCount },
    { id: "removed", label: "Removed", icon: "📦", count: removedCount },
    { id: "all", label: "All", count: strings?.length ?? 0 },
  ];

  if (error) {
    return (
      <ErrorAlert message="Error loading strings. Please make sure the API is running." />
    );
  }

  return (
    <LoadingContainer isLoading={isLoading} spinnerColor="yellow">
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Strings</h2>
          <Button color="yellow" onClick={() => setShowForm(true)}>
            + New String
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <Tabs
            tabs={filterTabs}
            activeTab={filter}
            onTabChange={(id) => setFilter(id as StringFilter)}
            variant="pills"
            color="yellow"
          />
        </div>

        {/* Form Modal */}
        <Modal isOpen={showForm} onClose={handleFormClose}>
          <StringForm string={editingString} onClose={handleFormClose} />
        </Modal>

        {/* Content */}
        {filteredStrings && filteredStrings.length === 0 ? (
          <EmptyState
            icon={filter === "removed" ? "📦" : "🎾"}
            title={
              filter === "active"
                ? "No active strings on your racquet."
                : filter === "removed"
                ? "No removed strings yet."
                : "No strings added yet."
            }
            description={
              filter === "active"
                ? 'Click "New String" to add your string setup!'
                : undefined
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredStrings?.map((str) => (
              <StringCard
                key={str.id}
                string={str}
                onEdit={handleEdit}
                onRemove={handleRemove}
                onRestore={handleRestore}
                onDelete={handleDelete}
                isRemoving={removeString.isPending}
                isRestoring={restoreString.isPending}
                isDeleting={deleteString.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </LoadingContainer>
  );
}
