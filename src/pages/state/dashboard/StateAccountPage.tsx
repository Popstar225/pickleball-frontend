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
import { Mail, Phone, Edit, Trash2, AlertCircle, Loader, Save, X } from 'lucide-react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [deletionConfirmed, setDeletionConfirmed] = useState(false);
  const [formData, setFormData] = useState<any>({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    bio: '',
  });

  const { profile, profileLoading, profileError } = useSelector(
    (state: RootState) => state.stateDashboard,
  );
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchStateProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.coordinatorName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        website: profile.website || '',
        bio: profile.description || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!formData.full_name || !formData.email) {
      toast({
        title: 'Error',
        description: 'El nombre y correo son requeridos',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await dispatch(updateStateProfile(formData)).unwrap();
      setIsEditing(false);
      // Refresh profile after update
      dispatch(fetchStateProfile());
      toast({
        title: 'Éxito',
        description: 'El perfil se ha actualizado correctamente',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletionConfirmed) {
      toast({
        title: 'Confirmación requerida',
        description: 'Debes confirmar que deseas eliminar la cuenta',
      });
      return;
    }

    try {
      await dispatch(deleteStateAccount()).unwrap();
      toast({
        title: 'Cuenta eliminada',
        description: 'Tu cuenta ha sido eliminada definitivamente',
      });
      // Redirect to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo eliminar la cuenta',
        variant: 'destructive',
      });
    }
  };

  if (profileLoading && !profile) {
    return (
      <div className="space-y-6 p-1">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-[#ace600] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración de Cuenta</h1>
        <p className="text-sm text-white/35 mt-1">
          Gestiona la información de la delegación estatal
        </p>
      </div>

      {profileError && (
        <div className="flex gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{profileError}</p>
        </div>
      )}

      {/* Profile Card */}
      <Card className="bg-[#0d1117] border-white/[0.07]">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-white">Información de la Delegación</CardTitle>
            <CardDescription>Detalles principales de tu delegación estatal</CardDescription>
          </div>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="gap-2 bg-[#ace600] hover:bg-[#c0f000] text-black"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-xs font-bold uppercase tracking-wider">
                    Nombre del Coordinador
                  </Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="mt-2 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20"
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-xs font-bold uppercase tracking-wider">
                    Correo
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-2 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-xs font-bold uppercase tracking-wider">
                    Teléfono
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20"
                    placeholder="+52 (555) 555-5555"
                  />
                </div>
                <div>
                  <Label className="text-white/70 text-xs font-bold uppercase tracking-wider">
                    Sitio Web
                  </Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="mt-2 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <Label className="text-white/70 text-xs font-bold uppercase tracking-wider">
                  Dirección
                </Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-2 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20"
                  placeholder="Dirección completa"
                />
              </div>

              <div>
                <Label className="text-white/70 text-xs font-bold uppercase tracking-wider">
                  Descripción
                </Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="mt-2 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 min-h-24"
                  placeholder="Descripción de la delegación estatal"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="gap-2 bg-[#ace600] hover:bg-[#c0f000] text-black"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  className="gap-2 border-white/[0.08]"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                    Coordinador
                  </p>
                  <p className="text-sm text-white/75 font-medium">
                    {profile?.coordinatorName || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                    Estado
                  </p>
                  <Badge className="bg-[#ace600]/10 text-[#ace600] border-[#ace600]/20">
                    {profile?.stateName || user?.state || '—'}
                  </Badge>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                    Correo
                  </p>
                  <p className="text-sm text-white/75 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-white/30" />
                    {profile?.email || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                    Teléfono
                  </p>
                  <p className="text-sm text-white/75 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-white/30" />
                    {profile?.phone || '—'}
                  </p>
                </div>
              </div>

              {profile?.address && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                    Dirección
                  </p>
                  <p className="text-sm text-white/60">{profile.address}</p>
                </div>
              )}

              {profile?.website && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                    Sitio Web
                  </p>
                  <p className="text-sm text-white/60">
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ace600] hover:underline"
                    >
                      {profile.website}
                    </a>
                  </p>
                </div>
              )}

              {profile?.description && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                    Descripción
                  </p>
                  <p className="text-sm text-white/60">{profile.description}</p>
                </div>
              )}

              {profile?.foundationDate && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                    Miembro desde
                  </p>
                  <p className="text-sm text-white/60">
                    {new Date(profile.foundationDate).toLocaleDateString('es-MX')}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.07]">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                    Miembros Activos
                  </p>
                  <p className="text-lg font-bold text-[#ace600]">{profile?.totalMembers || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">
                    Clubes Activos
                  </p>
                  <p className="text-lg font-bold text-[#ace600]">{profile?.activeClubs || 0}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/20 bg-red-500/[0.02]">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Zona de Peligro
          </CardTitle>
          <CardDescription>Acciones irreversibles</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="w-4 h-4" />
                Eliminar Cuenta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#0d1117] border-red-500/20">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-400">
                  ¿Eliminar cuenta permanentemente?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-white/50">
                  Esta acción no puede deshacerse. Se eliminarán todos los datos asociados a esta
                  delegación estatal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="confirm"
                    checked={deletionConfirmed}
                    onChange={(e) => setDeletionConfirmed(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="confirm" className="text-sm text-white/60 cursor-pointer">
                    Confirmo que deseo eliminar esta cuenta
                  </label>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/[0.04] border-white/[0.08]">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={!deletionConfirmed}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Eliminar Cuenta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
