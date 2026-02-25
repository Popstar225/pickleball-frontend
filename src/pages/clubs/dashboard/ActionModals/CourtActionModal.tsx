import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { updateCourt, deleteCourt, createCourt, Court } from '@/store/slices/coachDashboardSlice';
import { useToast } from '@/hooks/use-toast';
import { X, Loader, Plus, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

const ACCENT = '#ace600';
const labelCls = 'block text-[11px] font-semibold text-[#4a5a72] uppercase tracking-widest mb-1.5';
const inputCls = `w-full bg-[#111827] border border-white/10 rounded-xl text-[#f0f4ff] text-sm px-3.5 py-2.5
  outline-none transition-all duration-150
  focus:border-[#ace600] focus:ring-2 focus:ring-[#ace600]/20
  disabled:opacity-40 disabled:cursor-not-allowed placeholder:text-white/20`;

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

interface CourtActionModalProps {
  isOpen: boolean;
  court: Court | null;
  mode: 'view' | 'edit';
  onClose: () => void;
  onSaveSuccess: () => void;
}

export default function CourtActionModal({
  isOpen,
  court,
  mode,
  onClose,
  onSaveSuccess,
}: CourtActionModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<Partial<Court> | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'hours' | 'media' | 'settings'>(
    'basic',
  );
  const [uploadingImages, setUploadingImages] = useState(false);
  const [amenityInputValue, setAmenityInputValue] = useState('');
  const [equipmentInputValue, setEquipmentInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (court) {
      const defaultHours: Record<string, { open: string; close: string }> = {};
      DAYS.forEach((day) => {
        defaultHours[day] = { open: '06:00', close: '23:00' };
      });

      setFormData({
        name: court.name || '',
        court_type: court.court_type || 'indoor',
        surface: court.surface || 'concrete',
        description: court.description || '',
        capacity: court.capacity || 100,
        hourly_rate: court.hourly_rate || 0,
        daily_rate: court.daily_rate || 0,
        member_discount: court.member_discount || 0,
        is_available: court.is_available !== undefined ? court.is_available : true,
        is_maintenance: court.is_maintenance !== undefined ? court.is_maintenance : false,
        maintenance_notes: court.maintenance_notes || '',
        maintenance_start: court.maintenance_start || '',
        maintenance_end: court.maintenance_end || '',
        dimensions: {
          length: court.dimensions?.length || 0,
          width: court.dimensions?.width || 0,
          height: court.dimensions?.height || 0,
          units: court.dimensions?.units || 'meters',
        },
        operating_hours: court.operating_hours || defaultHours,
        equipment_included: court.equipment_included || [],
        amenities: court.amenities || [],
        has_lighting: court.has_lighting !== undefined ? court.has_lighting : true,
        has_net: court.has_net !== undefined ? court.has_net : true,
        has_equipment: court.has_equipment !== undefined ? court.has_equipment : true,
        photos: court.photos || [],
        is_featured: court.is_featured !== undefined ? court.is_featured : false,
        is_active: court.is_active !== undefined ? court.is_active : true,
        settings: court.settings || {},
        notes: court.notes || '',
      });
    } else {
      // Reset form for create mode with default operating hours
      const defaultHours: Record<string, { open: string; close: string }> = {};
      DAYS.forEach((day) => {
        defaultHours[day] = { open: '06:00', close: '23:00' };
      });

      setFormData({
        name: '',
        court_type: 'indoor',
        surface: 'concrete',
        description: '',
        capacity: 100,
        hourly_rate: 300,
        daily_rate: 4500,
        member_discount: 10,
        is_available: true,
        is_maintenance: false,
        maintenance_notes: '',
        maintenance_start: '',
        maintenance_end: '',
        dimensions: { length: 20, width: 44, height: 0, units: 'meters' },
        operating_hours: defaultHours,
        equipment_included: [],
        amenities: [],
        has_lighting: true,
        has_net: true,
        has_equipment: true,
        photos: [],
        is_featured: false,
        is_active: true,
        settings: {},
        notes: '',
      });
    }
    setActiveTab('basic');
    setAmenityInputValue('');
    setEquipmentInputValue('');
  }, [court]);

  if (!isOpen || !formData) return null;

  const isCreateMode = !court;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (isCreateMode) {
        // Create new court
        await dispatch(createCourt(formData as any)).unwrap();
        toast({
          title: 'Éxito',
          description: 'Cancha creada correctamente',
        });
      } else if (court?.id) {
        // Update existing court
        await dispatch(
          updateCourt({
            courtId: court.id,
            updateData: formData,
          }),
        ).unwrap();

        toast({
          title: 'Éxito',
          description: 'Cancha actualizada correctamente',
        });
      }
      onSaveSuccess();
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString?.() || 'No se pudo guardar la cancha';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!court.id) return;
    setIsLoading(true);
    try {
      await dispatch(deleteCourt(court.id)).unwrap();

      toast({
        title: 'Éxito',
        description: 'Cancha eliminada correctamente',
      });
      setShowDeleteConfirm(false);
      onSaveSuccess();
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString?.() || 'No se pudo eliminar la cancha';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleAddAmenity = (amenity: string) => {
    if (amenity.trim() && !formData!.amenities?.includes(amenity)) {
      setFormData({
        ...formData!,
        amenities: [...(formData!.amenities || []), amenity],
      });
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setFormData({
      ...formData!,
      amenities: (formData!.amenities || []).filter((a) => a !== amenity),
    });
  };

  const handleAddEquipment = (equipment: string) => {
    if (equipment.trim() && !formData!.equipment_included?.includes(equipment)) {
      setFormData({
        ...formData!,
        equipment_included: [...(formData!.equipment_included || []), equipment],
      });
    }
  };

  const handleRemoveEquipment = (equipment: string) => {
    setFormData({
      ...formData!,
      equipment_included: (formData!.equipment_included || []).filter((e) => e !== equipment),
    });
  };

  const handleUpdateOperatingHours = (day: string, type: 'open' | 'close', value: string) => {
    setFormData({
      ...formData!,
      operating_hours: {
        ...formData!.operating_hours!,
        [day]: {
          ...formData!.operating_hours![day],
          [type]: value,
        },
      },
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadingImages(true);

    let uploadCount = 0;
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          photos: [...((prev?.photos as string[]) || []), imageData],
        }));
        uploadCount++;
        if (uploadCount === files.length) {
          setUploadingImages(false);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData!,
      photos: (formData!.photos as string[])?.filter((_, i) => i !== index),
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    const photos = (formData!.photos as string[]) || [];
    const photo = photos[index];
    setFormData({
      ...formData!,
      photos: [photo, ...photos.filter((_, i) => i !== index)],
    });
  };

  const TabButton = ({ tab, label }: { tab: typeof activeTab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all ${
        activeTab === tab ? 'text-white border-b-2' : 'text-[#4a5a72] border-b-2 border-transparent'
      }`}
      style={{ borderColor: activeTab === tab ? ACCENT : 'transparent' }}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Main Modal */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      >
        <div
          className="bg-[#0d1421] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-white/[0.06]">
            <h2 className="text-lg font-bold text-white">
              {isCreateMode ? 'Nueva Cancha' : 'Editar Cancha'}
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-[#4a5a72] hover:text-[#f0f4ff] transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 px-7 pt-4 border-b border-white/[0.06]">
            <TabButton tab="basic" label="Básico" />
            <TabButton tab="details" label="Detalles" />
            <TabButton tab="hours" label="Horarios" />
            <TabButton tab="media" label="Medios" />
            <TabButton tab="settings" label="Configuración" />
          </div>

          {/* Content */}
          <div className="px-7 py-6 overflow-y-auto flex-1">
            {/* BASIC TAB */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className={labelCls}>Nombre de la Cancha *</label>
                    <Input
                      className={inputCls}
                      value={formData!.name || ''}
                      onChange={(e) => setFormData({ ...formData!, name: e.target.value })}
                      disabled={isLoading}
                      placeholder="Ej: Beach Paradise Court #1"
                      required
                    />
                  </div>

                  {/* Court Type */}
                  <div>
                    <label className={labelCls}>Tipo de Cancha *</label>
                    <Select
                      value={formData.court_type || ''}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          court_type: value as 'indoor' | 'outdoor' | 'covered',
                        })
                      }
                    >
                      <SelectTrigger disabled={isLoading} className={inputCls}>
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] text-white border-white/10">
                        <SelectItem value="indoor">Cubierta</SelectItem>
                        <SelectItem value="outdoor">Abierta</SelectItem>
                        <SelectItem value="covered">Techada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Surface */}
                  <div>
                    <label className={labelCls}>Superficie *</label>
                    <Select
                      value={formData.surface || ''}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          surface: value as 'concrete' | 'asphalt' | 'synthetic' | 'grass' | 'clay',
                        })
                      }
                    >
                      <SelectTrigger disabled={isLoading} className={inputCls}>
                        <SelectValue placeholder="Selecciona superficie" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111827] text-white border-white/10">
                        <SelectItem value="concrete">Concreto</SelectItem>
                        <SelectItem value="asphalt">Asfalto</SelectItem>
                        <SelectItem value="synthetic">Sintético</SelectItem>
                        <SelectItem value="grass">Pasto</SelectItem>
                        <SelectItem value="clay">Arcilla</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Capacity */}
                  <div>
                    <label className={labelCls}>Capacidad Máxima *</label>
                    <Input
                      className={inputCls}
                      type="number"
                      min="1"
                      value={formData.capacity || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })
                      }
                      disabled={isLoading}
                      placeholder="100"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Descripción</label>
                  <textarea
                    className={`${inputCls} resize-y`}
                    style={{ minHeight: 100 }}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isLoading}
                    placeholder="Describe las características de tu cancha..."
                  />
                </div>

                {/* Availability Status */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available || false}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      disabled={isLoading}
                      className="rounded w-4 h-4 bg-[#111827] border-white/10"
                    />
                    <span className="text-sm text-[#f0f4ff]">Disponible</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured || false}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      disabled={isLoading}
                      className="rounded w-4 h-4"
                    />
                    <span className="text-sm text-[#f0f4ff]">Destacada</span>
                  </label>
                </div>

                {/* Display Stats if Edit Mode */}
                {!isCreateMode && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 p-4 bg-[#111827] rounded-xl border border-white/10">
                    <div>
                      <p className="text-[11px] text-[#4a5a72] uppercase font-semibold">
                        Total Reservas
                      </p>
                      <p className="text-[#f0f4ff] font-bold text-lg">{court?.total_bookings}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#4a5a72] uppercase font-semibold">
                        Horas Totales
                      </p>
                      <p className="text-[#f0f4ff] font-bold text-lg">{court?.total_hours}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#4a5a72] uppercase font-semibold">
                        Calificación
                      </p>
                      <p className="text-[#f0f4ff] font-bold text-lg">
                        ⭐ {Number(court?.average_rating || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#4a5a72] uppercase font-semibold">Reseñas</p>
                      <p className="text-[#f0f4ff] font-bold text-lg">{court?.review_count}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DETAILS TAB */}
            {activeTab === 'details' && (
              <div className="space-y-4">
                {/* Dimensions */}
                <div>
                  <h3 className={labelCls}>Dimensiones</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] text-[#4a5a72] uppercase font-semibold mb-1.5 block">
                        Largo (m)
                      </label>
                      <Input
                        className={inputCls}
                        type="number"
                        step="0.1"
                        value={formData.dimensions?.length || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: {
                              ...formData.dimensions!,
                              length: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#4a5a72] uppercase font-semibold mb-1.5 block">
                        Ancho (m)
                      </label>
                      <Input
                        className={inputCls}
                        type="number"
                        step="0.1"
                        value={formData.dimensions?.width || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: {
                              ...formData.dimensions!,
                              width: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#4a5a72] uppercase font-semibold mb-1.5 block">
                        Alto (m)
                      </label>
                      <Input
                        className={inputCls}
                        type="number"
                        step="0.1"
                        value={formData.dimensions?.height || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dimensions: {
                              ...formData.dimensions!,
                              height: parseFloat(e.target.value) || 0,
                            },
                          })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelCls}>Tarifa Horaria ($)</label>
                    <Input
                      className={inputCls}
                      type="number"
                      step="0.01"
                      value={formData.hourly_rate || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hourly_rate: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Tarifa Diaria ($)</label>
                    <Input
                      className={inputCls}
                      type="number"
                      step="0.01"
                      value={formData.daily_rate || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          daily_rate: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Descuento Miembro (%)</label>
                    <Input
                      className={inputCls}
                      type="number"
                      step="0.01"
                      value={formData.member_discount || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          member_discount: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className={labelCls}>Características</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.has_lighting || false}
                        onChange={(e) =>
                          setFormData({ ...formData, has_lighting: e.target.checked })
                        }
                        disabled={isLoading}
                        className="rounded w-4 h-4"
                      />
                      <span className="text-sm text-[#f0f4ff]">Iluminación</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.has_net || false}
                        onChange={(e) => setFormData({ ...formData, has_net: e.target.checked })}
                        disabled={isLoading}
                        className="rounded w-4 h-4"
                      />
                      <span className="text-sm text-[#f0f4ff]">Red</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.has_equipment || false}
                        onChange={(e) =>
                          setFormData({ ...formData, has_equipment: e.target.checked })
                        }
                        disabled={isLoading}
                        className="rounded w-4 h-4"
                      />
                      <span className="text-sm text-[#f0f4ff]">Equipos</span>
                    </label>
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <label className={labelCls}>Amenidades</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      className={inputCls}
                      placeholder="Ej: Parqueadero, WiFi, Bar"
                      disabled={isLoading}
                      value={amenityInputValue}
                      onChange={(e) => setAmenityInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (amenityInputValue.trim()) {
                            handleAddAmenity(amenityInputValue);
                            setAmenityInputValue('');
                          }
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (amenityInputValue.trim()) {
                          handleAddAmenity(amenityInputValue);
                          setAmenityInputValue('');
                        }
                      }}
                      disabled={isLoading}
                      className="bg-[#ace600] text-black hover:bg-[#9ed500] px-3"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.amenities || []).map((amenity) => (
                      <div
                        key={amenity}
                        className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-[#f0f4ff] flex items-center gap-2"
                      >
                        {amenity}
                        <button
                          onClick={() => handleRemoveAmenity(amenity)}
                          disabled={isLoading}
                          className="text-[#4a5a72] hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Equipment Included */}
                <div>
                  <label className={labelCls}>Equipo Incluido</label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      className={inputCls}
                      placeholder="Ej: Pelotas premium, Raquetas"
                      disabled={isLoading}
                      value={equipmentInputValue}
                      onChange={(e) => setEquipmentInputValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (equipmentInputValue.trim()) {
                            handleAddEquipment(equipmentInputValue);
                            setEquipmentInputValue('');
                          }
                        }
                      }}
                    />
                    <Button
                      onClick={() => {
                        if (equipmentInputValue.trim()) {
                          handleAddEquipment(equipmentInputValue);
                          setEquipmentInputValue('');
                        }
                      }}
                      disabled={isLoading}
                      className="bg-[#ace600] text-black hover:bg-[#9ed500] px-3"
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.equipment_included || []).map((equipment) => (
                      <div
                        key={equipment}
                        className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm text-[#f0f4ff] flex items-center gap-2"
                      >
                        {equipment}
                        <button
                          onClick={() => handleRemoveEquipment(equipment)}
                          disabled={isLoading}
                          className="text-[#4a5a72] hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Maintenance */}
                <div>
                  <h3 className={labelCls}>Mantenimiento</h3>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_maintenance || false}
                        onChange={(e) =>
                          setFormData({ ...formData, is_maintenance: e.target.checked })
                        }
                        disabled={isLoading}
                        className="rounded w-4 h-4"
                      />
                      <span className="text-sm text-[#f0f4ff]">En Mantenimiento</span>
                    </label>

                    {formData.is_maintenance && (
                      <div className="space-y-3 pl-6">
                        <Input
                          className={inputCls}
                          placeholder="Notas de mantenimiento"
                          value={formData.maintenance_notes || ''}
                          onChange={(e) =>
                            setFormData({ ...formData, maintenance_notes: e.target.value })
                          }
                          disabled={isLoading}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-[#4a5a72] uppercase font-semibold mb-1.5 block">
                              Inicio
                            </label>
                            <Input
                              className={inputCls}
                              type="date"
                              value={formData.maintenance_start || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  maintenance_start: e.target.value,
                                })
                              }
                              disabled={isLoading}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#4a5a72] uppercase font-semibold mb-1.5 block">
                              Fin
                            </label>
                            <Input
                              className={inputCls}
                              type="date"
                              value={formData.maintenance_end || ''}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  maintenance_end: e.target.value,
                                })
                              }
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* HOURS TAB */}
            {activeTab === 'hours' && (
              <div className="space-y-3">
                <p className="text-sm text-[#4a5a72] mb-4">
                  Configura el horario de operación para cada día
                </p>
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="flex items-end gap-3 p-3 bg-[#111827] rounded-xl border border-white/10"
                  >
                    <div className="flex-1">
                      <label className="text-[10px] text-[#4a5a72] uppercase font-semibold mb-1.5 block">
                        {DAY_LABELS[day]}
                      </label>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <label className="text-[9px] text-[#4a5a72] uppercase font-semibold mb-1 block">
                            Abre
                          </label>
                          <Input
                            className={`${inputCls} text-center`}
                            type="time"
                            value={formData.operating_hours?.[day]?.open || '06:00'}
                            onChange={(e) =>
                              handleUpdateOperatingHours(day, 'open', e.target.value)
                            }
                            disabled={isLoading}
                          />
                        </div>
                        <span className="text-[#4a5a72] text-sm font-semibold">→</span>
                        <div className="flex-1">
                          <label className="text-[9px] text-[#4a5a72] uppercase font-semibold mb-1 block">
                            Cierra
                          </label>
                          <Input
                            className={`${inputCls} text-center`}
                            type="time"
                            value={formData.operating_hours?.[day]?.close || '23:00'}
                            onChange={(e) =>
                              handleUpdateOperatingHours(day, 'close', e.target.value)
                            }
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* MEDIA TAB */}
            {activeTab === 'media' && (
              <div className="space-y-4">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImages}
                />

                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImages || isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-white/20 hover:border-accent/50 transition-colors disabled:opacity-50"
                >
                  <Upload size={20} style={{ color: ACCENT }} />
                  <span className="text-[#f0f4ff] font-medium">
                    {uploadingImages ? 'Subiendo imágenes...' : 'Haz clic para subir imágenes'}
                  </span>
                </button>

                {/* Images grid */}
                {formData?.photos && (formData.photos as string[]).length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-[#4a5a72]">
                      {(formData.photos as string[]).length} imagen
                      {(formData.photos as string[]).length !== 1 ? 'es' : ''} cargada
                      {(formData.photos as string[]).length !== 1 ? 's' : ''}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {(formData.photos as string[]).map((photo: string, index: number) => (
                        <div
                          key={index}
                          className="relative group rounded-xl overflow-hidden border border-white/10 hover:border-accent/50 transition-all"
                        >
                          <img
                            src={photo}
                            alt={`Court ${index + 1}`}
                            className="w-full h-40 object-cover"
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 px-2 py-1 bg-accent text-black text-xs font-bold rounded-lg">
                              Principal
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {index !== 0 && (
                              <button
                                onClick={() => handleSetPrimaryImage(index)}
                                title="Establecer como principal"
                                className="p-2 bg-accent/20 hover:bg-accent/30 rounded-lg text-accent transition-all"
                              >
                                <ImageIcon size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveImage(index)}
                              title="Eliminar imagen"
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <ImageIcon size={32} className="mx-auto mb-3 text-[#4a5a72]" />
                    <p className="text-[#4a5a72] text-sm">No hay imágenes cargadas</p>
                    <p className="text-[#4a5a72] text-xs mt-1">
                      Sube fotos de la cancha para mostrar en el catálogo
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-[#111827] rounded-xl border border-white/10">
                    <input
                      type="checkbox"
                      checked={formData.is_active || false}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      disabled={isLoading}
                      className="rounded w-4 h-4"
                    />
                    <span className="text-sm text-[#f0f4ff]">Activa</span>
                  </label>
                </div>

                <div>
                  <label className={labelCls}>Notas Generales</label>
                  <textarea
                    className={`${inputCls} resize-y`}
                    style={{ minHeight: 100 }}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    disabled={isLoading}
                    placeholder="Notas adicionales sobre la cancha..."
                  />
                </div>

                {!isCreateMode && (
                  <div className="p-4 bg-[#111827] rounded-xl border border-white/10 text-sm text-[#4a5a72]">
                    <p>
                      <strong>Creada:</strong>{' '}
                      {new Date(court?.createdAt || court?.created_at || '').toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Última actualización:</strong>{' '}
                      {new Date(court?.updatedAt || court?.updated_at || '').toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-2.5 px-7 pb-6 pt-4 border-t border-white/[0.06]">
            {!isCreateMode && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/15 disabled:opacity-50 transition-all"
              >
                Eliminar
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[#f0f4ff] hover:bg-white/5 disabled:opacity-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50 transition-all flex items-center gap-2"
              style={{ background: isLoading ? `${ACCENT}80` : ACCENT }}
            >
              {isLoading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[51] p-6"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-[#0d1421] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-7 pt-6 pb-4">
              <h2 className="text-lg font-bold text-red-400">¿Eliminar cancha?</h2>
              <p className="text-[#4a5a72] text-sm mt-2">
                Esta acción no se puede deshacer. Se eliminarán todos los datos asociados a esta
                cancha.
              </p>
            </div>

            <div className="flex gap-2.5 px-7 pb-6 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[#f0f4ff] hover:bg-white/5 disabled:opacity-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
