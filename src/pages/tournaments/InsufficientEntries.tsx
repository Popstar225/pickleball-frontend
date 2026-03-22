import InsufficientEntriesModal from '@/components/tournament/InsufficientEntriesModal';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function InsufficientEntries() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string>('');

  const mockEventsWithShortfall = [
    {
      id: 'event-1',
      name: '4.5 Singles',
      current: 6,
      minimum: 8,
      capacity: 32,
      format: 'Single Elimination',
    },
    {
      id: 'event-2',
      name: '2.5 Doubles',
      current: 5,
      minimum: 6,
      capacity: 24,
      format: 'Round Robin',
    },
  ];

  const handleAction = (
    eventId: string,
    action: 'cancel' | 'change-format' | 'merge',
    details?: any,
  ) => {
    console.log('Action:', { eventId, action, details });
    setSelectedAction(`${action} - Event ${eventId}`);
    // Don't close modal immediately so user can see the action was recorded
  };

  const handleClose = () => {
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
          Volver a Todos los Demos
        </button>

        <div>
          <h1 className="text-3xl font-bold text-white">Modal de Inscripciones Insuficientes</h1>
          <p className="text-white/40 mt-2">Maneja eventos con un recuento de inscripciones por debajo del mínimo</p>
        </div>

        {/* State Info */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-2">
          <p className="text-sm text-white/70">
            Estado del Modal:{' '}
            <span className={isOpen ? 'text-blue-400' : 'text-white/50'}>
              {isOpen ? 'Abierto' : 'Cerrado'}
            </span>
          </p>
          {selectedAction && (
            <p className="text-sm text-[#ace600]">
              Última Acción: <span className="font-mono">{selectedAction}</span>
            </p>
          )}
          {!isOpen && (
            <button
              onClick={() => {
                setIsOpen(true);
                setSelectedAction('');
              }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Reabrir Modal
            </button>
          )}
        </div>

        {/* Modal Component */}
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <InsufficientEntriesModal
              open={isOpen}
              events={mockEventsWithShortfall}
              onAction={handleAction}
              onClose={handleClose}
            />
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Características del Componente</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Selección de pestañas para múltiples eventos con inscripciones insuficientes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">
                Muestra las inscripciones actuales y el requisito mínimo
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Muestra el cálculo del déficit</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Tres opciones de acción:</span>
            </li>
            <li className="flex gap-6 ml-6">
              <div className="text-white/70">
                <span className="font-semibold">1. Cancelar Evento</span> - Devolver todas las inscripciones
              </div>
            </li>
            <li className="flex gap-6 ml-6">
              <div className="text-white/70">
                <span className="font-semibold">2. Cambiar Formato</span> - Cambiar modalidad con validación
              </div>
            </li>
            <li className="flex gap-6 ml-6">
              <div className="text-white/70">
                <span className="font-semibold">3. Fusionar Eventos</span> - Combinar con nivel de habilidad similar
              </div>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">
                Las opciones de formato incluyen validación del número mínimo de jugadores
              </span>
            </li>
          </ul>
        </div>

        {/* Test Scenario */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Vamos Allá</h3>
          <ol className="space-y-3 text-sm text-white/70">
            <li>
              <span className="font-semibold text-white">1. Switch Tabs</span> — Click the tabs to
              see different events needing attention
            </li>
            <li>
              <span className="font-semibold text-white">2. Try Cancel Event</span> — See the
              confirmation message
            </li>
            <li>
              <span className="font-semibold text-white">3. Try Change Format</span> — Select a new
              format with validation
            </li>
            <li>
              <span className="font-semibold text-white">4. Try Merge Events</span> — Choose which
              event to merge with
            </li>
            <li>
              <span className="font-semibold text-white">5. Use Reopen</span> — Reset and test again
            </li>
          </ol>
        </div>

        {/* Mock Data Info */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Demo Data</h3>
          <div className="space-y-3 text-sm text-white/70 font-mono">
            {mockEventsWithShortfall.map((event) => (
              <div key={event.id} className="flex justify-between">
                <span>{event.name}</span>
                <span>
                  {event.current}/{event.minimum} entries (need {event.minimum - event.current}{' '}
                  more)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
