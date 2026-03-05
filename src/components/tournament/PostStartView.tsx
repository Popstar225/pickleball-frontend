/**
 * PostStartView.tsx
 *
 * Read-only dashboard for organizers after tournament start
 * Shows groups, brackets, results entry interface, and progress
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye,
  Users,
  Brackets,
  RectangleHorizontal,
  CheckCircle,
  AlertCircle,
  BarChart3,
} from 'lucide-react';

export function PostStartView({ tournament, events, groups = [], brackets = [], matches = [] }) {
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || null);
  const [selectedEvent, setSelectedEvent] = useState(events[0]?.id || null);

  // Calculate tournament progress
  const totalMatches = matches.length;
  const completedMatches = matches.filter((m) => m.status === 'completed').length;
  const pendingMatches = matches.filter((m) => m.status === 'pending').length;
  const progressPercent =
    totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  const currentGroup = groups.find((g) => g.id === selectedGroup);
  const currentEvent = events.find((e) => e.id === selectedEvent);

  return (
    <div className="space-y-6">
      {/* Locked Status Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900">
          Tournament is in progress. Event formats, slots, and participant lists are locked. You can
          only enter and correct match results.
        </AlertDescription>
      </Alert>

      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Tournament Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-blue-500 transition-all"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedMatches}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingMatches}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{totalMatches}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="brackets" className="flex items-center gap-2">
            <Brackets className="w-4 h-4" />
            Brackets
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <RectangleHorizontal className="w-4 h-4" />
            Corrections
          </TabsTrigger>
        </TabsList>

        {/* Groups Tab */}
        <TabsContent value="groups" className="space-y-4">
          {groups.length > 0 ? (
            <>
              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Event</label>
                <select
                  value={selectedEvent || ''}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="">Select event</option>
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.skill_block} {evt.gender} {evt.modality}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 block mb-2">Group</label>
                <select
                  value={selectedGroup || ''}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  {groups
                    .filter((g) => g.event_id === selectedEvent)
                    .map((group) => (
                      <option key={group.id} value={group.id}>
                        Group {group.group_letter || group.name}
                      </option>
                    ))}
                </select>
              </div>

              {currentGroup && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {currentEvent?.skill_block} {currentEvent?.gender} - Group{' '}
                      {currentGroup.group_letter}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-2">Player</th>
                          <th className="text-center py-2 px-2">W</th>
                          <th className="text-center py-2 px-2">L</th>
                          <th className="text-center py-2 px-2">Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentGroup.standings?.map((standing, idx) => (
                          <tr key={idx} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-2">
                              <p className="font-medium">{standing.player_name}</p>
                              <p className="text-xs text-gray-500">{standing.player_email}</p>
                            </td>
                            <td className="text-center py-2 px-2 font-semibold">{standing.wins}</td>
                            <td className="text-center py-2 px-2 font-semibold">
                              {standing.losses}
                            </td>
                            <td className="text-center py-2 px-2 font-bold text-blue-600">
                              {standing.points}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No groups created yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Brackets Tab */}
        <TabsContent value="brackets" className="space-y-4">
          {brackets.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Knockout Bracket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {brackets.map((bracket, idx) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                      <p className="font-semibold text-sm mb-3">{bracket.round_name}</p>
                      <div className="space-y-2">
                        {bracket.matches?.map((match, midx) => (
                          <div
                            key={midx}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded"
                          >
                            <div className="text-sm">
                              <p className="font-medium">
                                {match.player1_name} vs {match.player2_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {match.set_scores
                                  ? JSON.parse(match.set_scores).join(', ')
                                  : 'No result yet'}
                              </p>
                            </div>
                            <Badge
                              variant={
                                match.status === 'completed'
                                  ? 'default'
                                  : match.status === 'in-progress'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {match.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No bracket created yet</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Corrections Tab */}
        <TabsContent value="history" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              View and manage match result corrections. All changes are audited with reason and
              timestamp.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Corrections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {matches
                  .filter((m) => m.correction_history?.length > 0)
                  .map((match, idx) => (
                    <div key={idx} className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {match.player1_name} vs {match.player2_name}
                          </p>
                          <p className="text-xs text-gray-600">{match.event_name}</p>
                        </div>
                        <Badge variant="secondary">
                          {match.correction_history.length} correction(s)
                        </Badge>
                      </div>
                      <div className="space-y-2 mt-3">
                        {match.correction_history.map((correction, cidx) => (
                          <div
                            key={cidx}
                            className="text-xs bg-white p-2 rounded border border-amber-100"
                          >
                            <p className="font-medium text-gray-900">
                              {new Date(correction.timestamp).toLocaleDateString()} at{' '}
                              {new Date(correction.timestamp).toLocaleTimeString()}
                            </p>
                            <p className="text-gray-600 mt-1">By: {correction.corrected_by}</p>
                            <p className="text-gray-600">Reason: {correction.reason}</p>
                            <p className="text-gray-600">
                              Result: {correction.previous_score} → {correction.new_score}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>

              {matches.filter((m) => m.correction_history?.length > 0).length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-600">No corrections recorded yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
