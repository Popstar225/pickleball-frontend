import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Building2,
  Loader2,
  Shield,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { TournamentApprovalInfo, PendingTournamentsResponse, ApiResponse } from '@/types/api';

interface ApprovalDialogState {
  tournamentId: string | null;
  type: 'approve' | 'reject' | null;
  notes: string;
}

export default function StateTournamentApprovalPanel() {
  const [pendingTournaments, setPendingTournaments] = useState<TournamentApprovalInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dialogState, setDialogState] = useState<ApprovalDialogState>({
    tournamentId: null,
    type: null,
    notes: '',
  });

  // Get state from URL or user session - for now using a default
  const state = 'California'; // Replace with actual state from user session

  useEffect(() => {
    fetchPendingTournaments();
  }, []);

  const fetchPendingTournaments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ApiResponse<PendingTournamentsResponse>>(
        `/tournaments/pending-approvals?state=${encodeURIComponent(state)}&page=1&limit=50`,
      );

      const data = response.data as unknown as PendingTournamentsResponse;
      setPendingTournaments(data.data.tournaments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (tournamentId: string) => {
    setDialogState({ tournamentId, type: 'approve', notes: '' });
  };

  const handleReject = (tournamentId: string) => {
    setDialogState({ tournamentId, type: 'reject', notes: '' });
  };

  const submitApproval = async () => {
    if (!dialogState.tournamentId || !dialogState.type) return;

    try {
      setSubmitting(true);

      if (dialogState.type === 'approve') {
        await api.put(`/tournaments/${dialogState.tournamentId}/approve`, {
          approval_notes: dialogState.notes,
        });
      } else {
        await api.put(`/tournaments/${dialogState.tournamentId}/reject`, {
          rejection_reason: dialogState.notes,
        });
      }

      // Refresh list
      fetchPendingTournaments();

      // Reset dialog
      setDialogState({ tournamentId: null, type: null, notes: '' });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p>Loading pending tournaments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tournament Approvals</h1>
          <p className="text-gray-600 mt-1">Review and approve local tournaments for {state}</p>
        </div>
        <Button onClick={fetchPendingTournaments} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingTournaments.length}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24 hrs</div>
            <p className="text-xs text-gray-500 mt-1">Average approval time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">94%</div>
            <p className="text-xs text-gray-500 mt-1">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      {pendingTournaments.length === 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All tournaments have been reviewed! No pending approvals at this time.
          </AlertDescription>
        </Alert>
      )}

      {/* Pending Tournaments Table */}
      {pendingTournaments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Tournaments</CardTitle>
            <CardDescription>Local tournaments awaiting state approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tournament Name</TableHead>
                    <TableHead>Organizer</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Registrations</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTournaments.map((tournament) => (
                    <TableRow key={tournament.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{tournament.name}</p>
                          <p className="text-sm text-gray-500">
                            Submitted {new Date(tournament.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          {tournament.organizer_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium">{tournament.venue_name}</p>
                            <p className="text-xs text-gray-500">
                              {tournament.city}, {tournament.state}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm">
                              {new Date(tournament.start_date).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Registration:{' '}
                              {new Date(tournament.registration_deadline).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Pending</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(tournament.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(tournament.id)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval/Rejection Dialog */}
      <Dialog
        open={dialogState.tournamentId !== null}
        onOpenChange={(open) =>
          !open && setDialogState({ tournamentId: null, type: null, notes: '' })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogState.type === 'approve' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Approve Tournament
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Reject Tournament
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {dialogState.type === 'approve'
                ? 'This tournament will be approved and added to the state calendar.'
                : 'This tournament will be rejected. Provide a reason below.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {dialogState.type === 'approve' && (
              <Alert className="border-green-200 bg-green-50">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  The tournament organizer will be notified and the event will appear on the state
                  calendar.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                {dialogState.type === 'approve'
                  ? 'Notes (Optional)'
                  : 'Reason for Rejection (Required)'}
              </label>
              <Textarea
                placeholder={
                  dialogState.type === 'approve'
                    ? 'Add any approvals notes or requirements...'
                    : 'Explain why this tournament cannot be approved...'
                }
                value={dialogState.notes}
                onChange={(e) => setDialogState({ ...dialogState, notes: e.target.value })}
                rows={4}
              />
            </div>

            {dialogState.type === 'reject' && !dialogState.notes && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Please provide a reason for rejection.</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogState({ tournamentId: null, type: null, notes: '' })}
            >
              Cancel
            </Button>
            <Button
              onClick={submitApproval}
              disabled={
                submitting || (dialogState.type === 'reject' && dialogState.notes.trim() === '')
              }
              className={
                dialogState.type === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : dialogState.type === 'approve' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
