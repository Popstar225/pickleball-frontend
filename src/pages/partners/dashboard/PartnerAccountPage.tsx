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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  User,
  Building,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Plus,
  Handshake,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppDispatch, RootState } from '@/store';
import {
  fetchPartnerProfile,
  updatePartnerProfile,
  deletePartnerAccount,
} from '@/store/slices/partnerDashboardSlice';

export default function PartnerAccountPage() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingSponsorship, setIsAddingSponsorship] = useState(false);
  const [formData, setFormData] = useState<any>(null);

  const { profile, profileLoading, profileError } = useSelector(
    (state: RootState) => state.partnerDashboard,
  );

  const [sponsorships, setSponsorships] = useState([
    {
      id: 1,
      name: 'Torneo Nacional Pickleball 2024',
      type: 'Tournament',
      amount: 50000,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      description: 'Patrocinio principal del torneo nacional',
    },
    {
      id: 2,
      name: 'Programa de Desarrollo Juvenil',
      type: 'Program',
      amount: 75000,
      startDate: '2024-03-01',
      endDate: '2024-12-31',
      status: 'active',
      description: 'Apoyo al desarrollo de jóvenes talentos',
    },
    {
      id: 3,
      name: 'Equipamiento para Clubes',
      type: 'Equipment',
      amount: 25000,
      startDate: '2024-04-01',
      endDate: '2024-12-31',
      status: 'pending',
      description: 'Donación de equipamiento a clubes afiliados',
    },
  ]);

  const [newSponsorship, setNewSponsorship] = useState({
    name: '',
    type: '',
    amount: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  useEffect(() => {
    dispatch(fetchPartnerProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || '',
        contactName: profile.contactName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        industry: profile.industry || '',
        description: profile.description || '',
        sponsorshipLevel: profile.sponsorshipLevel || '',
        sponsorshipAmount: profile.sponsorshipAmount || 0,
        sponsorshipStartDate: profile.sponsorshipStartDate || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    try {
      await dispatch(
        updatePartnerProfile({
          companyName: formData.companyName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          industry: formData.industry,
          description: formData.description,
          sponsorshipLevel: formData.sponsorshipLevel,
          sponsorshipAmount: formData.sponsorshipAmount,
          sponsorshipStartDate: formData.sponsorshipStartDate,
        }),
      ).unwrap();
      setIsEditing(false);
      toast({
        title: 'Perfil actualizado',
        description: 'Los cambios han sido guardados exitosamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deletePartnerAccount('confirm-delete')).unwrap();
      toast({
        title: 'Cuenta eliminada',
        description: 'Tu cuenta ha sido eliminada permanentemente.',
        variant: 'destructive',
      });
      // Redirect to login
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo eliminar la cuenta',
        variant: 'destructive',
      });
    }
  };

  const handleAddSponsorship = () => {
    if (!newSponsorship.name || !newSponsorship.type || !newSponsorship.amount) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos.',
        variant: 'destructive',
      });
      return;
    }

    const sponsorship = {
      id: sponsorships.length + 1,
      ...newSponsorship,
      amount: parseFloat(newSponsorship.amount),
      status: 'pending',
    };

    setSponsorships([...sponsorships, sponsorship]);
    setNewSponsorship({
      name: '',
      type: '',
      amount: '',
      startDate: '',
      endDate: '',
      description: '',
    });
    setIsAddingSponsorship(false);

    toast({
      title: 'Patrocinio agregado',
      description: 'El nuevo patrocinio ha sido registrado.',
    });
  };

  const handleDeleteSponsorship = (id: number) => {
    setSponsorships(sponsorships.filter((s) => s.id !== id));
    toast({
      title: 'Patrocinio eliminado',
      description: 'El patrocinio ha sido eliminado.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Cuenta</h1>
          <p className="text-slate-400 mt-1">Administra tu perfil y patrocinios</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            disabled={profileLoading}
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar Perfil'}
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
                  Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todos
                  los datos asociados, incluyendo patrocinios activos.
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
        <div className="flex justify-center items-center h-96">
          <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : profileError && !formData ? (
        <Card className="bg-red-950 border-red-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-200 font-medium">Error al cargar el perfil</p>
                <p className="text-red-300 text-sm">{profileError}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : formData ? (
        <>
          {/* Profile Information */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Perfil
              </CardTitle>
              <CardDescription className="text-slate-400">
                Datos de tu empresa y contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-white">
                    Nombre de la Empresa
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    disabled={!isEditing || profileLoading}
                    className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName" className="text-white">
                    Nombre del Contacto
                  </Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    disabled={!isEditing || profileLoading}
                    className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing || profileLoading}
                    className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing || profileLoading}
                    className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white">
                    Dirección
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing || profileLoading}
                    className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-white">
                    Sitio Web
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    disabled={!isEditing || profileLoading}
                    className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Descripción de la Empresa
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={!isEditing || profileLoading}
                  className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
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
                      <>Guardar Cambios</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-slate-700 text-white hover:bg-slate-800"
                    disabled={profileLoading}
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partnership Status */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Handshake className="h-5 w-5" />
                Estado del Partnership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-slate-400">Nivel</Label>
                  <Badge className="bg-yellow-600 hover:bg-yellow-700 text-lg px-4 py-2">
                    {formData.partnershipLevel || 'N/A'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Fecha de Inicio</Label>
                  <p className="text-white font-medium">
                    {formData.partnershipStartDate
                      ? new Date(formData.partnershipStartDate).toLocaleDateString('es-MX')
                      : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Próxima Renovación</Label>
                  <p className="text-white font-medium">
                    {formData.nextRenewalDate
                      ? new Date(formData.nextRenewalDate).toLocaleDateString('es-MX')
                      : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-400">Inversión Total</Label>
                  <p className="text-white font-medium">
                    ${formData.totalInvestment ? formData.totalInvestment.toLocaleString() : '0'}{' '}
                    MXN
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sponsorships Management */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Patrocinios
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Gestiona tus patrocinios y colaboraciones
                  </CardDescription>
                </div>
                <Dialog open={isAddingSponsorship} onOpenChange={setIsAddingSponsorship}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Patrocinio
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-800 max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-white">Agregar Nuevo Patrocinio</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Completa los detalles del nuevo patrocinio
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-white">Nombre del Patrocinio</Label>
                        <Input
                          value={newSponsorship.name}
                          onChange={(e) =>
                            setNewSponsorship({ ...newSponsorship, name: e.target.value })
                          }
                          className="bg-slate-800 border-slate-700 text-white"
                          placeholder="Ej: Torneo Nacional 2024"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Tipo</Label>
                        <Select
                          value={newSponsorship.type}
                          onValueChange={(value) =>
                            setNewSponsorship({ ...newSponsorship, type: value })
                          }
                        >
                          <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-800 border-slate-700">
                            <SelectItem value="Tournament">Torneo</SelectItem>
                            <SelectItem value="Program">Programa</SelectItem>
                            <SelectItem value="Equipment">Equipamiento</SelectItem>
                            <SelectItem value="Event">Evento</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Monto (MXN)</Label>
                        <Input
                          type="number"
                          value={newSponsorship.amount}
                          onChange={(e) =>
                            setNewSponsorship({ ...newSponsorship, amount: e.target.value })
                          }
                          className="bg-slate-800 border-slate-700 text-white"
                          placeholder="50000"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label className="text-white">Fecha Inicio</Label>
                          <Input
                            type="date"
                            value={newSponsorship.startDate}
                            onChange={(e) =>
                              setNewSponsorship({
                                ...newSponsorship,
                                startDate: e.target.value,
                              })
                            }
                            className="bg-slate-800 border-slate-700 text-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Fecha Fin</Label>
                          <Input
                            type="date"
                            value={newSponsorship.endDate}
                            onChange={(e) =>
                              setNewSponsorship({ ...newSponsorship, endDate: e.target.value })
                            }
                            className="bg-slate-800 border-slate-700 text-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white">Descripción</Label>
                        <Textarea
                          value={newSponsorship.description}
                          onChange={(e) =>
                            setNewSponsorship({
                              ...newSponsorship,
                              description: e.target.value,
                            })
                          }
                          className="bg-slate-800 border-slate-700 text-white"
                          rows={3}
                          placeholder="Describe el patrocinio..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingSponsorship(false)}
                        className="border-slate-700 text-white hover:bg-slate-800"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleAddSponsorship}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Agregar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Nombre</TableHead>
                    <TableHead className="text-slate-400">Tipo</TableHead>
                    <TableHead className="text-slate-400">Monto</TableHead>
                    <TableHead className="text-slate-400">Estado</TableHead>
                    <TableHead className="text-slate-400">Periodo</TableHead>
                    <TableHead className="text-slate-400">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sponsorships.map((sponsorship) => (
                    <TableRow key={sponsorship.id} className="border-slate-700">
                      <TableCell className="text-white">
                        <div>
                          <p className="font-medium">{sponsorship.name}</p>
                          <p className="text-sm text-slate-400">{sponsorship.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">{sponsorship.type}</TableCell>
                      <TableCell className="text-white">
                        ${sponsorship.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={sponsorship.status === 'active' ? 'default' : 'secondary'}
                          className={
                            sponsorship.status === 'active'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-yellow-600 hover:bg-yellow-700'
                          }
                        >
                          {sponsorship.status === 'active' ? 'Activo' : 'Pendiente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {new Date(sponsorship.startDate).toLocaleDateString('es-MX')} -{' '}
                        {new Date(sponsorship.endDate).toLocaleDateString('es-MX')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSponsorship(sponsorship.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
