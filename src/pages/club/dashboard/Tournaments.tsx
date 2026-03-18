import React, { useState } from 'react';
import { toast } from 'sonner';

interface Tournament {
  id: number;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  maxParticipants: number;
  entryFee: number;
  totalRevenue: number;
  expenses: number;
  profit: number;
  status: string;
  description: string;
  location: string;
  tournamentType: 'singles' | 'doubles' | 'mixed';
  skillLevel: string;
  prizes: string;
  rules: string;
}

interface TournamentsProps {
  tournaments: Tournament[] | null;
}

const Tournaments: React.FC<TournamentsProps> = ({ tournaments: initialTournaments }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments || []);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);

  const [newTournament, setNewTournament] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    maxParticipants: 32,
    entryFee: 50,
    description: '',
    location: '',
    tournamentType: 'doubles' as 'singles' | 'doubles' | 'mixed',
    skillLevel: 'all',
    prizes: '',
    rules: ''
  });

  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: 0
  });

  const handleCreateTournament = () => {
    if (!newTournament.name || !newTournament.date || !newTournament.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    const tournament: Tournament = {
      id: Date.now(),
      ...newTournament,
      participants: 0,
      totalRevenue: 0,
      expenses: 0,
      profit: 0,
      status: 'Registration Open'
    };

    setTournaments([...tournaments, tournament]);
    setShowCreateForm(false);
    setNewTournament({
      name: '', date: '', startTime: '', endTime: '', maxParticipants: 32,
      entryFee: 50, description: '', location: '', tournamentType: 'doubles',
      skillLevel: 'all', prizes: '', rules: ''
    });
    toast.success('Tournament created successfully!');
  };

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setNewTournament({
      name: tournament.name,
      date: tournament.date,
      startTime: tournament.startTime,
      endTime: tournament.endTime,
      maxParticipants: tournament.maxParticipants,
      entryFee: tournament.entryFee,
      description: tournament.description,
      location: tournament.location,
      tournamentType: tournament.tournamentType,
      skillLevel: tournament.skillLevel,
      prizes: tournament.prizes,
      rules: tournament.rules
    });
    setShowCreateForm(true);
  };

  const handleUpdateTournament = () => {
    if (!editingTournament) return;

    const updatedTournaments = tournaments.map(t => 
      t.id === editingTournament.id 
        ? { ...t, ...newTournament }
        : t
    );

    setTournaments(updatedTournaments);
    setShowCreateForm(false);
    setEditingTournament(null);
    setNewTournament({
      name: '', date: '', startTime: '', endTime: '', maxParticipants: 32,
      entryFee: 50, description: '', location: '', tournamentType: 'doubles',
      skillLevel: 'all', prizes: '', rules: ''
    });
    toast.success('Tournament updated successfully!');
  };

  const handleAddExpense = () => {
    if (!selectedTournament || !expenseData.description || expenseData.amount <= 0) {
      toast.error('Please fill in expense details');
      return;
    }

    const updatedTournaments = tournaments.map(t => {
      if (t.id === selectedTournament.id) {
        const newExpenses = t.expenses + expenseData.amount;
        const newProfit = t.totalRevenue - newExpenses;
        return { ...t, expenses: newExpenses, profit: newProfit };
      }
      return t;
    });

    setTournaments(updatedTournaments);
    setShowExpenseModal(false);
    setExpenseData({ description: '', amount: 0 });
    setSelectedTournament(null);
    toast.success('Expense added successfully!');
  };

  const generateReport = (tournament: Tournament) => {
    const report = `
Tournament Report: ${tournament.name}
Date: ${tournament.date}
Participants: ${tournament.participants}/${tournament.maxParticipants}
Entry Fee: $${tournament.entryFee}
Total Revenue: $${tournament.totalRevenue}
Total Expenses: $${tournament.expenses}
Net Profit: $${tournament.profit}
Status: ${tournament.status}
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tournament-${tournament.id}-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Registration Open': return 'bg-green-100 text-green-800';
      case 'Full': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Tournament Management</h2>
        <button 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => setShowCreateForm(true)}
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Tournament
        </button>
      </div>

      {/* Create/Edit Tournament Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingTournament ? 'Edit Tournament' : 'Create New Tournament'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Name *</label>
              <input
                type="text"
                value={newTournament.name}
                onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tournament name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={newTournament.date}
                onChange={(e) => setNewTournament({...newTournament, date: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <input
                type="time"
                value={newTournament.startTime}
                onChange={(e) => setNewTournament({...newTournament, startTime: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={newTournament.endTime}
                onChange={(e) => setNewTournament({...newTournament, endTime: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
              <input
                type="number"
                value={newTournament.maxParticipants}
                onChange={(e) => setNewTournament({...newTournament, maxParticipants: parseInt(e.target.value)})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee ($)</label>
              <input
                type="number"
                value={newTournament.entryFee}
                onChange={(e) => setNewTournament({...newTournament, entryFee: parseInt(e.target.value)})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Type</label>
              <select
                value={newTournament.tournamentType}
                onChange={(e) => setNewTournament({...newTournament, tournamentType: e.target.value as any})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="singles">Singles</option>
                <option value="doubles">Doubles</option>
                <option value="mixed">Mixed Doubles</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
              <select
                value={newTournament.skillLevel}
                onChange={(e) => setNewTournament({...newTournament, skillLevel: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner (2.5-3.0)</option>
                <option value="intermediate">Intermediate (3.5-4.0)</option>
                <option value="advanced">Advanced (4.5+)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={newTournament.location}
                onChange={(e) => setNewTournament({...newTournament, location: e.target.value})}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tournament location"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newTournament.description}
                onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tournament description"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Prizes</label>
              <textarea
                value={newTournament.prizes}
                onChange={(e) => setNewTournament({...newTournament, prizes: e.target.value})}
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe prizes and awards"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rules & Regulations</label>
              <textarea
                value={newTournament.rules}
                onChange={(e) => setNewTournament({...newTournament, rules: e.target.value})}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter tournament rules and regulations"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {
                setShowCreateForm(false);
                setEditingTournament(null);
                setNewTournament({
                  name: '', date: '', startTime: '', endTime: '', maxParticipants: 32,
                  entryFee: 50, description: '', location: '', tournamentType: 'doubles',
                  skillLevel: 'all', prizes: '', rules: ''
                });
              }}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              onClick={editingTournament ? handleUpdateTournament : handleCreateTournament}
            >
              {editingTournament ? 'Update Tournament' : 'Create Tournament'}
            </button>
          </div>
        </div>
      )}

      {/* Tournaments List */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Tournaments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tournament</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Participants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Entry Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Expenses</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tournaments && tournaments.length > 0 ? (
                tournaments.map((tournament) => (
                  <tr key={tournament.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tournament.name}</div>
                        <div className="text-sm text-gray-300">{tournament.tournamentType} • {tournament.skillLevel}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{tournament.date}</div>
                      <div className="text-sm text-gray-300">{tournament.startTime} - {tournament.endTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tournament.participants}/{tournament.maxParticipants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tournament.entryFee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tournament.totalRevenue}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${tournament.expenses}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-bold ${
                        tournament.profit > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${tournament.profit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tournament.status)}`}>
                        {tournament.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                          onClick={() => handleEditTournament(tournament)}
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                          onClick={() => {
                            setSelectedTournament(tournament);
                            setShowExpenseModal(true);
                          }}
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Expense
                        </button>
                        <button
                          className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
                          onClick={() => generateReport(tournament)}
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-4 text-center text-gray-300">
                    No tournaments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && selectedTournament && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Expense for {selectedTournament.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Description</label>
                  <input
                    type="text"
                    value={expenseData.description}
                    onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Equipment rental, prizes, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    value={expenseData.amount}
                    onChange={(e) => setExpenseData({...expenseData, amount: parseFloat(e.target.value) || 0})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowExpenseModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddExpense}
                >
                  Add Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tournaments; 