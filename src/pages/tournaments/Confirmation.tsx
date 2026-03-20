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
          Volver
        </button>

        <div>
          <h1 className="text-3xl font-bold text-white">Modal de Confirmación del Torneo</h1>
          <p className="text-white/40 mt-2">Revisa las consecuencias antes de iniciar el torneo</p>
        </div>

        {/* State Info */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <p className="text-sm text-white/70">
            Estado del modal:{' '}
            <span className={isOpen ? 'text-blue-400' : 'text-white/50'}>
              {isOpen ? 'Abierto' : 'Cerrado'}
            </span>
          </p>
          {!isOpen && (
            <button
              onClick={() => setIsOpen(true)}
              className="text-blue-400 hover:text-blue-300 text-sm mt-2"
            >
              Reabrir Modal
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
          <h3 className="text-lg font-bold text-white">Características del Componente</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">
                Resumen claro del torneo (número de eventos e inscripciones)
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Lista las consecuencias clave con íconos visuales</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Banner de advertencia que enfatiza la irreversibilidad</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Casilla de verificación obligatoria para confirmación</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Botón de confirmar deshabilitado hasta marcar la casilla</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Opción de cancelar disponible</span>
            </li>
          </ul>
        </div>

        {/* Test Scenario */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Pruébalo</h3>
          <ol className="space-y-2 text-sm text-white/70">
            <li>1. Lee el resumen del torneo y las consecuencias</li>
            <li>2. Marca la casilla de confirmación</li>
            <li>3. Haz clic en "Iniciar Torneo" para confirmar</li>
            <li>4. Usa el botón "Reabrir Modal" para volver a probar</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
