import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Shield,
  Calendar,
  User,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { ApprovalAuditTrail, ApiResponse } from '@/types/api';

interface StatusTransition {
  status: string;
  changed_at: string;
  approved_by?: any;
  rejected_by?: any;
  notes?: string;
  reason?: string;
}

export default function ApprovalAuditTrailView() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const [auditTrail, setAuditTrail] = useState<ApprovalAuditTrail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tournamentId) return;
    fetchAuditTrail();
  }, [tournamentId]);

  const fetchAuditTrail = async () => {
    if (!tournamentId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ApiResponse<ApprovalAuditTrail>>(
        `/tournaments/${tournamentId}/approval-audit`,
      );
      setAuditTrail(response.data as ApprovalAuditTrail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit trail');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'state_approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'state_rejected':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending_state_approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'state_approved':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'state_rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending_state_approval':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'state_approved':
        return 'State Approved';
      case 'state_rejected':
        return 'State Rejected';
      case 'pending_state_approval':
        return 'Pending State Approval';
      default:
        return status.replace(/_/g, ' ');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p>Loading approval history...</p>
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

  if (!auditTrail) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No approval history found for this tournament.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Approval Audit Trail</h1>
        <p className="text-gray-600 mt-1">Complete history of all state approval decisions</p>
      </div>

      {/* Current Status Card */}
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Current Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {getStatusIcon(auditTrail.current_status)}
            <div>
              <p className="text-2xl font-bold">{getStatusLabel(auditTrail.current_status)}</p>
              <p className="text-sm text-gray-600 mt-1">
                Last updated:{' '}
                {formatDate(auditTrail.status_history[0]?.changed_at || new Date().toISOString())}
              </p>
            </div>
          </div>

          <Badge className={`w-fit ${getStatusColor(auditTrail.current_status)}`}>
            {getStatusLabel(auditTrail.current_status)}
          </Badge>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Decision Timeline</CardTitle>
          <CardDescription>Complete approval decision history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {auditTrail.status_history.map((transition: StatusTransition, index: number) => (
              <div key={index}>
                <div className="flex gap-4 py-6">
                  {/* Timeline Icon */}
                  <div className="flex flex-col items-center">
                    <div className="rounded-full p-2 bg-gray-100">
                      {getStatusIcon(transition.status)}
                    </div>
                    {index < auditTrail.status_history.length - 1 && (
                      <div className="w-1 h-16 bg-gray-200 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{getStatusLabel(transition.status)}</h3>
                      <Badge variant="outline" className={getStatusColor(transition.status)}>
                        {getStatusLabel(transition.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Calendar className="h-4 w-4" />
                      {formatDate(transition.changed_at)}
                    </div>

                    {/* Admin Info */}
                    {(transition.approved_by || transition.rejected_by) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <p className="font-medium text-blue-900">
                            {transition.approved_by
                              ? `Approved by ${transition.approved_by.name || transition.approved_by.email}`
                              : `Rejected by ${transition.rejected_by?.name || transition.rejected_by?.email}`}
                          </p>
                        </div>
                        {transition.approved_by && (
                          <p className="text-sm text-blue-700">
                            Email: {transition.approved_by.email}
                          </p>
                        )}
                        {transition.rejected_by && (
                          <p className="text-sm text-blue-700">
                            Email: {transition.rejected_by.email}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Comments/Reason */}
                    {transition.notes && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-green-900 mb-1">Approval Notes</p>
                        <p className="text-sm text-green-800">{transition.notes}</p>
                      </div>
                    )}

                    {transition.reason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason</p>
                        <p className="text-sm text-red-800">{transition.reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {index < auditTrail.status_history.length - 1 && <Separator />}
              </div>
            ))}
          </div>

          {auditTrail.status_history.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No status changes recorded yet.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistics Card */}
      {auditTrail.status_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Changes</p>
                <p className="text-2xl font-bold">{auditTrail.status_history.length}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">First Decision</p>
                <p className="text-sm font-semibold">
                  {new Date(
                    auditTrail.status_history[auditTrail.status_history.length - 1]?.changed_at,
                  ).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Latest Decision</p>
                <p className="text-sm font-semibold">
                  {new Date(auditTrail.status_history[0]?.changed_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Current Status</p>
                <p className="text-sm font-semibold">{getStatusLabel(auditTrail.current_status)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
