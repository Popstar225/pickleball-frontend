import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Users, BarChart3, Settings, FileText, Plus } from 'lucide-react';
import MemberManagement from './StateDashboard/MemberManagement';
import StateTournamentCreationForm from '@/components/tournaments/StateTournamentCreationForm';

export default function StateDashboard() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [showTournamentForm, setShowTournamentForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Estado Dashboard</h1>
        <p className="text-slate-400">
          Gestiona los miembros, visualiza estadísticas y administra la configuración de tu estado.
        </p>
      </div>

      {/* Tabs */}
      <Card className="border-slate-700 bg-slate-900/50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger
              value="tournaments"
              className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Torneos</span>
            </TabsTrigger>
            <TabsTrigger
              value="members"
              className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Miembros</span>
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Estadísticas</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Reportes</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configuración</span>
            </TabsTrigger>
          </TabsList>

          {/* Tournaments Tab */}
          <TabsContent value="tournaments" className="space-y-4 mt-6">
            {!showTournamentForm ? (
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Gestionar Torneos Estatales
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Crea y gestiona torneos a nivel estatal
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[400px] space-y-6 flex flex-col justify-center items-center">
                  <p className="text-slate-400 text-center max-w-md">
                    Tu estado tiene las mismas capacidades que clubes y federaciones para crear y
                    gestionar torneos. Haz clic en el botón de abajo para crear un nuevo torneo
                    estatal.
                  </p>
                  <Button
                    onClick={() => setShowTournamentForm(true)}
                    className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Crear Nuevo Torneo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-700 bg-slate-900/50">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Crear Nuevo Torneo Estatal
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Completa los pasos para crear y configurar tu torneo
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <StateTournamentCreationForm
                    onSuccess={(tournament) => {
                      setShowTournamentForm(false);
                      // Optionally navigate or show success message
                    }}
                    onCancel={() => setShowTournamentForm(false)}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4 mt-6">
            <MemberManagement />
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-4 mt-6">
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Estadísticas</CardTitle>
                <CardDescription className="text-slate-400">
                  Visualiza estadísticas detalladas de tu estado
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[300px] text-center text-slate-400">
                <p>Estadísticas en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4 mt-6">
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Reportes</CardTitle>
                <CardDescription className="text-slate-400">
                  Genera y descarga reportes de tu estado
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[300px] text-center text-slate-400">
                <p>Reportes en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-6">
            <Card className="border-slate-700 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Configuración</CardTitle>
                <CardDescription className="text-slate-400">
                  Personaliza la configuración de tu estado
                </CardDescription>
              </CardHeader>
              <CardContent className="min-h-[300px] text-center text-slate-400">
                <p>Configuración en desarrollo...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
