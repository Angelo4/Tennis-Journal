"use client";

import { useRef, useState } from "react";
import type { TennisSession, TennisString } from "@/api";
import { Card, CardHeader, CardBody, Badge, Button, Input, TextArea } from "@/components/ui";
import { SESSION_TYPE_LABELS, SURFACE_LABELS } from "@/utils/constants";
import { formatDateLong, formatRating } from "@/utils/formatters";
import { YouTubePlayer, type YouTubePlayerHandle } from "./YouTubePlayer";
import { useUpdateSession } from "@/hooks/useSessions";

interface SessionCardProps {
  session: TennisSession;
  strings?: TennisString[];
  onEdit: (session: TennisSession) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function SessionCard({
  session,
  strings,
  onEdit,
  onDelete,
  isDeleting,
}: SessionCardProps) {
  const playerRef = useRef<YouTubePlayerHandle>(null);
  const updateSession = useUpdateSession();
  const [showCaptureForm, setShowCaptureForm] = useState(false);
  const [captureData, setCaptureData] = useState({
    time: "",
    label: "",
    notes: "",
  });

  const getStringName = (stringId: string | null | undefined) => {
    if (!stringId || !strings) return "No string assigned";
    const str = strings.find((s) => s.id === stringId);
    return str ? `${str.brand} ${str.model}` : "Unknown string";
  };

  const handleTimestampClick = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds);
    }
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleCaptureTime = async () => {
    if (!playerRef.current) return;
    const currentTime = await playerRef.current.getCurrentTime();
    setCaptureData((prev) => ({
      ...prev,
      time: formatTime(Math.floor(currentTime)),
    }));
    setShowCaptureForm(true);
  };

  const handleSaveTimestamp = async () => {
    if (!captureData.label || !captureData.time) return;

    const timeToSeconds = (time: string): number => {
      const [h, m, s] = time.split(":").map(Number);
      return h * 3600 + m * 60 + s;
    };

    const newTimestamp = {
      timeInSeconds: timeToSeconds(captureData.time),
      label: captureData.label,
      notes: captureData.notes || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedTimestamps = [
      ...(session.videoTimestamps || []),
      newTimestamp,
    ];

    await updateSession.mutateAsync({
      id: session.id!,
      data: {
        videoTimestamps: updatedTimestamps,
      },
    });

    setCaptureData({ time: "", label: "", notes: "" });
    setShowCaptureForm(false);
  };

  return (
    <Card hoverable>
      <CardHeader
        actions={
          <div className="flex gap-2">
            <Button
              variant="link"
              color="blue"
              onClick={() => onEdit(session)}
            >
              Edit
            </Button>
            <Button
              variant="link"
              color="red"
              onClick={() => onDelete(session.id!)}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="success">
            {SESSION_TYPE_LABELS[session.type ?? 0]}
          </Badge>
          {session.surface !== undefined && (
            <Badge variant="info">{SURFACE_LABELS[session.surface]}</Badge>
          )}
        </div>
        <p className="text-lg font-semibold text-gray-800">
          {formatDateLong(session.sessionDate)}
        </p>
      </CardHeader>

      <CardBody>
        <div className="space-y-1 text-gray-600">
          <p>
            <span className="font-medium">Duration:</span>{" "}
            {session.durationMinutes} minutes
          </p>
          {session.location && (
            <p>
              <span className="font-medium">Location:</span> {session.location}
            </p>
          )}
          <p>
            <span className="font-medium">String:</span>{" "}
            {getStringName(session.stringId)}
          </p>
          {session.stringFeelingRating && (
            <p>
              <span className="font-medium">String Feel:</span>{" "}
              {formatRating(session.stringFeelingRating)}
            </p>
          )}
        </div>
        
        {/* Notes Section */}
        {(session.stringNotes || session.notes) && (
          <div className="mt-3 space-y-2">
            {session.stringNotes && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">String Notes</p>
                <p className="text-gray-500 text-sm italic">{session.stringNotes}</p>
              </div>
            )}
            {session.notes && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Session Notes</p>
                <p className="text-gray-500 text-sm italic">{session.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Video Section */}
        {session.youTubeVideoUrl && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Video Recording
            </p>
            <YouTubePlayer
              ref={playerRef}
              videoUrl={session.youTubeVideoUrl}
              className="w-full"
            />
            <Button
              variant="secondary"
              color="green"
              size="sm"
              onClick={handleCaptureTime}
              className="w-full"
            >
              Capture Timestamp
            </Button>

            {/* Capture Form */}
            {showCaptureForm && (
              <div className="p-4 bg-green-50 rounded-lg space-y-3 border border-green-200">
                <h4 className="font-medium text-gray-800">Save Timestamp</h4>
                <Input
                  label="Time (HH:MM:SS)"
                  value={captureData.time}
                  onChange={(e) =>
                    setCaptureData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  color="green"
                  readOnly
                />
                <Input
                  label="Label"
                  value={captureData.label}
                  onChange={(e) =>
                    setCaptureData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  placeholder="e.g., Great serve, Match point"
                  color="green"
                />
                <TextArea
                  label="Notes (Optional)"
                  value={captureData.notes}
                  onChange={(e) =>
                    setCaptureData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Additional notes..."
                  rows={2}
                  color="green"
                />
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    color="green"
                    onClick={handleSaveTimestamp}
                    disabled={!captureData.label || updateSession.isPending}
                    isLoading={updateSession.isPending}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    color="gray"
                    onClick={() => {
                      setShowCaptureForm(false);
                      setCaptureData({ time: "", label: "", notes: "" });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Timestamps */}
            {session.videoTimestamps && session.videoTimestamps.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Timestamps ({session.videoTimestamps.length})
                </p>
                <div className="space-y-2">
                  {session.videoTimestamps
                    .sort((a, b) => a.timeInSeconds! - b.timeInSeconds!)
                    .map((timestamp, index) => (
                      <button
                        key={index}
                        onClick={() => handleTimestampClick(timestamp.timeInSeconds!)}
                        className="w-full text-left p-2 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-sm text-green-600 font-medium whitespace-nowrap">
                            {formatTime(timestamp.timeInSeconds!)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800">
                              {timestamp.label}
                            </p>
                            {timestamp.notes && (
                              <p className="text-sm text-gray-600 mt-1">
                                {timestamp.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
