import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { createClub, updateClub, deleteClub, fetchClubCourts } from '../../../../store/slices/clubsSlice';
import { Court } from '../../../../types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import {
  X,
  Loader2,
  AlertTriangle,
  Building2,
  Check,
  Trash2,
  User,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Globe,
  Users,
  Layers,
  Trophy,
  LayoutGrid,
} from 'lucide-react';
import { Club, CreateClubRequest } from '../../../../types/api';
import { cn } from '@/lib/utils';

// ─── Shared tokens ────────────────────────────────────────────────────────────
const fieldCls = cn(
  'h-10 rounded-xl text-sm',
  'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20',
  'focus-visible:ring-0 focus-visible:border-[#ace600]/50 focus-visible:bg-[#ace600]/[0.03]',
  'disabled:opacity-35 disabled:cursor-not-allowed transition-all',
);

const selectTriggerCls = cn(
  'h-10 w-full rounded-xl text-sm',
  'bg-white/[0.04] border-white/[0.08] text-white',
  'focus:ring-0 focus:border-[#ace600]/50',
  'data-[state=open]:border-[#ace600]/50',
  'disabled:opacity-35 disabled:cursor-not-allowed transition-all',
);

const labelCls = 'text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5 block';

// ─── Atoms ────────────────────────────────────────────────────────────────────
function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-6 h-6 rounded-md bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3 text-[#ace600]" />
      </div>
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30">
        {children}
      </span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
      <AlertTriangle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  desc,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <div>
        <p className="text-sm font-medium text-white/70">{label}</p>
        {desc && <p className="text-[11px] text-white/30 mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className="relative rounded-full transition-all duration-200 focus:outline-none disabled:opacity-35 shrink-0 ml-4"
        style={{ width: 40, height: 22, background: checked ? '#ace600' : 'rgba(255,255,255,0.1)' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

function IconInput({
  icon: Icon,
  className,
  ...props
}: { icon: React.ElementType; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none z-10" />
      <Input className={cn(fieldCls, 'pl-9', className)} {...(props as any)} />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ClubActionModalProps {
  isOpen: boolean;
  club: Club | null;
  mode: 'create' | 'edit' | 'view';
  onClose: () => void;
  onSaveSuccess?: () => void;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClubActionModal({
  isOpen,
  club,
  mode,
  onClose,
  onSaveSuccess,
}: ClubActionModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((s: RootState) => s.clubs);

  const emptyForm: CreateClubRequest = {
    name: '',
    club_type: 'recreational',
    contact_person: '',
    contact_email: '',
    state: '',
    city: '',
    has_courts: false,
    court_count: 0,
    offers_training: false,
    offers_tournaments: false,
    offers_equipment: false,
  };

  const [form, setForm] = useState<CreateClubRequest>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDelete, setShowDelete] = useState(false);
  const [courts, setCourts] = useState<Court[]>([]);
  const [courtsLoading, setCourtsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setShowDelete(false);
    setCourts([]);
    if (mode === 'create') {
      setForm(emptyForm);
    } else if (club) {
      setForm({
        name: club.name || '',
        club_type: club.club_type,
        contact_person: club.contact_person || '',
        contact_email: club.contact_email || '',
        contact_phone: club.contact_phone || '',
        contact_whatsapp: club.contact_whatsapp || '',
        state: club.state || '',
        city: club.city || '',
        address: club.address || '',
        founded_date: club.founded_date || '',
        max_members: club.max_members,
        has_courts: club.has_courts || false,
        court_count: club.court_count || 0,
        offers_training: club.offers_training || false,
        offers_tournaments: club.offers_tournaments || false,
        offers_equipment: club.offers_equipment || false,
        membership_fee: club.membership_fee,
        court_rental_fee: club.court_rental_fee,
        website: club.website || '',
        club_rules: club.club_rules || '',
        dress_code: club.dress_code || '',
        description: club.description || '',
      });
      // Fetch courts when viewing a club
      if (mode === 'view') {
        setCourtsLoading(true);
        dispatch(fetchClubCourts(club.id))
          .unwrap()
          .then((res: any) => {
            const courtsData = res?.courts || res?.data?.courts || res?.data || [];
            setCourts(Array.isArray(courtsData) ? courtsData : []);
          })
          .catch(() => setCourts([]))
          .finally(() => setCourtsLoading(false));
      }
    }
  }, [isOpen, club, mode, dispatch]);

  const set = (field: keyof CreateClubRequest, val: any) => {
    setForm((p) => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = 'Nombre es requerido';
    if (!form.contact_person?.trim()) e.contact_person = 'Contacto es requerido';
    if (!form.contact_email?.trim()) e.contact_email = 'Email es requerido';
    if (!form.state?.trim()) e.state = 'Estado es requerido';
    if (!form.city?.trim()) e.city = 'Ciudad es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      if (mode === 'create') await dispatch(createClub(form)).unwrap();
      else if (mode === 'edit' && club)
        await dispatch(updateClub({ id: club.id, data: form })).unwrap();
      onSaveSuccess?.();
      onClose();
    } catch (err: any) {
      setErrors({ submit: err?.message || 'Error al guardar' });
    }
  };

  const handleDelete = async () => {
    if (!club) return;
    try {
      await dispatch(deleteClub(club.id)).unwrap();
      setShowDelete(false);
      onSaveSuccess?.();
      onClose();
    } catch (err: any) {
      setErrors({ submit: err?.message || 'Error al eliminar' });
    }
  };

  const ro = mode === 'view';
  const isCreate = mode === 'create';
  const titleMap = { create: 'Crear Club', edit: 'Editar Club', view: 'Detalles del Club' };

  const initials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';

  return (
    /**
     * KEY FIX: wrapping in shadcn <Dialog> means Radix registers a single
     * portal context, so any child <Select> portals nest correctly under it.
     * This eliminates the "removeChild" DOM conflict.
     */
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          'bg-[#0d1117] border border-white/[0.08] rounded-2xl shadow-2xl p-0 gap-0',
          'max-w-2xl w-full',
          // Hide the default shadcn ✕ button — we render our own
          '[&>button:last-child]:hidden',
        )}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-white/[0.06] space-y-0 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
              {club?.name ? (
                <span className="text-sm font-bold text-[#ace600]">{initials(club.name)}</span>
              ) : (
                <Building2 className="w-5 h-5 text-[#ace600]" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white leading-tight">
                {titleMap[mode]}
              </DialogTitle>
              {club && mode !== 'create' && (
                <p className="text-[11px] text-white/25 font-mono mt-0.5">{club.id}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-white/30 hover:text-white hover:bg-white/[0.06] shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* ── Scrollable body ─────────────────────────────────────────────── */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-5 space-y-7">
          {/* Submit error */}
          {errors.submit && (
            <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Inline delete confirmation */}
          {showDelete && (
            <div className="flex items-start gap-4 p-5 bg-red-500/[0.05] border border-red-500/15 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white mb-0.5">¿Eliminar este club?</p>
                <p className="text-xs text-white/35 mb-4">
                  Eliminarás permanentemente{' '}
                  <span className="text-white/60 font-semibold">"{club?.name}"</span>. Esta acción
                  no se puede deshacer.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDelete(false)}
                    className="h-8 rounded-lg border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDelete}
                    disabled={loading}
                    className="h-8 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                  >
                    {loading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        Sí, eliminar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── 1. General ────────────────────────────────────────────────── */}
          <div>
            <SectionHeading icon={Building2}>Información General</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label className={labelCls}>
                  Nombre del Club <span className="text-red-400">*</span>
                </Label>
                <Input
                  className={fieldCls}
                  placeholder="Nombre del club"
                  value={form.name || ''}
                  onChange={(e) => set('name', e.target.value)}
                  disabled={ro || loading}
                />
                <FieldError msg={errors.name} />
              </div>

              <div>
                <Label className={labelCls}>Tipo de Club</Label>
                {/* Select is safe here — nested inside shadcn Dialog, portals share context */}
                <Select
                  value={form.club_type || 'recreational'}
                  onValueChange={(v) => set('club_type', v)}
                  disabled={ro || loading}
                >
                  <SelectTrigger className={selectTriggerCls}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl z-[200]">
                    {[
                      ['recreational', 'Recreativo'],
                      ['competitive', 'Competitivo'],
                      ['training', 'Entrenamiento'],
                      ['mixed', 'Mixto'],
                    ].map(([v, l]) => (
                      <SelectItem
                        key={v}
                        value={v}
                        className="text-white/70 focus:bg-white/[0.06] focus:text-white"
                      >
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={labelCls}>Fecha de Fundación</Label>
                <Input
                  className={fieldCls}
                  type="date"
                  value={(form as any).founded_date || ''}
                  onChange={(e) => set('founded_date' as any, e.target.value)}
                  disabled={ro || loading}
                />
              </div>

              <div className="sm:col-span-2">
                <Label className={labelCls}>Descripción</Label>
                <textarea
                  className={cn(fieldCls, 'h-auto w-full py-2.5 resize-none')}
                  rows={3}
                  placeholder="Descripción del club…"
                  value={(form as any).description || ''}
                  onChange={(e) => set('description' as any, e.target.value)}
                  disabled={ro || loading}
                />
              </div>
            </div>
          </div>

          {/* ── 2. Contact ────────────────────────────────────────────────── */}
          <div>
            <SectionHeading icon={User}>Contacto</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className={labelCls}>
                  Persona de Contacto <span className="text-red-400">*</span>
                </Label>
                <IconInput
                  icon={User}
                  placeholder="Nombre"
                  value={form.contact_person || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set('contact_person', e.target.value)
                  }
                  disabled={ro || loading}
                />
                <FieldError msg={errors.contact_person} />
              </div>

              <div>
                <Label className={labelCls}>
                  Email <span className="text-red-400">*</span>
                </Label>
                <IconInput
                  icon={Mail}
                  type="email"
                  placeholder="email@club.com"
                  value={form.contact_email || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set('contact_email', e.target.value)
                  }
                  disabled={ro || loading}
                />
                <FieldError msg={errors.contact_email} />
              </div>

              <div>
                <Label className={labelCls}>Teléfono</Label>
                <IconInput
                  icon={Phone}
                  placeholder="+52 …"
                  value={(form as any).contact_phone || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set('contact_phone' as any, e.target.value)
                  }
                  disabled={ro || loading}
                />
              </div>

              <div>
                <Label className={labelCls}>WhatsApp</Label>
                <IconInput
                  icon={MessageCircle}
                  placeholder="+52 …"
                  value={(form as any).contact_whatsapp || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set('contact_whatsapp' as any, e.target.value)
                  }
                  disabled={ro || loading}
                />
              </div>

              <div>
                <Label className={labelCls}>Sitio Web</Label>
                <IconInput
                  icon={Globe}
                  placeholder="https://…"
                  value={(form as any).website || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set('website' as any, e.target.value)
                  }
                  disabled={ro || loading}
                />
              </div>

              <div>
                <Label className={labelCls}>Máximo de Miembros</Label>
                <IconInput
                  icon={Users}
                  type="number"
                  min="0"
                  placeholder="Sin límite"
                  value={(form as any).max_members || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    set('max_members' as any, e.target.value ? parseInt(e.target.value) : undefined)
                  }
                  disabled={ro || loading}
                />
              </div>
            </div>
          </div>

          {/* ── 3. Location ───────────────────────────────────────────────── */}
          <div>
            <SectionHeading icon={MapPin}>Ubicación</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className={labelCls}>
                  Estado <span className="text-red-400">*</span>
                </Label>
                <Input
                  className={fieldCls}
                  placeholder="Estado"
                  value={form.state || ''}
                  onChange={(e) => set('state', e.target.value)}
                  disabled={ro || loading}
                />
                <FieldError msg={errors.state} />
              </div>

              <div>
                <Label className={labelCls}>
                  Ciudad <span className="text-red-400">*</span>
                </Label>
                <Input
                  className={fieldCls}
                  placeholder="Ciudad"
                  value={form.city || ''}
                  onChange={(e) => set('city', e.target.value)}
                  disabled={ro || loading}
                />
                <FieldError msg={errors.city} />
              </div>

              <div className="sm:col-span-2">
                <Label className={labelCls}>Dirección</Label>
                <Input
                  className={fieldCls}
                  placeholder="Dirección completa"
                  value={(form as any).address || ''}
                  onChange={(e) => set('address' as any, e.target.value)}
                  disabled={ro || loading}
                />
              </div>
            </div>
          </div>

          {/* ── 4. Services ───────────────────────────────────────────────── */}
          <div>
            <SectionHeading icon={Layers}>Instalaciones y Servicios</SectionHeading>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4">
              <Toggle
                label="Tiene canchas"
                desc="El club cuenta con canchas propias"
                checked={form.has_courts || false}
                onChange={(v) => set('has_courts', v)}
                disabled={ro || loading}
              />
              {form.has_courts && (
                <div className="pb-3 border-b border-white/[0.04]">
                  <Label className={labelCls}>Número de Canchas</Label>
                  <Input
                    className={cn(fieldCls, 'max-w-[160px]')}
                    type="number"
                    min="0"
                    value={form.court_count || 0}
                    onChange={(e) => set('court_count', parseInt(e.target.value) || 0)}
                    disabled={ro || loading}
                  />
                </div>
              )}
              <Toggle
                label="Ofrece entrenamientos"
                desc="Clases y sesiones de entrenamiento"
                checked={form.offers_training || false}
                onChange={(v) => set('offers_training', v)}
                disabled={ro || loading}
              />
              <Toggle
                label="Ofrece torneos"
                desc="Organiza torneos internos o abiertos"
                checked={form.offers_tournaments || false}
                onChange={(v) => set('offers_tournaments', v)}
                disabled={ro || loading}
              />
              <Toggle
                label="Venta / préstamo de equipo"
                desc="Raquetas, pelotas y accesorios"
                checked={form.offers_equipment || false}
                onChange={(v) => set('offers_equipment', v)}
                disabled={ro || loading}
              />
            </div>
          </div>

          {/* ── 5. Rules ──────────────────────────────────────────────────── */}
          <div>
            <SectionHeading icon={Trophy}>Reglas y Políticas</SectionHeading>
            <div className="space-y-4">
              <div>
                <Label className={labelCls}>Reglas del Club</Label>
                <textarea
                  className={cn(fieldCls, 'h-auto w-full py-2.5 resize-none')}
                  rows={3}
                  placeholder="Reglamento interno del club…"
                  value={(form as any).club_rules || ''}
                  onChange={(e) => set('club_rules' as any, e.target.value)}
                  disabled={ro || loading}
                />
              </div>
              <div>
                <Label className={labelCls}>Código de Vestimenta</Label>
                <Input
                  className={fieldCls}
                  placeholder="Ej: Ropa deportiva obligatoria…"
                  value={(form as any).dress_code || ''}
                  onChange={(e) => set('dress_code' as any, e.target.value)}
                  disabled={ro || loading}
                />
              </div>
            </div>
          </div>

          {/* ── 6. Courts (View mode only) ────────────────────────────────── */}
          {ro && (
            <div>
              <SectionHeading icon={LayoutGrid}>
                Canchas ({courts.length})
              </SectionHeading>
              {courtsLoading ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Loader2 className="w-4 h-4 text-[#ace600] animate-spin" />
                  <p className="text-xs text-white/30">Cargando canchas…</p>
                </div>
              ) : courts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-2">
                    <LayoutGrid className="w-5 h-5 text-white/20" />
                  </div>
                  <p className="text-xs text-white/30">No hay canchas registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.05]">
                        <th className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-3 py-2 text-left">
                          Nombre
                        </th>
                        <th className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-3 py-2 text-left hidden sm:table-cell">
                          Tipo
                        </th>
                        <th className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-3 py-2 text-left hidden md:table-cell">
                          Superficie
                        </th>
                        <th className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-3 py-2 text-left hidden lg:table-cell">
                          Estado
                        </th>
                        <th className="text-[10px] font-bold uppercase tracking-widest text-white/25 px-3 py-2 text-left">
                          Tarifa/h
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {courts.map((court) => (
                        <tr
                          key={court.id}
                          className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-[#ace600]">
                                {court.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-white/70 font-medium truncate">
                                  {court.name}
                                </p>
                                <p className="text-[10px] text-white/30">
                                  ID: {court.id.slice(0, 8)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 hidden sm:table-cell">
                            <span className="text-xs text-white/50 capitalize">
                              {court.court_type || '—'}
                            </span>
                          </td>
                          <td className="px-3 py-3 hidden md:table-cell">
                            <span className="text-xs text-white/50 capitalize">
                              {court.surface || '—'}
                            </span>
                          </td>
                          <td className="px-3 py-3 hidden lg:table-cell">
                            <div className="flex items-center gap-1">
                              {court.is_maintenance ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                  <span className="text-xs text-orange-400 font-medium">
                                    Mantenimiento
                                  </span>
                                </>
                              ) : court.is_available ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-xs text-emerald-400 font-medium">
                                    Disponible
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                  <span className="text-xs text-amber-400 font-medium">
                                    Ocupada
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-xs font-semibold text-[#ace600]">
                              ${court.hourly_rate || '—'}/h
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.06] shrink-0">
          <div>
            {!ro && !isCreate && !showDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDelete(true)}
                disabled={loading}
                className="h-9 px-3.5 rounded-xl border border-red-500/20 bg-red-500/[0.06] hover:bg-red-500/[0.12] text-red-400 hover:text-red-300 text-xs font-semibold gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-9 px-4 rounded-xl border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white hover:border-white/[0.12] text-xs font-semibold"
            >
              {ro ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!ro && (
              <Button
                onClick={handleSave}
                disabled={loading}
                className="h-9 px-4 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold gap-1.5 shadow-[0_0_14px_rgba(172,230,0,0.18)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    {isCreate ? 'Crear Club' : 'Guardar Cambios'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
