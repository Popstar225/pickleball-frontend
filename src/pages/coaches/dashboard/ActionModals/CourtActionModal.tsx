import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { updateCourt, deleteCourt, createCourt, Court } from '@/store/slices/coachDashboardSlice';
import { useToast } from '@/hooks/use-toast';
import { X, Loader } from 'lucide-react';
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

  useEffect(() => {
    if (court) {
      setFormData({
        name: court.name,
        court_type: court.court_type,
        surface: court.surface,
        hourly_rate: court.hourly_rate,
        capacity: court.capacity,
        description: court.description,
        is_available: court.is_available,
        is_maintenance: court.is_maintenance,
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        court_type: 'indoor',
        surface: 'concrete',
        hourly_rate: 0,
        capacity: 4,
        description: '',
        is_available: true,
        is_maintenance: false,
      });
    }
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
          className="bg-[#0d1421] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
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

          {/* Content */}
          <div className="px-7 py-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className={labelCls}>Nombre de la Cancha</label>
                <Input
                  className={inputCls}
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                  placeholder="Ej: Cancha Principal"
                  required
                />
              </div>

              {/* Court Type */}
              <div>
                <label className={labelCls}>Tipo de Cancha</label>
                <Select
                  value={formData.court_type || ''}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      court_type: value as 'indoor' | 'outdoor' | 'covered',
                    })
                  }
                >
                  <SelectTrigger
                    disabled={isLoading}
                    className="bg-[#111827] border-white/10 text-[#f0f4ff] disabled:opacity-50"
                  >
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                    <SelectItem value="covered">Cubierta</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Surface */}
              <div>
                <label className={labelCls}>Superficie</label>
                <Select
                  value={formData.surface || ''}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      surface: value as 'concrete' | 'asphalt' | 'synthetic' | 'grass' | 'clay',
                    })
                  }
                >
                  <SelectTrigger
                    disabled={isLoading}
                    className="bg-[#111827] border-white/10 text-[#f0f4ff] disabled:opacity-50"
                  >
                    <SelectValue placeholder="Selecciona superficie" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="concrete">Concreto</SelectItem>
                    <SelectItem value="asphalt">Asfalto</SelectItem>
                    <SelectItem value="synthetic">Sintético</SelectItem>
                    <SelectItem value="grass">Pasto</SelectItem>
                    <SelectItem value="clay">Arcilla</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Hourly Rate */}
              <div>
                <label className={labelCls}>Tarifa por Hora ($)</label>
                <Input
                  className={inputCls}
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })
                  }
                  disabled={isLoading}
                  placeholder="0.00"
                />
              </div>

              {/* Capacity */}
              <div>
                <label className={labelCls}>Capacidad Máxima</label>
                <Input
                  className={inputCls}
                  type="number"
                  min="1"
                  value={formData.capacity || ''}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  disabled={isLoading}
                  placeholder="4"
                />
              </div>

              {/* Total Hours */}
              {!isCreateMode && (
                <div>
                  <label className={labelCls}>Total de Horas</label>
                  <div className="bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-[#f0f4ff] text-sm">
                    {court?.total_hours || 0} horas
                  </div>
                </div>
              )}

              {/* Total Bookings */}
              {!isCreateMode && (
                <div>
                  <label className={labelCls}>Total de Reservas</label>
                  <div className="bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-[#f0f4ff] text-sm">
                    {court?.total_bookings || 0}
                  </div>
                </div>
              )}

              {/* Average Rating */}
              {!isCreateMode && (
                <div>
                  <label className={labelCls}>Calificación Promedio</label>
                  <div className="bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-[#f0f4ff] text-sm">
                    ⭐ {Number(court?.average_rating || 0).toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_available || false}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  disabled={isLoading}
                  className="rounded w-4 h-4"
                />
                <span className="text-sm text-[#f0f4ff]">Disponible</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_maintenance || false}
                  onChange={(e) => setFormData({ ...formData, is_maintenance: e.target.checked })}
                  disabled={isLoading}
                  className="rounded w-4 h-4"
                />
                <span className="text-sm text-[#f0f4ff]">En Mantenimiento</span>
              </label>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className={labelCls}>Descripción</label>
              <textarea
                className={`${inputCls} resize-y`}
                style={{ minHeight: 88 }}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
              />
            </div>
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
