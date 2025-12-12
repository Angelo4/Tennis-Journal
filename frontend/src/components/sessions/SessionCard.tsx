"use client";

import { useRef, useState } from "react";
import type { TennisSession, TennisString } from "@/api";
import { Card, CardHeader, CardBody, Badge, Button, Input, TextArea } from "@/components/ui";
import { SESSION_TYPE_LABELS, SURFACE_LABELS } from "@/utils/constants";
import { formatDateLong, formatRating } from "@/utils/formatters";
import { YouTubePlayer, type YouTubePlayerHandle } from "./YouTubePlayer";
import { VideoFocusMode } from "./VideoFocusMode";
import { useUpdateSession } from "@/hooks/useSessions";
import { Pencil, Trash2, Maximize2, X } from "lucide-react";

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
  const [showVideoSection, setShowVideoSection] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
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

  const handleDeleteTimestamp = async (index: number) => {
    const updatedTimestamps = session.videoTimestamps?.filter((_, i) => i !== index);
    
    await updateSession.mutateAsync({
      id: session.id!,
      data: {
        videoTimestamps: updatedTimestamps,
      },
    });
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
              aria-label="Edit session"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="link"
              color="red"
              onClick={() => onDelete(session.id!)}
              disabled={isDeleting}
              aria-label="Delete session"
            >
              <Trash2 className="w-4 h-4" />
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
            <button
              type="button"
              onClick={() => setShowVideoSection(!showVideoSection)}
              className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors"
            >
              <span>{showVideoSection ? "▼" : "▶"}</span>
              Video Recording
            </button>

            {showVideoSection && (
              <>
                <div className="lg:flex lg:gap-4">
                  {/* Video Player and Controls */}
                  <div className="lg:flex-1 space-y-3">
                    <div className="relative">
                      <YouTubePlayer
                        ref={playerRef}
                        videoUrl={session.youTubeVideoUrl}
                        className="w-full"
                      />
                      <button
                        onClick={() => setIsFocusMode(true)}
                        className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors"
                        aria-label="Enter focus mode"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
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
                  </div>

                  {/* Timestamps - Right side on large screens, scrollable */}
                  {session.videoTimestamps && session.videoTimestamps.length > 0 && (
                    <div className="mt-3 lg:mt-0 lg:w-80">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                        Timestamps ({session.videoTimestamps.length})
                      </p>
                      <div className="space-y-2 lg:max-h-96 lg:overflow-y-auto lg:pr-2 lg:scrollbar-thin lg:scrollbar-thumb-gray-300 lg:scrollbar-track-gray-100">
                        {session.videoTimestamps
                          .sort((a, b) => a.timeInSeconds! - b.timeInSeconds!)
                          .map((timestamp, index) => (
                            <div
                              key={index}
                              className="w-full flex items-start gap-2 p-2 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors"
                            >
                              <button
                                onClick={() => handleTimestampClick(timestamp.timeInSeconds!)}
                                className="flex-1 text-left"
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTimestamp(index);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                aria-label="Delete timestamp"
                              >
                                <X className="w-4 h-4" />
                              </button>
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

        {/* Focus Mode Modal */}
        <VideoFocusMode
          isOpen={isFocusMode}
          onClose={() => setIsFocusMode(false)}
          session={session}
          playerRef={playerRef}
          showCaptureForm={showCaptureForm}
          captureData={captureData}
          onCaptureDataChange={setCaptureData}
          onCaptureTime={handleCaptureTime}
          onSaveTimestamp={handleSaveTimestamp}
          onCancelCapture={() => {
            setShowCaptureForm(false);
            setCaptureData({ time: "", label: "", notes: "" });
          }}
          onTimestampClick={handleTimestampClick}
          onDeleteTimestamp={handleDeleteTimestamp}
          formatTime={formatTime}
          isSaving={updateSession.isPending}
        />
      </CardBody>
    </Card>
  );
}
