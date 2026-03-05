/**
 * EventManagementTable.tsx
 *
 * Sortable/filterable table showing all tournament events with actions
 * Allows bulk operations like cancel, format change, merge
 */

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, ArrowUpDown, Eye } from 'lucide-react';

export function EventManagementTable({ events, onAction, sortBy = 'name', sortDir = 'asc' }) {
  const [sort, setSort] = useState({ by: sortBy, dir: sortDir });

  // Sort events
  const sortedEvents = [...events].sort((a, b) => {
    let aVal = a[sort.by];
    let bVal = b[sort.by];

    if (sort.by === 'fill_percentage') {
      aVal = (a.current_participants / a.max_participants) * 100;
      bVal = (b.current_participants / b.max_participants) * 100;
    }

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sort.dir === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (event) => {
    const registrations = event.current_participants;
    const minimum = event.minimum_participants;
    const maximum = event.max_participants;

    if (registrations >= maximum) return <Badge variant="destructive">Full</Badge>;
    if (registrations >= minimum) return <Badge variant="default">Ready</Badge>;
    if (registrations > 0) return <Badge variant="secondary">Insufficient</Badge>;
    return <Badge variant="outline">No entries</Badge>;
  };

  const toggleSort = (field) => {
    if (sort.by === field) {
      setSort({ by: field, dir: sort.dir === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ by: field, dir: 'asc' });
    }
  };

  const SortHeader = ({ field, label }) => (
    <TableHead className="cursor-pointer" onClick={() => toggleSort(field)}>
      <div className="flex items-center gap-2">
        {label}
        {sort.by === field && <ArrowUpDown className="w-4 h-4" />}
      </div>
    </TableHead>
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHeader field="skill_block" label="Skill Block" />
            <SortHeader field="gender" label="Gender" />
            <SortHeader field="modality" label="Modality" />
            <SortHeader field="format" label="Format" />
            <SortHeader field="fill_percentage" label="Registrations" />
            <SortHeader field="current_participants" label="Status" />
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEvents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No events available
              </TableCell>
            </TableRow>
          ) : (
            sortedEvents.map((event) => {
              const fillPercent = Math.round(
                (event.current_participants / event.max_participants) * 100,
              );
              return (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.skill_block}</TableCell>
                  <TableCell>{event.gender}</TableCell>
                  <TableCell>{event.modality}</TableCell>
                  <TableCell>{event.format}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold text-sm">
                        {event.current_participants}/{event.max_participants}
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-1.5 rounded-full ${
                            fillPercent >= 100
                              ? 'bg-red-500'
                              : fillPercent >= 75
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(fillPercent, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{fillPercent}% full</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(event)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`action-trigger-${event.id}`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onAction('view', event)}
                          data-testid={`action-view-${event.id}`}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {event.current_participants < event.minimum_participants && (
                          <>
                            <DropdownMenuItem
                              onClick={() => onAction('cancel', event)}
                              data-testid={`action-cancel-${event.id}`}
                            >
                              Cancel Event
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onAction('format', event)}
                              data-testid={`action-format-${event.id}`}
                            >
                              Change Format
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onAction('merge', event)}
                              data-testid={`action-merge-${event.id}`}
                            >
                              Merge with Event
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
