"use client";

import { useState } from "react";
import type { TennisString } from "@/api";
import { StringStatus } from "@/api";
import {
  useStrings,
  useDeleteString,
  useRemoveString,
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

type StringFilter = "inventory" | "strung" | "removed" | "all";

export function StringsList() {
  const { data: strings, isLoading, error } = useStrings();
  const deleteString = useDeleteString();
  const removeString = useRemoveString();

  const [showForm, setShowForm] = useState(false);
  const [editingString, setEditingString] = useState<TennisString | null>(null);
  const [filter, setFilter] = useState<StringFilter>("strung");

  const filteredStrings = strings?.filter((str) => {
    if (filter === "inventory") return str.status === StringStatus.INVENTORY;
    if (filter === "strung") return str.status === StringStatus.STRUNG;
    if (filter === "removed") return str.status === StringStatus.REMOVED;
    return true;
  });

  const inventoryCount = strings?.filter((s) => s.status === StringStatus.INVENTORY).length ?? 0;
  const strungCount = strings?.filter((s) => s.status === StringStatus.STRUNG).length ?? 0;
  const removedCount = strings?.filter((s) => s.status === StringStatus.REMOVED).length ?? 0;

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

  const handleEdit = (str: TennisString) => {
    setEditingString(str);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingString(null);
  };

  const filterTabs = [
    { id: "strung", label: "Strung", icon: "🎾", count: strungCount },
    { id: "inventory", label: "Inventory", icon: "📦", count: inventoryCount },
    { id: "removed", label: "Removed", icon: "🗑️", count: removedCount },
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
            icon={filter === "inventory" ? "📦" : filter === "strung" ? "🎾" : "🗑️"}
            title={
              filter === "inventory"
                ? "No strings in inventory."
                : filter === "strung"
                ? "No strings currently strung on your racquet."
                : filter === "removed"
                ? "No removed strings yet."
                : "No strings added yet."
            }
            description={
              filter === "inventory" || filter === "strung"
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
                onDelete={handleDelete}
                isRemoving={removeString.isPending}
                isDeleting={deleteString.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </LoadingContainer>
  );
}
