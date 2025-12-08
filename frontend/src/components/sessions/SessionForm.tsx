"use client";

import { useState } from "react";
import { useCreateSession, useUpdateSession } from "@/hooks/useSessions";
import { useStrings } from "@/hooks/useStrings";
import type { TennisSession, CreateTennisSessionRequest } from "@/api";
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
import { SESSION_TYPE_OPTIONS, SURFACE_OPTIONS } from "@/utils/constants";
import { formatDateForInput } from "@/utils/formatters";

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
    sessionDate: formatDateForInput(session?.sessionDate),
    type: session?.type ?? 0,
    durationMinutes: session?.durationMinutes ?? 60,
    location: session?.location ?? "",
    surface: session?.surface ?? 0,
    stringId: session?.stringId ?? "",
    stringFeelingRating: session?.stringFeelingRating ?? undefined,
    stringNotes: session?.stringNotes ?? "",
    notes: session?.notes ?? "",
    youTubeVideoUrl: session?.youTubeVideoUrl ?? "",
    videoTimestamps: session?.videoTimestamps ?? [],
  });

  const [showVideoSection, setShowVideoSection] = useState(
    !!session?.youTubeVideoUrl
  );

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

  // Build string options for select
  const stringOptions = [
    { value: "", label: "No string assigned" },
    ...(strings
      ?.filter((s) => s.status === StringStatus.STRUNG)
      .map((s) => ({
        value: s.id!,
        label: `${s.brand} ${s.model}`,
      })) ?? []),
  ];

  const isPending = createSession.isPending || updateSession.isPending;

  return (
    <form onSubmit={handleSubmit}>
      <ModalHeader onClose={onClose}>
        {isEditing ? "Edit Session" : "New Session"}
      </ModalHeader>

      <ModalBody className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Date & Time"
            name="sessionDate"
            type="datetime-local"
            value={formData.sessionDate}
            onChange={handleChange}
            color="green"
            required
          />

          <Select
            label="Session Type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            options={SESSION_TYPE_OPTIONS}
            color="green"
          />

          <Input
            label="Duration (minutes)"
            name="durationMinutes"
            type="number"
            value={formData.durationMinutes}
            onChange={handleChange}
            min={1}
            color="green"
            required
          />

          <Select
            label="Court Surface"
            name="surface"
            value={formData.surface ?? 0}
            onChange={handleChange}
            options={SURFACE_OPTIONS}
            color="green"
          />

          <div className="md:col-span-2">
            <Input
              label="Location"
              name="location"
              value={formData.location ?? ""}
              onChange={handleChange}
              placeholder="e.g., Local Tennis Club"
              color="green"
            />
          </div>

          <Select
            label="String Used"
            name="stringId"
            value={formData.stringId ?? ""}
            onChange={handleChange}
            options={stringOptions}
            color="green"
          />

          <Input
            label="String Feeling (1-10)"
            name="stringFeelingRating"
            type="number"
            value={formData.stringFeelingRating ?? ""}
            onChange={handleChange}
            min={1}
            max={10}
            placeholder="Rate how the strings felt"
            color="green"
          />

          <div className="md:col-span-2">
            <TextArea
              label="String Notes"
              name="stringNotes"
              value={formData.stringNotes ?? ""}
              onChange={handleChange}
              placeholder="Notes about string performance..."
              rows={2}
              color="green"
            />
          </div>
        </div>

        <TextArea
          label="Session Notes"
          name="notes"
          value={formData.notes ?? ""}
          onChange={handleChange}
          placeholder="Any notes about this session..."
          rows={3}
          color="green"
        />

        {/* Video Recording Section */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowVideoSection(!showVideoSection)}
            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
          >
            <span>{showVideoSection ? "▼" : "▶"}</span>
            Video Recording (Optional)
          </button>

          {showVideoSection && (
            <div className="mt-4 space-y-4">
              <Input
                label="YouTube URL"
                name="youTubeVideoUrl"
                value={formData.youTubeVideoUrl ?? ""}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                color="green"
              />
              <p className="text-sm text-gray-500 italic">
                You can add timestamps after creating the session by using the "Capture Timestamp" button below the video player.
              </p>
            </div>
          )}
        </div>
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
        <Button type="submit" color="green" isLoading={isPending}>
          {isEditing ? "Update Session" : "Add Session"}
        </Button>
      </ModalFooter>
    </form>
  );
}
