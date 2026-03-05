import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Users,
  Zap,
  TrendingUp,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { TournamentPreStartDashboard, TrafficLightStatus, ApiResponse } from '@/types/api';

interface TrafficLightStyle {
  status: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  label: string;
}

const TRAFFIC_LIGHT_STYLES: Record<string, TrafficLightStyle> = {
  full: {
    status: 'full',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    label: 'Full Capacity',
  },
  partial: {
    status: 'partial',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    label: 'Partial',
  },
  insufficient: {
    status: 'insufficient',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    label: 'Insufficient',
  },
  none: {
    status: 'none',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    borderColor: 'border-gray-300',
    label: 'No Registrations',
  },
};

export default function OrganizerPreStartDashboard() {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const [dashboard, setDashboard] = useState<TournamentPreStartDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tournamentId) {
      fetchDashboard();
    }
  }, [tournamentId]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<ApiResponse<TournamentPreStartDashboard>>(
        `/tournaments/${tournamentId}/pre-start-dashboard`,
      );
      setDashboard(response.data as TournamentPreStartDashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p>Loading dashboard...</p>
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

  if (!dashboard) {
    return <div>No dashboard data available</div>;
  }

  const getStyle = (status: string) => {
    return TRAFFIC_LIGHT_STYLES[status] || TRAFFIC_LIGHT_STYLES.none;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'full':
        return 'destructive';
      case 'partial':
        return 'secondary';
      case 'insufficient':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dashboard.tournament.name}</h1>
          <p className="text-gray-600 mt-1">
            {new Date(dashboard.tournament.start_date).toLocaleDateString()} • Registration
            deadline: {new Date(dashboard.tournament.registration_deadline).toLocaleDateString()}
          </p>
        </div>
        <Button onClick={fetchDashboard} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboard.overview.totalEvents}</div>
            <p className="text-xs text-gray-500 mt-1">
              {dashboard.overview.totalRegistrations} total registrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">At Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {dashboard.overview.trafficLightCounts.full}
            </div>
            <p className="text-xs text-gray-500 mt-1">Events full</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ready to Start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {dashboard.overview.readyToStart}
            </div>
            <p className="text-xs text-gray-500 mt-1">meet minimum</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{dashboard.overview.atRisk}</div>
            <p className="text-xs text-gray-500 mt-1">Need more registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Light Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Event Status Overview</CardTitle>
          <CardDescription>
            Visual representation of registration capacity for each event
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboard.events.map((event) => {
              const style = getStyle(event.trafficLight.status);
              return (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border-2 ${style.bgColor} ${style.borderColor}`}
                >
                  {/* Traffic Light Indicator */}
                  <div
                    className={`inline-block w-4 h-4 rounded-full ${style.bgColor} border-2 ${style.borderColor}`}
                  ></div>
                  <div className={`text-sm font-semibold ${style.textColor} mt-2`}>
                    {style.label}
                  </div>

                  {/* Event Name */}
                  <h3 className="font-semibold text-sm mt-2">{event.name}</h3>

                  {/* Registrations */}
                  <div className="mt-2 text-xs text-gray-600">
                    <p className="font-medium">
                      {event.registrations.current}/{event.registrations.maximum} Registered
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          event.trafficLight.status === 'full'
                            ? 'bg-red-600'
                            : event.trafficLight.status === 'partial'
                              ? 'bg-yellow-600'
                              : 'bg-gray-400'
                        }`}
                        style={{
                          width: `${Math.min(event.registrations.capacityPercent, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-gray-500 mt-1">
                      {event.registrations.openSlots} slots available
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 mt-3">
                    {event.health.isPartial && event.actions.canStartEvent && (
                      <Badge variant="outline" className="text-xs flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Ready
                      </Badge>
                    )}
                    {event.health.isInsufficient && (
                      <Badge variant="destructive" className="text-xs flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Risk
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>Detailed breakdown of registrations for each event</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>Skill Block</TableHead>
                <TableHead>Current Registrations</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dashboard.events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>{event.skill_block}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      {event.registrations.current}/{event.registrations.maximum}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all"
                        style={{
                          width: `${Math.min(event.registrations.capacityPercent, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600 ml-1">
                      {event.registrations.capacityPercent}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(event.trafficLight.status)}>
                      {event.trafficLight.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alerts and Recommendations */}
      {dashboard.overview.atRisk > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{dashboard.overview.atRisk} event(s) have insufficient registrations.</strong>{' '}
            Consider promotional efforts or contact participants directly.
          </AlertDescription>
        </Alert>
      )}

      {dashboard.overview.trafficLightCounts.full === dashboard.overview.totalEvents && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All events are at capacity! Great job organizing.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
