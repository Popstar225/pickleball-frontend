import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, MapPin, Calendar, Settings, Trash2 } from 'lucide-react';
import { AppDispatch, RootState } from '@/store';
import { fetchTournament, deleteTournament } from '@/store/slices/tournamentsSlice';
import type { Tournament } from '@/types/api';

interface TournamentDetailsProps {
  tournamentId: string;
}

const TournamentDetails: React.FC<TournamentDetailsProps> = ({ tournamentId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentTournament, loading, error } = useSelector(
    (state: RootState) => state.tournaments,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (tournamentId) dispatch(fetchTournament(tournamentId));
  }, [tournamentId, dispatch]);

  const canManage = (t: Tournament | null) => {
    if (!t || !user) return false;
    if (user.user_type === 'admin') return true;
    if (user.user_type === 'state')
      return t.organizer_type === 'state' || t.tournament_type === 'local';
    if (user.user_type === 'club') return t.organizer_type === 'club';
    return false;
  };

  const handleDelete = async () => {
    if (!currentTournament) return;
    try {
      await dispatch(deleteTournament(currentTournament.id)).unwrap();
      navigate('/tournaments');
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-gray-400">Loading tournament...</div>
      </div>
    );
  }

  // Some API responses wrap the tournament inside { data: { ... } }
  const tRaw: any = currentTournament || null;
  const t: Tournament | null = tRaw ? (tRaw.data ? tRaw.data : tRaw) : null;

  if (!t) {
    return (
      <div className="p-8">
        <div className="text-gray-400">Tournament not found.</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="bg-[#111827] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">{t.name}</CardTitle>
          <CardDescription className="text-gray-400">
            {t.category} —{' '}
            {t.tournament_type ? (
              t.tournament_type.toUpperCase()
            ) : (
              <span className="text-red-400">Unknown Type</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-400">Status</p>
              <div className="mt-1">
                <Badge className="capitalize">{t.status}</Badge>
              </div>

              <p className="text-sm text-gray-400 mt-4">Dates</p>
              <div className="text-white mt-1">
                {new Date(t.start_date).toLocaleDateString()} —{' '}
                {new Date(t.end_date).toLocaleDateString()}
              </div>

              <p className="text-sm text-gray-400 mt-4">Venue</p>
              <div className="text-white mt-1">{t.venue_name}</div>
              <div className="text-gray-400 text-sm">
                {t.city}, {t.state}
              </div>

              <p className="text-sm text-gray-400 mt-4">Participants</p>
              <div className="flex items-center text-white mt-1">
                <Users className="w-4 h-4 mr-2" />
                {t.current_participants || 0} / {t.max_participants}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-400">Contact</p>
              <div className="text-white mt-1">{t.contact_email || '—'}</div>
              <div className="text-gray-400 text-sm">{t.contact_phone || '—'}</div>

              <p className="text-sm text-gray-400 mt-4">Description</p>
              <div className="text-white mt-1 whitespace-pre-wrap">
                {t.description || 'No description provided.'}
              </div>

              <p className="text-sm text-gray-400 mt-4">Rules</p>
              <div className="text-white mt-1 whitespace-pre-wrap">
                {t.rules || 'No rules provided.'}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={() => navigate(`/tournaments/${t.id}/manage`)}
              className="bg-[#ace600] text-black"
            >
              <Settings className="w-4 h-4 mr-2" /> Manage Events
            </Button>
            <Button variant="outline" onClick={() => navigate(`/tournaments/${t.id}/edit`)}>
              Edit
            </Button>
            {canManage(t) && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentDetails;
