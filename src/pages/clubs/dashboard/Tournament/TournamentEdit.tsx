import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AppDispatch, RootState } from '@/store';
import { fetchTournament, updateTournamentDetails } from '@/store/slices/tournamentsSlice';
import type { Tournament, CreateTournamentRequest } from '@/types/api';

interface TournamentEditProps {
  tournamentId: string;
}

const TournamentEdit: React.FC<TournamentEditProps> = ({ tournamentId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { currentTournament, loading } = useSelector((state: RootState) => state.tournaments);
  const { user } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState<CreateTournamentRequest | null>(null);

  useEffect(() => {
    if (tournamentId) dispatch(fetchTournament(tournamentId));
  }, [tournamentId, dispatch]);

  useEffect(() => {
    if (currentTournament) {
      setForm({
        name: currentTournament.name,
        tournament_type: currentTournament.tournament_type,
        category: currentTournament.category,
        description: currentTournament.description || '',
        organizer_type: currentTournament.organizer_type,
        venue_name: currentTournament.venue_name,
        venue_address: currentTournament.venue_address || '',
        state: currentTournament.state,
        city: currentTournament.city,
        latitude: currentTournament.latitude,
        longitude: currentTournament.longitude,
        start_date: currentTournament.start_date,
        end_date: currentTournament.end_date,
        registration_deadline: currentTournament.registration_deadline,
        entry_fee: currentTournament.entry_fee || 0,
        max_participants: currentTournament.max_participants || 64,
        max_teams: currentTournament.max_teams || 0,
        skill_levels: currentTournament.skill_levels || [],
        age_categories: currentTournament.age_categories || [],
        gender_categories: currentTournament.gender_categories || [],
        tournament_format: currentTournament.tournament_format || '',
        points_to_win: currentTournament.points_to_win || 0,
        win_by: currentTournament.win_by || 0,
        rules: currentTournament.rules || '',
        contact_email: currentTournament.contact_email || '',
        contact_phone: currentTournament.contact_phone || '',
      } as CreateTournamentRequest);
    }
  }, [currentTournament]);

  const canEdit = (t: Tournament | null) => {
    if (!t || !user) return false;
    if (user.user_type === 'admin') return true;
    if (user.user_type === 'state')
      return t.organizer_type === 'state' || t.tournament_type === 'local';
    if (user.user_type === 'club') return t.organizer_type === 'club';
    return false;
  };

  const handleSubmit = async () => {
    if (!form || !currentTournament) return;
    try {
      const updates = { ...form } as any;
      await dispatch(updateTournamentDetails({ id: currentTournament.id, updates })).unwrap();
      navigate(`/tournaments/${currentTournament.id}`);
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  if (loading || !form) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6">
      <Card className="bg-[#111827] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Edit Tournament</CardTitle>
          <CardDescription className="text-gray-400">
            Modify tournament information and save changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-[#111827] text-white"
              />
            </div>

            <div>
              <Label htmlFor="tournament_type">Type</Label>
              <Select
                value={form.tournament_type}
                onValueChange={(v: any) => setForm({ ...form, tournament_type: v })}
              >
                <SelectTrigger className="bg-[#111827] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111827]">
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="bg-[#111827] text-white"
              />
            </div>

            <div>
              <Label htmlFor="venue_name">Venue</Label>
              <Input
                id="venue_name"
                value={form.venue_name}
                onChange={(e) => setForm({ ...form, venue_name: e.target.value })}
                className="bg-[#111827] text-white"
              />
            </div>

            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="bg-[#111827] text-white"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button className="bg-[#ace600] text-black" onClick={handleSubmit}>
              Save Changes
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentEdit;
