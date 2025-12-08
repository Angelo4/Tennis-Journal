"use client";

import { useState } from "react";
import { useCreateString, useUpdateString } from "@/hooks/useStrings";
import type { TennisString, CreateTennisStringRequest } from "@/api";
import { StringStatus } from "@/api";
import {
  Button,
  Input,
  Select,
  TextArea,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui";
import { STRING_TYPE_OPTIONS, STRING_STATUS_OPTIONS } from "@/utils/constants";
import { formatDateOnlyForInput } from "@/utils/formatters";

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
    dateStrung: string?.status === StringStatus.STRUNG ? formatDateOnlyForInput(string?.dateStrung) : undefined,
    status: string?.status ?? StringStatus.INVENTORY,
    notes: string?.notes ?? "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: CreateTennisStringRequest = {
      ...formData,
      brand: formData.brand || "",
      model: formData.model || "",
      dateStrung: formData.dateStrung && formData.status === StringStatus.STRUNG
        ? new Date(formData.dateStrung).toISOString()
        : undefined,
    };

    if (isEditing && string?.id) {
      await updateString.mutateAsync({ id: string.id, data });
    } else {
      await createString.mutateAsync(data);
    }

    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ? (value ? parseInt(value) : undefined) : value,
    }));
  };

  const isPending = createString.isPending || updateString.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader onClose={onClose}>
        {isEditing ? "Edit String" : "New String Setup"}
      </ModalHeader>

      <ModalBody className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Brand"
            name="brand"
            value={formData.brand ?? ""}
            onChange={handleChange}
            placeholder="e.g., Luxilon, Wilson, Babolat"
            color="yellow"
            required
          />

          <Input
            label="Model"
            name="model"
            value={formData.model ?? ""}
            onChange={handleChange}
            placeholder="e.g., ALU Power, NXT, RPM Blast"
            color="yellow"
            required
          />

          <Input
            label="Gauge"
            name="gauge"
            value={formData.gauge ?? ""}
            onChange={handleChange}
            placeholder="e.g., 16, 16L, 17"
            color="yellow"
          />

          <Select
            label="String Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={STRING_TYPE_OPTIONS}
            color="yellow"
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={STRING_STATUS_OPTIONS}
            color="yellow"
            required
          />

          {formData.status === StringStatus.STRUNG && (
            <>
              <Input
                label="Main Tension (lbs)"
                name="mainTension"
                type="number"
                value={formData.mainTension ?? ""}
                onChange={handleChange}
                min={30}
                max={70}
                placeholder="e.g., 52"
                color="yellow"
              />

              <Input
                label="Cross Tension (lbs)"
                name="crossTension"
                type="number"
                value={formData.crossTension ?? ""}
                onChange={handleChange}
                min={30}
                max={70}
                placeholder="e.g., 50"
                color="yellow"
              />

              <Input
                label="Date Strung"
                name="dateStrung"
                type="date"
                value={formData.dateStrung ?? ""}
                onChange={handleChange}
                color="yellow"
                required
              />
            </>
          )}
        </div>

        <TextArea
          label="Notes"
          name="notes"
          value={formData.notes ?? ""}
          onChange={handleChange}
          placeholder="Any notes about this string setup..."
          rows={3}
          color="yellow"
        />
      </ModalBody>

      <ModalFooter>
        <Button
          type="button"
          variant="secondary"
          color="gray"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          color="yellow"
          isLoading={isPending}
        >
          {isEditing ? "Update String" : "Add String"}
        </Button>
      </ModalFooter>
    </form>
  );
}
