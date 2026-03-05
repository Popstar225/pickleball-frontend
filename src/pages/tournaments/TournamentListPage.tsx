import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MapPin, Users, Trophy, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StateAutocomplete } from '@/components/ui/StateAutocomplete';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types/api';

interface Tournament {
  id: string;
  name: string;
  description: string;
  location: string;
  state_id: string;
  start_date: string;
  end_date: string;
  tournament_level: string;
  age_restrictions: string | null;
  gender_restrictions: string | null;
  current_events: number;
  registrations_open: boolean;
  image_url?: string;
}

const TournamentListPage: React.FC = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await api.get<ApiResponse<Tournament[]>>('/tournaments');
        let data = response.data as any;
        // Handle nested response structure
        if (data?.data) {
          data = Array.isArray(data.data) ? data.data : [data.data];
        }
        const tourData = Array.isArray(data) ? data : [];
        setTournaments(tourData);
        setFilteredTournaments(tourData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  useEffect(() => {
    let filtered = tournaments;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.location.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by level
    if (filterLevel !== 'all') {
      filtered = filtered.filter((t) => t.tournament_level === filterLevel);
    }

    // Filter by state
    if (filterState) {
      filtered = filtered.filter((t) => t.state_id === filterState);
    }

    setFilteredTournaments(filtered);
  }, [searchTerm, filterLevel, filterState, tournaments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-bounce" />
          <p className="text-gray-600">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
              <p className="text-gray-600 mt-2">
                Browse and register for upcoming pickleball tournaments
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search tournaments by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tournament Level
                </label>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <StateAutocomplete
                  value={filterState}
                  onChange={setFilterState}
                  placeholder="Select state..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Grid */}
        {filteredTournaments.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No tournaments found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                {tournament.image_url && (
                  <img
                    src={tournament.image_url}
                    alt={tournament.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{tournament.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{tournament.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{tournament.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Trophy className="w-4 h-4" />
                      <span className="text-sm font-medium">{tournament.tournament_level}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{tournament.current_events} events</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {tournament.age_restrictions && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Age: {tournament.age_restrictions}
                      </span>
                    )}
                    {tournament.gender_restrictions && (
                      <span className="text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded">
                        {tournament.gender_restrictions}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => navigate(`/tournaments/${tournament.id}`)}
                    className="w-full"
                    disabled={!tournament.registrations_open}
                  >
                    {tournament.registrations_open ? 'View Details' : 'Registrations Closed'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentListPage;
