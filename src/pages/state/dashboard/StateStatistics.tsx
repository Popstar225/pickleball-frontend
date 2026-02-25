import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function StateStatistics() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Estadísticas</h1>
        <p className="text-slate-400">
          Visualiza estadísticas detalladas y análisis de desempeño de tu estado.
        </p>
      </div>

      {/* Placeholder Content */}
      <Card className="border-slate-700 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Estadísticas en Desarrollo</CardTitle>
          <CardDescription className="text-slate-400">
            Esta sección está siendo desarrollada actualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] flex items-center justify-center text-slate-400">
          <p>Los gráficos y estadísticas estarán disponibles pronto...</p>
        </CardContent>
      </Card>
    </div>
  );
}
