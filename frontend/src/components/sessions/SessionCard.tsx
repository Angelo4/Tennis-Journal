"use client";

import type { TennisSession, TennisString } from "@/api";
import { Card, CardHeader, CardBody, Badge, Button } from "@/components/ui";
import { SESSION_TYPE_LABELS, SURFACE_LABELS } from "@/utils/constants";
import { formatDateLong, formatRating } from "@/utils/formatters";

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
  const getStringName = (stringId: string | null | undefined) => {
    if (!stringId || !strings) return "No string assigned";
    const str = strings.find((s) => s.id === stringId);
    return str ? `${str.brand} ${str.model}` : "Unknown string";
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
      </CardBody>
    </Card>
  );
}
