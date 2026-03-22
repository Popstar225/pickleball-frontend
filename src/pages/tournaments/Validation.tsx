import TournamentStartValidation from '@/components/tournament/TournamentStartValidation';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Validation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0d1117] p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <button
          onClick={() => navigate('/tournaments/start')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a Todos los Demos
        </button>

        <div>
          <h1 className="text-3xl font-bold text-white">Validación Previa</h1>
          <p className="text-white/40 mt-2">Verifica todos los requisitos del torneo antes de iniciar</p>
        </div>

        {/* Component */}
        <TournamentStartValidation
          tournamentId="demo-tournament"
          onValidationChange={(isValid) => console.log('Validation changed:', isValid)}
          onStartTournament={() => console.log('Start tournament clicked')}
        />

        {/* Info Section */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Características del Componente</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">
                Lista de verificación de validación previa con múltiples controles
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Indicadores de estado: aprobado, fallido, advertencia, pendiente</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Estadísticas resumidas (total, aprobados, advertencias)</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Botón deshabilitado hasta que todos los controles pasen</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ace600]">✓</span>
              <span className="text-white/70">Estado de carga durante la validación</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
