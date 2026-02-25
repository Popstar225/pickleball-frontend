import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  User,
  MapPin,
  Mail,
  Phone,
  Edit,
  Trash2,
  Building,
  Users,
  Trophy,
  Calendar,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppDispatch, RootState } from '@/store';
import {
  fetchStateProfile,
  updateStateProfile,
  deleteStateAccount,
} from '@/store/slices/stateDashboardSlice';

export default function StateAccountPage() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const { profile, profileLoading, profileError } = useSelector(
    (state: RootState) => state.stateDashboard,
  );

  useEffect(() => {
    dispatch(fetchStateProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await dispatch(
        updateStateProfile({
          coordinatorName: formData.coordinatorName,
          email: formData.email,
          phone: formData.phone,
          description: formData.description,
        }),
      ).unwrap();
      setIsEditing(false);
      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios han sido guardados exitosamente.',
      });
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.toString?.() || 'No se pudo actualizar el perfil';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteStateAccount('confirmation_token')).unwrap();
      toast({
        title: 'Cuenta eliminada',
        description: 'Tu cuenta ha sido eliminada permanentemente.',
        variant: 'destructive',
      });
      // Redirect to login
      window.location.href = '/login';
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString?.() || 'No se pudo eliminar la cuenta';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  return (
    <div className="space-y-6">
      {profileError && (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-red-900/20 border border-red-800">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-white font-semibold">Error al cargar el perfil</h3>
            <p className="text-slate-400">{profileError}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Cuenta Estatal</h1>
          <p className="text-slate-400 mt-1">Administra la información de tu delegación estatal</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            disabled={profileLoading}
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            {profileLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Cargando...
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancelar' : 'Editar Perfil'}
              </>
            )}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={profileLoading}>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Cuenta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-900 border-slate-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">¿Eliminar cuenta?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  Esta acción no se puede deshacer. Se eliminará permanentemente la cuenta de la
                  delegación estatal y todos los datos asociados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-slate-700 text-white hover:bg-slate-800">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={profileLoading}
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {profileLoading && !formData ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <Loader className="h-8 w-8 text-primary animate-spin" />
              <span className="ml-3 text-white">Cargando perfil...</span>
            </div>
          </CardContent>
        </Card>
      ) : formData ? (
        <>
          {/* State Information */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información de la Delegación
              </CardTitle>
              <CardDescription className="text-slate-400">
                Datos generales de la delegación estatal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="stateName" className="text-white">
                    Nombre del Estado
                  </Label>
                  <Input
                    id="stateName"
                    value={formData.stateName || ''}
                    disabled
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coordinatorName" className="text-white">
                    Nombre del Coordinador
                  </Label>
                  <Input
                    id="coordinatorName"
                    value={formData.coordinatorName || ''}
                    onChange={(e) => setFormData({ ...formData, coordinatorName: e.target.value })}
                    disabled={!isEditing}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">
                    Dirección
                  </Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    disabled
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-white">
                    Sitio Web
                  </Label>
                  <Input
                    id="website"
                    value={formData.website || ''}
                    disabled
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundationDate" className="text-white">
                    Fecha de Fundación
                  </Label>
                  <Input
                    id="foundationDate"
                    type="date"
                    value={formData.foundationDate || ''}
                    disabled
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!isEditing}
                  className="bg-slate-800 border-slate-700 text-white"
                  rows={3}
                />
              </div>
              {isEditing && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={profileLoading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {profileLoading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Cambios'
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-slate-700 text-white hover:bg-slate-800"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* State Statistics */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building className="h-5 w-5" />
                Estadísticas de la Delegación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-slate-400">Miembros Totales</Label>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-white font-bold text-xl">
                      {formData.totalMembers?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Clubes Activos</Label>
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-green-500" />
                    <span className="text-white font-bold text-xl">
                      {formData.activeClubs || 0}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Torneos Este Año</Label>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="text-white font-bold text-xl">28</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Estado</Label>
                  <Badge className="bg-green-600 hover:bg-green-700 text-lg px-4 py-2">
                    Activa
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Actividad Reciente
              </CardTitle>
              <CardDescription className="text-slate-400">
                Últimas actividades y eventos en el estado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50">
                  <div className="p-2 rounded-full bg-blue-600/20">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Nuevo Club Afiliado</h4>
                    <p className="text-sm text-slate-400">
                      Club Pickleball Toluca se unió a la federación
                    </p>
                    <p className="text-xs text-slate-500">Hace 2 días</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50">
                  <div className="p-2 rounded-full bg-yellow-600/20">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Torneo Completado</h4>
                    <p className="text-sm text-slate-400">
                      Torneo Estatal Juvenil finalizado con 156 participantes
                    </p>
                    <p className="text-xs text-slate-500">Hace 5 días</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50">
                  <div className="p-2 rounded-full bg-green-600/20">
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-white">Récord de Membresía</h4>
                    <p className="text-sm text-slate-400">
                      Se alcanzó la meta de 1200 miembros activos
                    </p>
                    <p className="text-xs text-slate-500">Hace 1 semana</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Card className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-700">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-600/20">
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Información Importante</h3>
                  <p className="text-slate-400 mt-1">
                    Como delegación estatal, eres responsable de coordinar todas las actividades de
                    pickleball en tu estado. Mantén actualizada tu información y coordina con la
                    federación nacional para eventos y torneos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
