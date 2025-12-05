"use client";

import type { TennisString } from "@/api";
import { useStringUsage } from "@/hooks/useStrings";
import { Card, CardHeader, CardBody, CardFooter, Badge, Button } from "@/components/ui";
import { STRING_TYPE_LABELS } from "@/utils/constants";
import { formatDate, formatTension } from "@/utils/formatters";

interface StringCardProps {
  string: TennisString;
  onEdit: (string: TennisString) => void;
  onRemove: (string: TennisString) => void;
  onRestore: (string: TennisString) => void;
  onDelete: (id: string) => void;
  isRemoving?: boolean;
  isRestoring?: boolean;
  isDeleting?: boolean;
}

function StringUsageInfo({ stringId }: { stringId: string }) {
  const { data: usage, isLoading } = useStringUsage(stringId);

  if (isLoading) {
    return <span className="text-gray-400 text-sm">Loading stats...</span>;
  }

  if (!usage) return null;

  return (
    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
      <span>
        <strong>{usage.totalSessions ?? 0}</strong> sessions
      </span>
      <span>
        <strong>{Math.round((usage.totalMinutesPlayed ?? 0) / 60)}h</strong> played
      </span>
      {(usage.averageFeelingRating ?? 0) > 0 && (
        <span>
          Avg feel: <strong>{(usage.averageFeelingRating ?? 0).toFixed(1)}</strong>/10
        </span>
      )}
    </div>
  );
}

export function StringCard({
  string,
  onEdit,
  onRemove,
  onRestore,
  onDelete,
  isRemoving,
  isRestoring,
  isDeleting,
}: StringCardProps) {
  const isRemoved = string.isActive === false;

  return (
    <Card dimmed={isRemoved} hoverable>
      <CardHeader
        actions={
          <div className="flex gap-1">
            <Button
              variant="link"
              color="blue"
              size="sm"
              onClick={() => onEdit(string)}
            >
              Edit
            </Button>
            {!isRemoved ? (
              <Button
                variant="link"
                color="yellow"
                size="sm"
                onClick={() => onRemove(string)}
                disabled={isRemoving}
              >
                Remove
              </Button>
            ) : (
              <Button
                variant="link"
                color="green"
                size="sm"
                onClick={() => onRestore(string)}
                disabled={isRestoring}
              >
                Reactivate
              </Button>
            )}
            <Button
              variant="link"
              color="red"
              size="sm"
              onClick={() => onDelete(string.id!)}
              disabled={isDeleting}
            >
              Delete
            </Button>
          </div>
        }
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {string.brand} {string.model}
          </h3>
          {isRemoved && <Badge variant="default">Removed</Badge>}
        </div>
        <Badge variant="warning">{STRING_TYPE_LABELS[string.type ?? 0]}</Badge>
      </CardHeader>

      <CardBody>
        <div className="space-y-1 text-sm text-gray-600">
          {string.gauge && (
            <p>
              <span className="font-medium">Gauge:</span> {string.gauge}
            </p>
          )}
          <p>
            <span className="font-medium">Tension:</span>{" "}
            {formatTension(string.mainTension, string.crossTension)}
          </p>
          <p>
            <span className="font-medium">Strung:</span>{" "}
            {formatDate(string.dateStrung)}
          </p>
          {isRemoved && string.dateRemoved && (
            <p>
              <span className="font-medium">Removed:</span>{" "}
              {formatDate(string.dateRemoved)}
            </p>
          )}
        </div>

        {string.notes && (
          <p className="mt-2 text-gray-500 text-sm italic">{string.notes}</p>
        )}
      </CardBody>

      {string.id && (
        <CardFooter>
          <StringUsageInfo stringId={string.id} />
        </CardFooter>
      )}
    </Card>
  );
}
