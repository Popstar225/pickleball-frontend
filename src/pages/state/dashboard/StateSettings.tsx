import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function StateSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Configuración</h1>
        <p className="text-slate-400">Personaliza los ajustes y configuración de tu estado.</p>
      </div>

      {/* Placeholder Content */}
      <Card className="border-slate-700 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Configuración General</CardTitle>
          <CardDescription className="text-slate-400">
            Esta sección está siendo desarrollada actualmente
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] space-y-6">
          <div className="flex items-center justify-center text-slate-400">
            <p>Las opciones de configuración estarán disponibles pronto...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
