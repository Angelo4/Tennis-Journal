"use client";

import { type RefObject } from "react";
import type { TennisSession } from "@/api";
import { Button, Input, TextArea } from "@/components/ui";
import { SESSION_TYPE_LABELS } from "@/utils/constants";
import { formatDateLong } from "@/utils/formatters";
import { YouTubePlayer, type YouTubePlayerHandle } from "./YouTubePlayer";
import { X } from "lucide-react";

interface VideoFocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  session: TennisSession;
  playerRef: RefObject<YouTubePlayerHandle | null>;
  showCaptureForm: boolean;
  captureData: {
    time: string;
    label: string;
    notes: string;
  };
  onCaptureDataChange: (data: { time: string; label: string; notes: string }) => void;
  onCaptureTime: () => void;
  onSaveTimestamp: () => void;
  onCancelCapture: () => void;
  onTimestampClick: (seconds: number) => void;
  formatTime: (seconds: number) => string;
  isSaving?: boolean;
}

export function VideoFocusMode({
  isOpen,
  onClose,
  session,
  playerRef,
  showCaptureForm,
  captureData,
  onCaptureDataChange,
  onCaptureTime,
  onSaveTimestamp,
  onCancelCapture,
  onTimestampClick,
  formatTime,
  isSaving = false,
}: VideoFocusModeProps) {
  if (!isOpen || !session.youTubeVideoUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-700">
        <div>
          <h2 className="text-white font-semibold text-lg">
            {formatDateLong(session.sessionDate)}
          </h2>
          <p className="text-gray-400 text-sm">
            {SESSION_TYPE_LABELS[session.type ?? 0]} • {session.location || "No location"}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-white"
          aria-label="Exit focus mode"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <div className="flex-1 flex items-center justify-center p-2 lg:p-4 min-h-0">
            <div className="w-full h-full flex items-center justify-center">
              <YouTubePlayer
                ref={playerRef}
                videoUrl={session.youTubeVideoUrl}
                className="w-full h-full max-h-full"
              />
            </div>
          </div>
          
          {/* Capture Button */}
          <div className="px-2 pb-2 lg:px-4 lg:pb-4">
            <Button
              variant="secondary"
              color="green"
              size="lg"
              onClick={onCaptureTime}
              className="w-full"
            >
              Capture Timestamp
            </Button>
          </div>

          {/* Capture Form in Focus Mode */}
          {showCaptureForm && (
            <div className="mx-2 mb-2 lg:mx-4 lg:mb-4 p-4 bg-gray-900 rounded-lg space-y-3 border border-green-500 w-auto [&_label]:text-gray-300 [&_input]:bg-gray-800 [&_input]:text-white [&_input]:border-gray-700 [&_textarea]:bg-gray-800 [&_textarea]:text-white [&_textarea]:border-gray-700 [&_input::placeholder]:text-gray-500 [&_textarea::placeholder]:text-gray-500">
              <h4 className="font-medium text-white">Save Timestamp</h4>
              <Input
                label="Time (HH:MM:SS)"
                value={captureData.time}
                onChange={(e) =>
                  onCaptureDataChange({ ...captureData, time: e.target.value })
                }
                color="green"
                readOnly
              />
              <Input
                label="Label"
                value={captureData.label}
                onChange={(e) =>
                  onCaptureDataChange({ ...captureData, label: e.target.value })
                }
                placeholder="e.g., Great serve, Match point"
                color="green"
              />
              <TextArea
                label="Notes (Optional)"
                value={captureData.notes}
                onChange={(e) =>
                  onCaptureDataChange({ ...captureData, notes: e.target.value })
                }
                placeholder="Additional notes..."
                rows={2}
                color="green"
              />
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  color="green"
                  onClick={onSaveTimestamp}
                  disabled={!captureData.label || isSaving}
                  isLoading={isSaving}
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  color="gray"
                  onClick={onCancelCapture}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Timestamps Sidebar */}
        {session.videoTimestamps && session.videoTimestamps.length > 0 && (
          <div className="lg:w-96 bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <p className="text-sm font-medium text-gray-300 uppercase tracking-wide">
                Timestamps ({session.videoTimestamps.length})
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {session.videoTimestamps
                .sort((a, b) => a.timeInSeconds! - b.timeInSeconds!)
                .map((timestamp, index) => (
                  <button
                    key={index}
                    onClick={() => onTimestampClick(timestamp.timeInSeconds!)}
                    className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-green-900/30 hover:border-green-500 border border-transparent transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-sm text-green-400 font-medium whitespace-nowrap">
                        {formatTime(timestamp.timeInSeconds!)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white">
                          {timestamp.label}
                        </p>
                        {timestamp.notes && (
                          <p className="text-sm text-gray-400 mt-1">
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
    </div>
  );
}
