import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, TrendingUp, Users, Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CoachPostMatchWorkflowProps {
  tournamentId: string;
  eventId: string;
  onComplete?: () => void;
}

export function CoachPostMatchWorkflow({
  tournamentId,
  eventId,
  onComplete,
}: CoachPostMatchWorkflowProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPostMatchData();
    const interval = setInterval(fetchPostMatchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [eventId]);

  const fetchPostMatchData = async () => {
    try {
      // Fetch multiple data points in parallel
      const [matchesRes, qualifiersRes, bracketRes, completionRes] = await Promise.all([
        fetch(`/api/v1/tournaments/${tournamentId}/events/${eventId}/matches`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`/api/v1/tournaments/${tournamentId}/events/${eventId}/qualifiers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`/api/v1/tournaments/${tournamentId}/events/${eventId}/bracket`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch(`/api/v1/tournaments/${tournamentId}/completion-status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }),
      ]);

      const [matchesData, qualifiersData, bracketData, completionData] = await Promise.all([
        matchesRes.json(),
        qualifiersRes.json(),
        bracketRes.json(),
        completionRes.json(),
      ]);

      setData({
        matches: matchesData,
        qualifiers: qualifiersData,
        bracket: bracketData,
        completion: completionData,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const totalMatches = data?.matches?.matchCount || 0;
  const completedMatches = data?.matches?.matches?.filter((m: any) => m.status === 'completed').length || 0;
  const bracketGenerated = data?.bracket?.bracket && Object.keys(data.bracket.bracket).length > 0;
  const qualifierCount = data?.qualifiers?.qualifier_count || 0;

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{completedMatches}/{totalMatches}</p>
                <p className="text-sm text-gray-300">Matches Done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={bracketGenerated ? 'border-green-500' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {bracketGenerated ? (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              )}
              <div>
                <p className="text-2xl font-bold">{bracketGenerated ? '✓' : '—'}</p>
                <p className="text-sm text-gray-300">Bracket Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{qualifierCount}</p>
                <p className="text-sm text-gray-300">Qualifiers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-gold-600" />
              <div>
                <p className="text-2xl font-bold">
                  {data?.completion?.tournament_complete ? '✓' : '—'}
                </p>
                <p className="text-sm text-gray-300">Tournament Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matches">
            Matches <Badge className="ml-2">{completedMatches}</Badge>
          </TabsTrigger>
          <TabsTrigger value="qualifiers">
            Qualifiers <Badge className="ml-2">{qualifierCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="bracket">Bracket</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Post-Match Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <WorkflowStep
                number={1}
                title="Record Group Matches"
                description="Coach records all group stage match results"
                completed={completedMatches > 0}
                status={completedMatches < totalMatches ? 'in-progress' : 'completed'}
              />
              <WorkflowStep
                number={2}
                title="Auto-Bracket Generation"
                description="When all group matches are done, bracket automatically generates"
                completed={bracketGenerated}
                status={
                  completedMatches === totalMatches && !bracketGenerated
                    ? 'in-progress'
                    : bracketGenerated
                    ? 'completed'
                    : 'pending'
                }
              />
              <WorkflowStep
                number={3}
                title="Qualifiers Advanced"
                description="Top 2 from each group automatically advance to single-elimination"
                completed={qualifierCount > 0}
                status={bracketGenerated ? 'completed' : 'pending'}
              />
              <WorkflowStep
                number={4}
                title="Bracket Tournament"
                description="Single-elimination bracket matches begin"
                completed={false}
                status={bracketGenerated ? 'in-progress' : 'pending'}
              />
              <WorkflowStep
                number={5}
                title="Tournament Complete"
                description="Final winner determined and rankings updated"
                completed={data?.completion?.tournament_complete}
                status={data?.completion?.tournament_complete ? 'completed' : 'pending'}
              />
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>💡 Tip:</strong> Matches are automatically advanced winners to the next round. The system
                detects when the bracket should be generated and qualifies advancing players.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>Match Status</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.matches?.matches && data.matches.matches.length > 0 ? (
                <div className="space-y-3">
                  {data.matches.matches.map((match: any) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {match.player1.name} vs {match.player2.name}
                        </p>
                        <p className="text-xs text-gray-300">Group {match.group_id || 'bracket'}</p>
                      </div>
                      <Badge variant={match.status === 'completed' ? 'default' : 'secondary'}>
                        {match.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300 text-center py-4">No matches yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifiers">
          <Card>
            <CardHeader>
              <CardTitle>Advancing Qualifiers</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.qualifiers?.qualifiers && data.qualifiers.qualifiers.length > 0 ? (
                <div className="space-y-3">
                  {data.qualifiers.qualifiers.map((qual: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium">{qual.user_name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {qual.skill_level}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Group {qual.group_number} - #{qual.seed_position}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-700">{qual.points} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300 text-center py-4">No qualifiers yet. Complete group stage first.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bracket">
          <Card>
            <CardHeader>
              <CardTitle>Bracket Status</CardTitle>
            </CardHeader>
            <CardContent>
              {bracketGenerated ? (
                <div className="space-y-4">
                  <p className="text-sm text-green-600 font-medium">✓ Bracket generated and ready!</p>
                  {data?.bracket?.bracket && (
                    <div>
                      <p className="text-sm font-medium mb-2">Rounds:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(data.bracket.bracket).map(round => (
                          <Badge key={round} variant="outline">
                            Round {round}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-300 text-center py-4">
                  Bracket will be generated automatically once all group matches are completed.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
  completed,
  status,
}: {
  number: number;
  title: string;
  description: string;
  completed: boolean;
  status: 'pending' | 'in-progress' | 'completed';
}) {
  const statusColors = {
    pending: 'bg-gray-100 border-gray-300 text-gray-300',
    'in-progress': 'bg-yellow-100 border-yellow-300 text-yellow-800',
    completed: 'bg-green-100 border-green-300 text-green-800',
  };

  return (
    <div className={`flex gap-4 p-4 rounded-lg border-2 ${statusColors[status]}`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
        status === 'completed'
          ? 'bg-green-500 text-white'
          : status === 'in-progress'
          ? 'bg-yellow-500 text-white'
          : 'bg-gray-400 text-white'
      }`}>
        {completed ? '✓' : number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold">{title}</h4>
        <p className="text-sm mt-1">{description}</p>
      </div>
      <div className="flex-shrink-0">
        <Badge variant="outline" className="capitalize">
          {status}
        </Badge>
      </div>
    </div>
  );
}

export default CoachPostMatchWorkflow;
