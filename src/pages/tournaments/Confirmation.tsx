import StartTournamentConfirmationModal from '@/components/tournament/StartTournamentConfirmationModal';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Confirmation() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const mockTournament = {
    id: 'demo-tournament',
    name: 'Spring Pickleball Championship 2026',
    eventCount: 3,
    totalRegistrations: 45,
  };

  const handleConfirm = () => {
    console.log('Tournament start confirmed!');
    setIsOpen(false);
  };

  const handleCancel = () => {
    console.log('Tournament start cancelled');
    setIsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <button
          onClick={() => navigate('/tournaments/start')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to All Demos
        </button>

        <div>
          <h1 className="text-3xl font-bold text-white">Tournament Confirmation Modal</h1>
          <p className="text-white/40 mt-2">Review consequences before starting tournament</p>
        </div>

        {/* State Info */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <p className="text-sm text-white/70">
            Modal Status:{' '}
            <span className={isOpen ? 'text-blue-400' : 'text-white/50'}>
              {isOpen ? 'Open' : 'Closed'}
            </span>
          </p>
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="text-blue-400 hover:text-blue-300 text-sm mt-2"
            >
              Reopen Modal
            </button>
          )}
        </div>

        {/* Modal Component */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <StartTournamentConfirmationModal
              open={isOpen}
              tournamentName={mockTournament.name}
              eventCount={mockTournament.eventCount}
              totalRegistrations={mockTournament.totalRegistrations}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Component Features</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">
                Clear tournament summary (event count, registrations)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Lists key consequences with visual icons</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Warning banner emphasizing irreversibility</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Mandatory checkbox for acknowledgment</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Confirm button disabled until checkbox checked</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Cancel option available</span>
            </li>
          </ul>
        </div>

        {/* Test Scenario */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Try It Out</h3>
          <ol className="space-y-2 text-sm text-white/70">
            <li>1. Read the tournament summary and consequences</li>
            <li>2. Check the acknowledgment checkbox</li>
            <li>3. Click "Start Tournament" to confirm</li>
            <li>4. Use "Reopen Modal" button to test again</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
