import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, TrendingUp, PieChart, Activity, Zap } from 'lucide-react';

const UPCOMING = [
  { icon: BarChart3,   label: 'Torneos por Mes',       desc: 'Actividad histórica de torneos en el estado' },
  { icon: TrendingUp,  label: 'Crecimiento de Jugadores', desc: 'Evolución de registros y jugadores activos' },
  { icon: PieChart,    label: 'Distribución por Nivel',  desc: 'Segmentación por categoría y habilidad' },
  { icon: Activity,    label: 'Rendimiento de Clubes',   desc: 'Comparativa de actividad entre clubes' },
];

export default function StateStatistics() {
  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Estadísticas</h1>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border-amber-500/20 text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            En Desarrollo
          </span>
        </div>
        <p className="text-xs text-white/25">
          Visualiza estadísticas detalladas y análisis de desempeño de tu estado
        </p>
      </div>

      {/* ── Main placeholder card ────────────────────────────────────────────── */}
      <Card className="bg-[#0d1117] border-white/[0.07] rounded-2xl overflow-hidden p-0">
        <div className="h-0.5 bg-gradient-to-r from-transparent via-[#ace600]/40 to-transparent" />
        <CardContent className="flex flex-col items-center justify-center py-16 px-6 gap-5">

          {/* Animated icon cluster */}
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-2xl bg-[#ace600]/10 border border-[#ace600]/20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-[#ace600]/60" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#ace600]/30 border border-[#ace600]/40" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 rounded-full bg-[#ace600]/20 border border-[#ace600]/30" />
          </div>

          <div className="text-center space-y-1.5 max-w-xs">
            <p className="text-base font-bold text-white/60">Estadísticas en Desarrollo</p>
            <p className="text-xs text-white/25 leading-relaxed">
              Los gráficos y análisis de desempeño estarán disponibles pronto. Estamos trabajando
              para ofrecerte información detallada de tu estado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#ace600]/50" />
            <span className="text-[11px] font-semibold text-[#ace600]/50">Próximamente disponible</span>
          </div>

        </CardContent>
      </Card>

      {/* ── Upcoming features grid ───────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-3">
          Lo que encontrarás aquí
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {UPCOMING.map(({ icon: Icon, label, desc }) => (
            <Card key={label} className="bg-[#0d1117] border-white/[0.07] rounded-2xl opacity-60">
              <CardContent className="flex items-start gap-3.5 p-4">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-white/25" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white/50 mb-0.5">{label}</p>
                  <p className="text-[11px] text-white/25 leading-relaxed">{desc}</p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400/40 shrink-0 mt-1.5" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}