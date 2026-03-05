import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { createCourt, updateCourt, deleteCourt } from '@/store/slices/courtsSlice';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X, Loader2, AlertTriangle, DollarSign, MapPin, Users, Trash2 } from 'lucide-react';
import { Court, CreateCourtRequest } from '../../../../types/api';

const COURT_TYPES = {
  indoor: 'Cubierta',
  outdoor: 'Aire Libre',
  covered: 'Techada',
};

const COURT_SURFACES = {
  concrete: 'Concreto',
  asphalt: 'Asfalto',
  synthetic: 'Sintética',
  grass: 'Pasto',
  clay: 'Arcilla',
};

interface CourtActionModalProps {
  isOpen: boolean;
  court: Court | null;
  mode: 'view' | 'edit' | 'create';
  onClose: () => void;
  onSaveSuccess?: () => void;
}

interface FormData extends Partial<CreateCourtRequest> {}

export default function CourtActionModal({
  isOpen,
  court,
  mode,
  onClose,
  onSaveSuccess,
}: CourtActionModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.courts);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isCreate = mode === 'create';
  const isEdit = mode === 'edit';
  const isView = mode === 'view';
  const ro = isView; // read-only

  useEffect(() => {
    if (isOpen) {
      if (isCreate) {
        // Initialize empty form for create
        setFormData({
          is_available: true,
          is_maintenance: false,
        });
      } else if (court) {
        // Initialize form with court data for edit/view
        const initialData: FormData = {
          name: court.name,
          court_type: court.court_type,
          surface: court.surface,
          description: court.description,
          capacity: court.capacity,
          hourly_rate: court.hourly_rate !== undefined ? Number(court.hourly_rate) : undefined,
          daily_rate: court.daily_rate !== undefined ? Number(court.daily_rate) : undefined,
          member_discount:
            court.member_discount !== undefined ? Number(court.member_discount) : undefined,
          club_id: court?.club?.id || court?.club_id,
          is_available: court.is_available,
          is_maintenance: court.is_maintenance,
        };
        setFormData(initialData);
      }
      setErrors({});
      setShowDeleteConfirm(false);
    }
  }, [isOpen, isCreate, court]);

  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nombre es requerido';
    }

    if (!formData.court_type) {
      newErrors.court_type = 'Tipo de cancha es requerido';
    }

    if (!formData.surface) {
      newErrors.surface = 'Superficie es requerida';
    }

    if (formData.hourly_rate !== undefined) {
      const hr = Number(formData.hourly_rate);
      if (isNaN(hr) || hr < 0) newErrors.hourly_rate = 'Tarifa horaria debe ser un número válido';
    }

    if (formData.daily_rate !== undefined) {
      const dr = Number(formData.daily_rate);
      if (isNaN(dr) || dr < 0) newErrors.daily_rate = 'Tarifa diaria debe ser un número válido';
    }

    if (formData.member_discount !== undefined) {
      const md = Number(formData.member_discount);
      if (isNaN(md) || md < 0) newErrors.member_discount = 'Descuento debe ser un número válido';
    }

    if (
      formData.capacity !== undefined &&
      (isNaN(formData.capacity as any) || (formData.capacity as any) < 1)
    ) {
      newErrors.capacity = 'Capacidad debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const cleanData: Record<string, any> = {};
      const validFields: (keyof CreateCourtRequest)[] = [
        'name',
        'court_type',
        'surface',
        'description',
        'capacity',
        'hourly_rate',
        'daily_rate',
        'member_discount',
        'club_id',
        'is_available',
        'is_maintenance',
      ];

      validFields.forEach((field) => {
        if (formData[field] !== undefined && formData[field] !== null && formData[field] !== '') {
          // ensure numeric strings are sent as numbers
          if (field === 'hourly_rate' || field === 'daily_rate' || field === 'member_discount') {
            cleanData[field] = Number(formData[field]);
          } else {
            cleanData[field] = formData[field];
          }
        }
      });

      if (isCreate) {
        // Create new court
        console.log('🚀 Creating court:', cleanData);
        await dispatch(createCourt(cleanData as CreateCourtRequest)).unwrap();
        toast({ title: 'Éxito', description: 'Cancha creada correctamente' });
      } else if (isEdit && court) {
        // Update existing court
        console.log('🚀 Updating court:', { id: court.id, data: cleanData });
        await dispatch(
          updateCourt({ id: court.id, courtData: cleanData as CreateCourtRequest }),
        ).unwrap();
        toast({ title: 'Éxito', description: 'Cancha actualizada correctamente' });
      }

      onClose();
      onSaveSuccess?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Error al guardar cancha' });
      setErrors((prev) => ({
        ...prev,
        submit: error?.message || 'Error al guardar cancha',
      }));
    }
  };

  const handleDelete = async () => {
    if (!court) return;

    try {
      await dispatch(deleteCourt(court.id)).unwrap();
      setShowDeleteConfirm(false);
      onClose();
      onSaveSuccess?.();
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        submit: error?.message || 'Error al eliminar cancha',
      }));
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    if (!open && !showDeleteConfirm) {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl bg-slate-900 border-slate-800 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <DialogTitle className="text-2xl">
                {isCreate ? 'Nueva Cancha' : isView ? 'Detalles de la Cancha' : 'Editar Cancha'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {isCreate ? 'Crea una nueva cancha' : `${court?.name} • ${court?.club_name || '-'}`}
              </DialogDescription>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6 py-4">
            {mode === 'view' ? (
              <div className="space-y-6">
                {/* Court Summary */}
                <Card className="border-slate-800 bg-slate-800/50">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-xs text-slate-400">Tipo</span>
                        <p className="mt-2 font-medium">
                          {COURT_TYPES[court?.court_type as keyof typeof COURT_TYPES] ||
                            court?.court_type}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Superficie</span>
                        <p className="mt-2 font-medium">
                          {COURT_SURFACES[court?.surface as keyof typeof COURT_SURFACES] ||
                            court?.surface}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Tarifa/Hora</span>
                        <p className="mt-2 font-medium flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {court?.hourly_rate ? `${Number(court.hourly_rate).toFixed(2)}` : '0.00'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Disponible</span>
                        <Badge
                          className="mt-2"
                          variant={court?.is_available ? 'default' : 'secondary'}
                        >
                          {court?.is_available ? 'Sí' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Court Details Tabs */}
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
                    <TabsTrigger value="general" className="text-slate-300">
                      General
                    </TabsTrigger>
                    <TabsTrigger value="details" className="text-slate-300">
                      Detalles
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 mt-4">
                    <div>
                      <span className="text-xs text-slate-400">Nombre</span>
                      <p className="mt-1 font-medium">{court?.name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Club</span>
                      <p className="mt-1 font-medium">
                        {court?.club?.name || court?.club_name || '-'}
                      </p>
                      {court?.club && (
                        <p className="text-xs text-slate-400 mt-1">
                          {court.club.city}, {court.club.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Descripción</span>
                      <p className="mt-1">{court?.description || '-'}</p>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400">Dimensiones</span>
                      <p className="mt-1">
                        {typeof court?.dimensions === 'object' ? (
                          <span></span>
                        ) : (
                          <span>{court?.dimensions || '-'}</span>
                        )}
                      </p>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400">Horario de operación</span>
                      <div className="mt-1 text-sm text-slate-300">
                        {court?.operating_hours && typeof court.operating_hours === 'object' ? (
                          <div className="grid grid-cols-2 gap-1">
                            {Object.entries(court.operating_hours as Record<string, any>).map(
                              ([day, hrs]) => (
                                <div key={day} className="flex justify-between">
                                  <span className="capitalize">{day}</span>
                                  <span>
                                    {hrs?.open && hrs?.close ? `${hrs.open} - ${hrs.close}` : '-'}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        ) : (
                          <span>-</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400">Tarifas</span>
                      <div className="mt-1 flex flex-col text-slate-300">
                        <span>
                          Hora: $
                          {court?.hourly_rate ? Number(court.hourly_rate).toFixed(2) : '0.00'}
                        </span>
                        <span>
                          Diaria: $
                          {court?.daily_rate ? Number(court.daily_rate).toFixed(2) : '0.00'}
                        </span>
                        <span>
                          Descuento miembros:{' '}
                          {court?.member_discount
                            ? `${Number(court.member_discount).toFixed(2)}%`
                            : '-'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400">Amenidades</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.isArray(court?.amenities) && court!.amenities!.length > 0 ? (
                          (court!.amenities as any[]).map((a, i) => (
                            <Badge
                              key={i}
                              className="text-xs text-white bg-slate-800 border-slate-700"
                            >
                              {a}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400">Equipo incluido</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.isArray(court?.equipment_included) &&
                        (court?.equipment_included as string[]).length > 0 ? (
                          (court!.equipment_included as string[]).map((e, i) => (
                            <Badge
                              key={i}
                              className="text-xs text-white bg-slate-800 border-slate-700"
                            >
                              {e}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">No especificado</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-slate-400">Fotos</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.isArray(court?.photos) && court.photos.length > 0 ? (
                          (court.photos as string[]).slice(0, 6).map((url, i) => (
                            <a key={i} href={url} target="_blank" rel="noreferrer">
                              <img
                                src={url}
                                alt={`photo-${i}`}
                                className="h-16 w-24 object-cover rounded-md"
                              />
                            </a>
                          ))
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-400">Capacidad</span>
                        <p className="mt-1 font-medium">{court?.capacity || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Reservas Totales</span>
                        <p className="mt-1 font-medium">{court?.total_bookings || 0}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Horas Totales</span>
                        <p className="mt-1 font-medium">
                          {court?.total_hours_booked
                            ? Number(court.total_hours_booked).toFixed(2)
                            : '0.00'}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Calificación</span>
                        <p className="mt-1 font-medium">{court?.average_rating || '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Reseñas</span>
                        <p className="mt-1 font-medium">{(court as any)?.review_count ?? '-'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Destacado</span>
                        <p className="mt-1 font-medium">{court?.is_featured ? 'Sí' : 'No'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">En Mantenimiento</span>
                        <Badge
                          className="mt-2"
                          variant={court?.is_maintenance ? 'destructive' : 'secondary'}
                        >
                          {court?.is_maintenance ? 'Sí' : 'No'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Disponible</span>
                        <Badge
                          className="mt-2"
                          variant={court?.is_available ? 'default' : 'secondary'}
                        >
                          {court?.is_available ? 'Sí' : 'No'}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <span className="text-xs text-slate-400">Configuración</span>
                        <pre className="mt-1 text-sm text-slate-300 bg-slate-800 p-3 rounded">
                          {JSON.stringify(court?.settings || {}, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Notas</span>
                        <p className="mt-1 text-slate-300">{(court as any)?.notes || '-'}</p>
                      </div>
                      <div className="flex gap-4 text-sm text-slate-400">
                        <div>
                          <span className="block text-xs">Creado</span>
                          <span className="font-medium text-white">
                            {(court as any)?.createdAt || court?.created_at || '-'}
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs">Actualizado</span>
                          <span className="font-medium text-white">
                            {(court as any)?.updatedAt || court?.updated_at || '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
                  <TabsTrigger value="general" className="text-slate-300">
                    General
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-slate-300">
                    Configuración
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Nombre</Label>
                    <Input
                      disabled={ro || loading}
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nombre de la cancha"
                      className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                    />
                    {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2 block">Tipo de Cancha</Label>
                    <Select
                      disabled={ro || loading}
                      value={formData.court_type || ''}
                      onValueChange={(v) => handleInputChange('court_type', v)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white disabled:opacity-50">
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {Object.entries(COURT_TYPES).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="text-white">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.court_type && (
                      <p className="text-red-400 text-sm mt-1">{errors.court_type}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2 block">Superficie</Label>
                    <Select
                      disabled={ro || loading}
                      value={formData.surface || ''}
                      onValueChange={(v) => handleInputChange('surface', v)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white disabled:opacity-50">
                        <SelectValue placeholder="Seleccionar superficie" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {Object.entries(COURT_SURFACES).map(([value, label]) => (
                          <SelectItem key={value} value={value} className="text-white">
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.surface && (
                      <p className="text-red-400 text-sm mt-1">{errors.surface}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2 block">Descripción</Label>
                    <Input
                      disabled={ro || loading}
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Descripción de la cancha"
                      className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300 mb-2 block">Club</Label>
                    <Input
                      disabled={ro || loading}
                      value={(formData.club_id as string) || court?.club?.name || ''}
                      onChange={(e) => handleInputChange('club_id', e.target.value)}
                      placeholder="Club (id)"
                      className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-slate-300 mb-2 block">Capacidad</Label>
                      <Input
                        disabled={ro || loading}
                        type="number"
                        value={formData.capacity || ''}
                        onChange={(e) =>
                          handleInputChange(
                            'capacity',
                            e.target.value ? parseInt(e.target.value) : null,
                          )
                        }
                        placeholder="Ej: 4"
                        className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                      />
                      {errors.capacity && (
                        <p className="text-red-400 text-sm mt-1">{errors.capacity}</p>
                      )}
                    </div>

                    <div>
                      <Label className="text-slate-300 mb-2 block">Tarifa por Hora ($)</Label>
                      <Input
                        disabled={ro || loading}
                        type="number"
                        value={formData.hourly_rate || ''}
                        onChange={(e) =>
                          handleInputChange(
                            'hourly_rate',
                            e.target.value ? parseFloat(e.target.value) : null,
                          )
                        }
                        placeholder="Ej: 50.00"
                        className="bg-slate-800 border-slate-700 text-white disabled:opacity-50"
                      />
                      {errors.hourly_rate && (
                        <p className="text-red-400 text-sm mt-1">{errors.hourly_rate}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        disabled={ro || loading}
                        type="checkbox"
                        checked={formData.is_available || false}
                        onChange={(e) => handleInputChange('is_available', e.target.checked)}
                        className="rounded border-slate-700 disabled:opacity-50"
                      />
                      <span className="text-slate-300">Disponible</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        disabled={ro || loading}
                        type="checkbox"
                        checked={formData.is_maintenance || false}
                        onChange={(e) => handleInputChange('is_maintenance', e.target.checked)}
                        className="rounded border-slate-700 disabled:opacity-50"
                      />
                      <span className="text-slate-300">En Mantenimiento</span>
                    </label>
                  </div>
                </TabsContent>
              </Tabs>
            )}

            {/* Error Message */}
            {errors.submit && (
              <Card className="border-red-800/50 bg-red-900/20">
                <CardContent className="p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </CardContent>
              </Card>
            )}

            {/* Delete Button in Edit Mode */}
            {mode === 'edit' ? (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Cancha
              </Button>
            ) : null}
          </div>

          <DialogFooter className="border-t border-slate-800 pt-4">
            {isView ? (
              <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
                Cerrar
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : isCreate ? (
                    'Crear Cancha'
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <AlertDialog open={showDeleteConfirm}>
          <AlertDialogContent className="bg-slate-900 border-slate-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Confirmar Eliminación</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                ¿Estás seguro de que quieres eliminar la cancha "{court?.name}"? Esta acción no se
                puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700"
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
