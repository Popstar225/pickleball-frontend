import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { updateUser, deleteUser } from '../../../../store/slices/usersSlice';
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
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { User, UpdateUserRequest } from '../../../../types/api';

interface UserActionModalProps {
  isOpen: boolean;
  user: User | null;
  mode: 'view' | 'edit';
  onClose: () => void;
  onSaveSuccess?: () => void;
}

export default function UserActionModal({
  isOpen,
  user,
  mode,
  onClose,
  onSaveSuccess,
}: UserActionModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.users);

  // Form state - use UpdateUserRequest type for form data
  const [formData, setFormData] = useState<UpdateUserRequest>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form when user changes or modal opens
  useEffect(() => {
    if (user && isOpen) {
      // Only initialize with UpdateUserRequest fields
      const initialData: Record<string, any> = {};
      const validFields: (keyof UpdateUserRequest)[] = [
        'full_name',
        'date_of_birth',
        'gender',
        'phone',
        'profile_photo',
        'skill_level',
        'state',
        'city',
        'address',
        'latitude',
        'longitude',
        'business_name',
        'contact_person',
        'job_title',
        'curp',
        'rfc',
        'website',
        'membership_status',
        'membership_expires_at',
        'is_active',
        'is_verified',
        'club_id',
      ];

      validFields.forEach((field) => {
        const value = user[field as keyof User];
        if (value !== undefined && value !== null) {
          initialData[field] = value;
        }
      });

      setFormData(initialData as UpdateUserRequest);
      setErrors({});
      setShowDeleteConfirm(false);
    }
  }, [user, isOpen]);

  // Reset delete confirmation on close
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
    }
  }, [isOpen]);

  // Handle input change
  const handleInputChange = (field: keyof UpdateUserRequest, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'Nombre completo es requerido';
    }

    // Validate coordinates if provided
    if (formData.latitude !== undefined && formData.latitude !== null) {
      const lat = parseFloat(String(formData.latitude));
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors.latitude = 'Latitud debe estar entre -90 y 90';
      }
    }
    if (formData.longitude !== undefined && formData.longitude !== null) {
      const lng = parseFloat(String(formData.longitude));
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors.longitude = 'Longitud debe estar entre -180 y 180';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save/update
  const handleSave = async () => {
    if (!user || !validateForm()) return;

    try {
      // Send all valid UpdateUserRequest fields that exist - don't filter aggressively
      const cleanData: Record<string, any> = {};
      const validFields: (keyof UpdateUserRequest)[] = [
        'full_name',
        'date_of_birth',
        'gender',
        'phone',
        'profile_photo',
        'skill_level',
        'state',
        'city',
        'address',
        'latitude',
        'longitude',
        'business_name',
        'contact_person',
        'job_title',
        'curp',
        'rfc',
        'website',
        'membership_status',
        'membership_expires_at',
        'is_active',
        'is_verified',
        'club_id',
      ];

      validFields.forEach((field) => {
        const value = formData[field];
        // Include the field if it has a value (skip only if truly empty string, not if 0 or false)
        if (value !== undefined && value !== null && value !== '') {
          cleanData[field] = value;
        }
      });

      console.log('🚀 Sending update payload:', {
        id: user.id,
        userData: cleanData,
        keys: Object.keys(cleanData),
        skillLevel: cleanData['skill_level'],
      });

      const result = await dispatch(
        updateUser({ id: user.id, userData: cleanData as UpdateUserRequest }),
      ).unwrap();

      if (result) {
        onClose();
        onSaveSuccess?.();
      }
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        submit: error?.message || 'Error al actualizar usuario',
      }));
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!user) return;

    try {
      await dispatch(deleteUser(user.id)).unwrap();
      setShowDeleteConfirm(false);
      onClose();
      onSaveSuccess?.();
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        submit: error?.message || 'Error al eliminar usuario',
      }));
    }
  };

  if (!user) return null;

  // Prevent closing dialog when delete confirmation is open
  const handleDialogOpenChange = (open: boolean) => {
    if (!open && !showDeleteConfirm) {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-slate-800">
            <div>
              <DialogTitle className="text-white text-xl">
                {mode === 'view' ? 'Ver Usuario' : 'Editar Usuario'}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {user?.full_name} (@{user?.username})
              </DialogDescription>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Tabs for View vs Edit */}
            {mode === 'view' ? (
              // View Mode - Display only
              <div className="space-y-6">
                {/* User Summary */}
                <Card className="border-slate-800 bg-slate-800/50">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-xs text-slate-400">Tipo de Usuario</span>
                        <Badge className="mt-2 capitalize">{user.user_type}</Badge>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Membresía</span>
                        <Badge className="mt-2 capitalize">{user.membership_status}</Badge>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Estado</span>
                        <Badge className="mt-2" variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Verificado</span>
                        <Badge
                          className="mt-2"
                          variant={user.is_verified ? 'default' : 'secondary'}
                        >
                          {user.is_verified ? 'Sí' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* User Details */}
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
                    <TabsTrigger value="personal" className="text-slate-300">
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="business" className="text-slate-300">
                      Negocio
                    </TabsTrigger>
                    <TabsTrigger value="location" className="text-slate-300">
                      Ubicación
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="personal" className="space-y-4 mt-4">
                    <DetailField label="Nombre" value={user.full_name || 'N/A'} />
                    <DetailField label="Usuario" value={user.username} />
                    <DetailField label="Email" value={user.email} />
                    <DetailField label="Teléfono" value={user.phone || 'No especificado'} />
                    <DetailField
                      label="Nivel de Habilidad"
                      value={user.skill_level || 'No especificado'}
                    />
                  </TabsContent>

                  <TabsContent value="business" className="space-y-4 mt-4">
                    <DetailField
                      label="Nombre de Negocio"
                      value={user.business_name || 'No especificado'}
                    />
                    <DetailField
                      label="Persona de Contacto"
                      value={user.contact_person || 'No especificado'}
                    />
                    <DetailField label="Puesto" value={user.job_title || 'No especificado'} />
                    <DetailField label="CURP" value={user.curp || 'No especificado'} />
                    <DetailField label="RFC" value={user.rfc || 'No especificado'} />
                    <DetailField label="Sitio Web" value={user.website || 'No especificado'} />
                  </TabsContent>

                  <TabsContent value="location" className="space-y-4 mt-4">
                    <DetailField label="Estado" value={user.state || 'No especificado'} />
                    <DetailField label="Ciudad" value={user.city || 'No especificado'} />
                    <DetailField label="Dirección" value={user.address || 'No especificado'} />
                    <DetailField label="Latitud" value={user.latitude?.toString() || 'N/A'} />
                    <DetailField label="Longitud" value={user.longitude?.toString() || 'N/A'} />
                  </TabsContent>
                </Tabs>

                {/* Timestamps */}
                <Card className="border-slate-800 bg-slate-800/50">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-400">Creado</span>
                        <p className="text-white mt-1">
                          {new Date(user.created_at).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Actualizado</span>
                        <p className="text-white mt-1">
                          {new Date(user.updated_at).toLocaleDateString('es-MX')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Edit Mode - Form
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
                  <TabsTrigger value="personal" className="text-slate-300">
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="business" className="text-slate-300">
                    Negocio
                  </TabsTrigger>
                  <TabsTrigger value="location" className="text-slate-300">
                    Ubicación
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="space-y-4 mt-4">
                  <FormField
                    label="Nombre Completo"
                    value={formData.full_name || ''}
                    onChange={(v) => handleInputChange('full_name', v)}
                    error={errors.full_name}
                    placeholder="Nombre completo"
                  />

                  <FormField
                    label="Teléfono"
                    value={formData.phone || ''}
                    onChange={(v) => handleInputChange('phone', v)}
                    placeholder="+34 XXX XXX XXX"
                  />
                  <FormField
                    label="Bio"
                    value={formData.bio || ''}
                    onChange={(v) => handleInputChange('bio', v)}
                    placeholder="Descripción personal"
                  />
                  <div>
                    <Label className="text-slate-300 mb-2 block">Nivel de Habilidad (NRTP)</Label>
                    <Select
                      value={formData.skill_level || ''}
                      onValueChange={(v) => handleInputChange('skill_level', v)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Seleccionar nivel de habilidad" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="2.5" className="text-white">
                          2.5 - Principiante
                        </SelectItem>
                        <SelectItem value="3.0" className="text-white">
                          3.0 - Intermedio Bajo
                        </SelectItem>
                        <SelectItem value="3.5" className="text-white">
                          3.5 - Intermedio
                        </SelectItem>
                        <SelectItem value="4.0" className="text-white">
                          4.0 - Intermedio Alto
                        </SelectItem>
                        <SelectItem value="4.5" className="text-white">
                          4.5 - Avanzado
                        </SelectItem>
                        <SelectItem value="5.0" className="text-white">
                          5.0 - Profesional
                        </SelectItem>
                        <SelectItem value="5.5" className="text-white">
                          5.5 - Élite
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="business" className="space-y-4 mt-4">
                  <FormField
                    label="Nombre de Negocio"
                    value={formData.business_name || ''}
                    onChange={(v) => handleInputChange('business_name', v)}
                    placeholder="Nombre del negocio"
                  />
                  <FormField
                    label="Persona de Contacto"
                    value={formData.contact_person || ''}
                    onChange={(v) => handleInputChange('contact_person', v)}
                    placeholder="Nombre del contacto"
                  />
                  <FormField
                    label="Puesto"
                    value={formData.job_title || ''}
                    onChange={(v) => handleInputChange('job_title', v)}
                    placeholder="Puesto o título"
                  />
                  <FormField
                    label="CURP"
                    value={formData.curp || ''}
                    onChange={(v) => handleInputChange('curp', v)}
                    placeholder="CURP"
                  />
                  <FormField
                    label="RFC"
                    value={formData.rfc || ''}
                    onChange={(v) => handleInputChange('rfc', v)}
                    placeholder="RFC"
                  />
                  <FormField
                    label="Sitio Web"
                    value={formData.website || ''}
                    onChange={(v) => handleInputChange('website', v)}
                    placeholder="https://example.com"
                  />
                </TabsContent>

                <TabsContent value="location" className="space-y-4 mt-4">
                  <FormField
                    label="Estado"
                    value={formData.state || ''}
                    onChange={(v) => handleInputChange('state', v)}
                    placeholder="Estado"
                  />
                  <FormField
                    label="Ciudad"
                    value={formData.city || ''}
                    onChange={(v) => handleInputChange('city', v)}
                    placeholder="Ciudad"
                  />
                  <FormField
                    label="Dirección"
                    value={formData.address || ''}
                    onChange={(v) => handleInputChange('address', v)}
                    placeholder="Dirección"
                  />
                  <FormField
                    label="Latitud"
                    type="number"
                    value={formData.latitude?.toString() || ''}
                    onChange={(v) => handleInputChange('latitude', v ? parseFloat(v) : null)}
                    error={errors.latitude}
                    placeholder="-90 a 90"
                  />
                  <FormField
                    label="Longitud"
                    type="number"
                    value={formData.longitude?.toString() || ''}
                    onChange={(v) => handleInputChange('longitude', v ? parseFloat(v) : null)}
                    error={errors.longitude}
                    placeholder="-180 a 180"
                  />
                </TabsContent>
              </Tabs>
            )}

            {/* Status Fields - Both modes */}
            {mode === 'edit' ? (
              <Card className="border-slate-800 bg-slate-800/50">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-2 block">Membresía</Label>
                    <Select
                      value={formData.membership_status || ''}
                      onValueChange={(v) => handleInputChange('membership_status', v)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Seleccionar membresía" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="free" className="text-white">
                          Gratuita
                        </SelectItem>
                        <SelectItem value="basic" className="text-white">
                          Básica
                        </SelectItem>
                        <SelectItem value="pro" className="text-white">
                          Pro
                        </SelectItem>
                        <SelectItem value="premium" className="text-white">
                          Premium
                        </SelectItem>
                        <SelectItem value="expired" className="text-white">
                          Expirada
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active || false}
                        onChange={(e) => handleInputChange('is_active', e.target.checked)}
                        className="rounded border-slate-700"
                      />
                      <span className="text-slate-300">Activo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_verified || false}
                        onChange={(e) => handleInputChange('is_verified', e.target.checked)}
                        className="rounded border-slate-700"
                      />
                      <span className="text-slate-300">Verificado</span>
                    </label>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Error Message */}
            {errors.submit && (
              <Card className="border-red-800/50 bg-red-900/20">
                <CardContent className="p-4 flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm">{errors.submit}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="border-t border-slate-800 pt-4">
            {mode === 'edit' ? (
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
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                  disabled={loading}
                  className="bg-red-900/50 text-red-400 hover:bg-red-900"
                >
                  Eliminar Usuario
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-primary text-slate-900 hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cerrar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent className="bg-slate-900 border-slate-800">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Eliminar Usuario
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                ¿Estás seguro de que deseas eliminar a {user.full_name}? Esta acción no se puede
                deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-900 text-red-50 hover:bg-red-800"
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

// Helper Components
function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-3 border-b border-slate-800 last:border-b-0">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

function FormField({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = 'text',
  disabled = false,
}: FormFieldProps) {
  return (
    <div>
      <Label className="text-slate-300 mb-2 block">{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 ${
          error ? 'border-red-500/50 focus:border-red-500' : ''
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
