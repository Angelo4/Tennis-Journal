"use client";

import { useState, useRef } from "react";
import { useCreateSession, useUpdateSession } from "@/hooks/useSessions";
import { useStrings } from "@/hooks/useStrings";
import type { TennisSession, CreateTennisSessionRequest } from "@/api";
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
import { YouTubePlayer, type YouTubePlayerHandle } from "./YouTubePlayer";

interface VideoTimestamp {
  timeInSeconds: number;
  label: string;
  notes?: string;
  createdAt: string;
}

interface SessionFormProps {
  session?: TennisSession | null;
  onClose: () => void;
}

export function SessionForm({ session, onClose }: SessionFormProps) {
  const { data: strings } = useStrings();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const isEditing = !!session?.id;
  const playerRef = useRef<YouTubePlayerHandle>(null);

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
  const [currentTimestamp, setCurrentTimestamp] = useState({
    time: "",
    label: "",
    notes: "",
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

  // Convert HH:MM:SS to seconds
  const timeToSeconds = (time: string): number | null => {
    const parts = time.split(":");
    if (parts.length !== 3) return null;
    const [hours, minutes, seconds] = parts.map(Number);
    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) return null;
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Convert seconds to HH:MM:SS
  const secondsToTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleCaptureTime = async () => {
    if (!playerRef.current) return;
    const currentTime = await playerRef.current.getCurrentTime();
    setCurrentTimestamp((prev) => ({
      ...prev,
      time: secondsToTime(Math.floor(currentTime)),
    }));
  };

  const handleAddTimestamp = () => {
    if (!currentTimestamp.time || !currentTimestamp.label) return;

    const seconds = timeToSeconds(currentTimestamp.time);
    if (seconds === null) {
      alert("Invalid time format. Please use HH:MM:SS");
      return;
    }

    const newTimestamp: VideoTimestamp = {
      timeInSeconds: seconds,
      label: currentTimestamp.label,
      notes: currentTimestamp.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    setFormData((prev) => ({
      ...prev,
      videoTimestamps: [...(prev.videoTimestamps || []), newTimestamp],
    }));

    setCurrentTimestamp({ time: "", label: "", notes: "" });
  };

  const handleRemoveTimestamp = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      videoTimestamps: prev.videoTimestamps?.filter((_, i) => i !== index) || [],
    }));
  };

  // Build string options for select
  const stringOptions = [
    { value: "", label: "No string assigned" },
    ...(strings
      ?.filter((s) => s.isActive !== false)
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

              {formData.youTubeVideoUrl && (
                <>
                  <YouTubePlayer
                    ref={playerRef}
                    videoUrl={formData.youTubeVideoUrl}
                    className="mt-2"
                  />

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-700 mb-3">
                      Add Timestamps
                    </h4>

                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          label="Time (HH:MM:SS)"
                          value={currentTimestamp.time}
                          onChange={(e) =>
                            setCurrentTimestamp((prev) => ({
                              ...prev,
                              time: e.target.value,
                            }))
                          }
                          placeholder="00:05:30"
                          color="green"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          color="green"
                          onClick={handleCaptureTime}
                          className="mt-6"
                        >
                          Capture Current Time
                        </Button>
                      </div>

                      <Input
                        label="Label"
                        value={currentTimestamp.label}
                        onChange={(e) =>
                          setCurrentTimestamp((prev) => ({
                            ...prev,
                            label: e.target.value,
                          }))
                        }
                        placeholder="e.g., Great serve, Match point"
                        color="green"
                      />

                      <TextArea
                        label="Notes (Optional)"
                        value={currentTimestamp.notes}
                        onChange={(e) =>
                          setCurrentTimestamp((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Additional notes about this moment..."
                        rows={2}
                        color="green"
                      />

                      <Button
                        type="button"
                        variant="primary"
                        color="green"
                        onClick={handleAddTimestamp}
                        disabled={
                          !currentTimestamp.time || !currentTimestamp.label
                        }
                      >
                        Add Timestamp
                      </Button>
                    </div>

                    {/* Timestamps List */}
                    {formData.videoTimestamps &&
                      formData.videoTimestamps.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-700 mb-2">
                            Saved Timestamps ({formData.videoTimestamps.length})
                          </h5>
                          <div className="space-y-2">
                            {formData.videoTimestamps
                              .sort((a, b) => a.timeInSeconds! - b.timeInSeconds!)
                              .map((ts, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-sm text-green-600 font-medium">
                                        {secondsToTime(ts.timeInSeconds!)}
                                      </span>
                                      <span className="font-medium text-gray-800">
                                        {ts.label}
                                      </span>
                                    </div>
                                    {ts.notes && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {ts.notes}
                                      </p>
                                    )}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    color="red"
                                    size="sm"
                                    onClick={() => handleRemoveTimestamp(index)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                  </div>
                </>
              )}
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
