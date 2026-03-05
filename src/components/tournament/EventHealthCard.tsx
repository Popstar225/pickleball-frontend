/**
 * EventHealthCard.tsx
 *
 * Traffic-light status card for individual tournament events
 * Shows registration status, health indicators, and quick actions
 */

import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Trash2, Shuffle, Combine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function EventHealthCard({ event, onAction }) {
  // Determine traffic light status
  const getStatus = () => {
    const registrations = event.current_participants;
    const minimum = event.minimum_participants;
    const maximum = event.max_participants;

    if (registrations >= maximum)
      return { status: 'full', color: 'bg-red-100', textColor: 'text-red-800', icon: CheckCircle };
    if (registrations >= minimum && registrations < maximum)
      return {
        status: 'partial',
        color: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        icon: AlertTriangle,
      };
    if (registrations > 0 && registrations < minimum)
      return {
        status: 'insufficient',
        color: 'bg-orange-100',
        textColor: 'text-orange-800',
        icon: AlertCircle,
      };
    return { status: 'none', color: 'bg-gray-100', textColor: 'text-gray-800', icon: AlertCircle };
  };

  const statusInfo = getStatus();
  const StatusIcon = statusInfo.icon;
  const capacityPercent = Math.round((event.current_participants / event.max_participants) * 100);

  return (
    <Card className={`${statusInfo.color} border-0`}>
      <CardContent className="pt-6">
        {/* Event Title */}
        <div className="mb-4">
          <h3 className={`font-semibold text-lg ${statusInfo.textColor}`}>
            {event.skill_block} {event.gender} {event.modality}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{event.format}</p>
        </div>

        {/* Registration Status */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Registrations</span>
            <span className="text-sm font-bold">
              {event.current_participants}/{event.max_participants}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                capacityPercent >= 100
                  ? 'bg-red-500'
                  : capacityPercent >= 75
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(capacityPercent, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            Minimum: {event.minimum_participants} • Max: {event.max_participants}
          </p>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <Badge
            variant={
              statusInfo.status === 'full'
                ? 'destructive'
                : statusInfo.status === 'partial'
                  ? 'default'
                  : 'secondary'
            }
          >
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.status.charAt(0).toUpperCase() + statusInfo.status.slice(1)}
          </Badge>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {statusInfo.status === 'insufficient' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => onAction('cancel')}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancel Event
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => onAction('format')}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Change Format
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full justify-start"
                onClick={() => onAction('merge')}
              >
                <Combine className="w-4 h-4 mr-2" />
                Merge Events
              </Button>
            </>
          )}

          {statusInfo.status === 'partial' && (
            <p className="text-xs text-gray-600 font-medium">✓ Ready to proceed</p>
          )}

          {statusInfo.status === 'full' && (
            <p className="text-xs text-gray-600 font-medium">✓ At capacity</p>
          )}

          {statusInfo.status === 'none' && (
            <p className="text-xs text-gray-600 font-medium text-center">No registrations yet</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
