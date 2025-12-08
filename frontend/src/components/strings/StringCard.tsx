"use client";

import { useState } from "react";
import type { TennisString } from "@/api";
import { StringStatus } from "@/api";
import { useStringUsage } from "@/hooks/useStrings";
import { Card, CardHeader, CardBody, CardFooter, Badge, Button, Input } from "@/components/ui";
import { STRING_TYPE_LABELS, STRING_STATUS_LABELS } from "@/utils/constants";
import { formatDate, formatTension } from "@/utils/formatters";
import { Pencil, Trash2, XCircle } from "lucide-react";

interface StringCardProps {
  string: TennisString;
  onEdit: (string: TennisString) => void;
  onRemove: (string: TennisString) => void;
  onDelete: (id: string) => void;
  isRemoving?: boolean;
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
  onDelete,
  isRemoving,
  isDeleting,
}: StringCardProps) {
  const isRemoved = string.status === StringStatus.REMOVED;
  const isStrung = string.status === StringStatus.STRUNG;
  const [showRemoveForm, setShowRemoveForm] = useState(false);
  const [removalDate, setRemovalDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleRemoveClick = () => {
    setShowRemoveForm(true);
  };

  const handleConfirmRemove = () => {
    onRemove({ ...string, dateRemoved: new Date(removalDate).toISOString() });
    setShowRemoveForm(false);
  };

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
              aria-label="Edit string"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            {isStrung && (
              <Button
                variant="link"
                color="yellow"
                size="sm"
                onClick={handleRemoveClick}
                disabled={isRemoving}
                aria-label="Remove string"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="link"
              color="red"
              size="sm"
              onClick={() => onDelete(string.id!)}
              disabled={isDeleting}
              aria-label="Delete string"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        }
      >
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-gray-800">
            {string.brand} {string.model}
          </h3>
          <Badge 
            variant={string.status === StringStatus.INVENTORY ? "info" : string.status === StringStatus.STRUNG ? "success" : "default"}
          >
            {STRING_STATUS_LABELS[string.status ?? 0]}
          </Badge>
        </div>
        <Badge variant="warning">{STRING_TYPE_LABELS[string.type ?? 0]}</Badge>
      </CardHeader>

      <CardBody>
        {/* Remove Form */}
        {showRemoveForm && (
          <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 space-y-3">
            <h4 className="font-medium text-gray-800">Remove String</h4>
            <Input
              label="Removal Date"
              type="date"
              value={removalDate}
              onChange={(e) => setRemovalDate(e.target.value)}
              color="yellow"
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                color="yellow"
                size="sm"
                onClick={handleConfirmRemove}
                disabled={isRemoving}
                isLoading={isRemoving}
              >
                Confirm Remove
              </Button>
              <Button
                variant="secondary"
                color="gray"
                size="sm"
                onClick={() => setShowRemoveForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-1 text-sm text-gray-600">
          {string.gauge && (
            <p>
              <span className="font-medium">Gauge:</span> {string.gauge}
            </p>
          )}
          {isStrung && (
            <>
              <p>
                <span className="font-medium">Tension:</span>{" "}
                {formatTension(string.mainTension, string.crossTension)}
              </p>
              <p>
                <span className="font-medium">Strung:</span>{" "}
                {formatDate(string.dateStrung)}
              </p>
            </>
          )}
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

      {string.id && isStrung && (
        <CardFooter>
          <StringUsageInfo stringId={string.id} />
        </CardFooter>
      )}
    </Card>
  );
}
