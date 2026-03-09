import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../../store';
import { updateUser, deleteUser } from '../../../../store/slices/usersSlice';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  X, Loader2, AlertTriangle, User as UserIcon, Building2,
  MapPin, Shield, Edit2, Eye, Trash2, Check,
} from 'lucide-react';
import { User, UpdateUserRequest } from '../../../../types/api';
import { cn } from '@/lib/utils';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const inputCls =
  'h-10 rounded-xl text-sm bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20 ' +
  'focus-visible:ring-0 focus-visible:border-[#ace600]/50 focus-visible:bg-[#ace600]/[0.03] transition-all';

const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5';

const selectCls =
  'h-10 rounded-xl text-sm bg-white/[0.04] border-white/[0.09] text-white ' +
  'focus:ring-0 focus:border-[#ace600]/50 transition-all data-[placeholder]:text-white/20';

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean; user: User | null; mode: 'view' | 'edit';
  onClose: () => void; onSaveSuccess?: () => void;
}

// ─── Atoms ────────────────────────────────────────────────────────────────────
function StatusPill({ active, trueLabel = 'Sí', falseLabel = 'No' }: { active: boolean; trueLabel?: string; falseLabel?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider',
      active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
             : 'bg-white/[0.04] text-white/25 border-white/[0.08]',
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', active ? 'bg-emerald-400' : 'bg-white/20')} />
      {active ? trueLabel : falseLabel}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
      <span className="text-[11px] font-bold uppercase tracking-widest text-white/20 shrink-0">{label}</span>
      <span className="text-xs text-white/60 text-right truncate">{value || '—'}</span>
    </div>
  );
}

function Field({ label, req, error, children }: { label: string; req?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}{req && <span className="text-[#ace600] ml-0.5">*</span>}</label>
      {children}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-[11px] text-red-400/80">
          <AlertTriangle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/[0.04] last:border-0">
      <div>
        <p className="text-xs font-semibold text-white/70">{label}</p>
        {desc && <p className="text-[10px] text-white/25 mt-0.5">{desc}</p>}
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className="relative shrink-0 transition-all duration-200 focus:outline-none"
        style={{ background: checked ? '#ace600' : 'rgba(255,255,255,0.1)', borderRadius: 999, height: 22, width: 40 }}>
        <span className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }} />
      </button>
    </div>
  );
}

// ─── Skill levels ─────────────────────────────────────────────────────────────
const SKILL_LEVELS = [
  { value: '2.5', label: '2.5 — Principiante' },
  { value: '3.0', label: '3.0 — Intermedio Bajo' },
  { value: '3.5', label: '3.5 — Intermedio' },
  { value: '4.0', label: '4.0 — Intermedio Alto' },
  { value: '4.5', label: '4.5 — Avanzado' },
  { value: '5.0', label: '5.0 — Profesional' },
  { value: '5.5', label: '5.5 — Élite' },
];
const MEMBERSHIP_OPTIONS = [
  { value: 'free',    label: 'Gratuita' },
  { value: 'basic',   label: 'Básica' },
  { value: 'pro',     label: 'Pro' },
  { value: 'premium', label: 'Premium' },
  { value: 'expired', label: 'Expirada' },
];
const TAB_CFG = [
  { value: 'personal', label: 'Personal',  icon: UserIcon  },
  { value: 'business', label: 'Negocio',   icon: Building2 },
  { value: 'location', label: 'Ubicación', icon: MapPin    },
] as const;

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function UserActionModal({ isOpen, user, mode, onClose, onSaveSuccess }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((s: RootState) => s.users);

  const [form,              setForm]              = useState<UpdateUserRequest>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors,            setErrors]            = useState<Record<string, string>>({});

  const VALID_FIELDS: (keyof UpdateUserRequest)[] = [
    'full_name','date_of_birth','gender','phone','profile_photo','skill_level',
    'state','city','address','latitude','longitude','business_name','contact_person',
    'job_title','curp','rfc','website','membership_status','membership_expires_at',
    'is_active','is_verified','club_id',
  ];

  useEffect(() => {
    if (user && isOpen) {
      const init: Record<string, any> = {};
      VALID_FIELDS.forEach(f => { const v = user[f as keyof User]; if (v != null) init[f] = v; });
      setForm(init as UpdateUserRequest);
      setErrors({});
      setShowDeleteConfirm(false);
    }
  }, [user, isOpen]);

  useEffect(() => { if (!isOpen) setShowDeleteConfirm(false); }, [isOpen]);

  const set = (field: keyof UpdateUserRequest, val: any) => {
    setForm(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors(p => { const n = { ...p }; delete n[field]; return n; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.full_name?.trim()) e.full_name = 'Nombre completo es requerido';
    if (form.latitude != null) {
      const v = parseFloat(String(form.latitude));
      if (isNaN(v) || v < -90 || v > 90) e.latitude = 'Latitud: -90 a 90';
    }
    if (form.longitude != null) {
      const v = parseFloat(String(form.longitude));
      if (isNaN(v) || v < -180 || v > 180) e.longitude = 'Longitud: -180 a 180';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = async () => {
    if (!user || !validate()) return;
    try {
      const clean: Record<string, any> = {};
      VALID_FIELDS.forEach(f => { const v = form[f]; if (v != null && v !== '') clean[f] = v; });
      const result = await dispatch(updateUser({ id: user.id, userData: clean as UpdateUserRequest })).unwrap();
      if (result) { onClose(); onSaveSuccess?.(); }
    } catch (e: any) { setErrors(p => ({ ...p, submit: e?.message || 'Error al actualizar' })); }
  };

  const handleDelete = async () => {
    if (!user) return;
    try {
      await dispatch(deleteUser(user.id)).unwrap();
      setShowDeleteConfirm(false);
      onClose(); onSaveSuccess?.();
    } catch (e: any) { setErrors(p => ({ ...p, submit: e?.message || 'Error al eliminar' })); }
  };

  if (!user) return null;

  const initials = user.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Dialog open={isOpen} onOpenChange={open => { if (!open && !showDeleteConfirm) onClose(); }}>
        <DialogContent className="bg-[#0d1117] border-white/[0.09] rounded-2xl p-0 overflow-hidden max-w-2xl max-h-[90vh] overflow-y-auto">

          {/* Top accent */}
          <div className={cn('h-0.5', mode === 'edit'
            ? 'bg-gradient-to-r from-[#ace600]/60 via-[#ace600]/30 to-transparent'
            : 'bg-gradient-to-r from-sky-400/50 via-sky-400/25 to-transparent')} />

          <div className="p-6">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <DialogHeader className="mb-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-2xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-sm font-black text-[#ace600] shrink-0 select-none">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <DialogTitle className="text-base font-bold text-white leading-tight">
                        {mode === 'view' ? 'Ver Usuario' : 'Editar Usuario'}
                      </DialogTitle>
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider shrink-0',
                        mode === 'edit'
                          ? 'bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]'
                          : 'bg-sky-500/10 border-sky-500/20 text-sky-400',
                      )}>
                        {mode === 'edit' ? <Edit2 className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                        {mode === 'edit' ? 'Edición' : 'Vista'}
                      </span>
                    </div>
                    <DialogDescription className="text-[11px] text-white/30 truncate">
                      {user.full_name} · @{user.username}
                    </DialogDescription>
                  </div>
                </div>
                <button onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/[0.07] text-white/25 hover:text-white hover:bg-white/[0.06] transition-all shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </DialogHeader>

            {/* ── Status pills ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {[
                { label: 'Tipo', value: user.user_type,         color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
                { label: 'Plan', value: user.membership_status, color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/20' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={cn('flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border', bg)}>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">{label}</p>
                  <p className={cn('text-[11px] font-bold capitalize', color)}>{value || '—'}</p>
                </div>
              ))}
              <div className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Activo</p>
                <StatusPill active={!!user.is_active} trueLabel="Sí" falseLabel="No" />
              </div>
              <div className="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/20">Verificado</p>
                <StatusPill active={!!user.is_verified} trueLabel="Sí" falseLabel="No" />
              </div>
            </div>

            {/* ── Content tabs ─────────────────────────────────────────────── */}
            <Tabs defaultValue="personal">
              <TabsList className="flex h-auto w-full gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 mb-4">
                {TAB_CFG.map(({ value, label, icon: Icon }) => (
                  <TabsTrigger key={value} value={value}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-[11px] font-semibold text-white/30 hover:text-white/55 transition-all data-[state=active]:bg-[#ace600] data-[state=active]:text-black data-[state=active]:font-bold data-[state=active]:shadow-[0_0_8px_rgba(172,230,0,0.15)]">
                    <Icon className="w-3 h-3 shrink-0" />{label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* ── VIEW MODE ────────────────────────────────────────────── */}
              {mode === 'view' ? (
                <>
                  <TabsContent value="personal">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4">
                      <DetailRow label="Nombre"     value={user.full_name} />
                      <DetailRow label="Usuario"    value={user.username} />
                      <DetailRow label="Email"      value={user.email} />
                      <DetailRow label="Teléfono"   value={user.phone} />
                      <DetailRow label="Nivel NRTP" value={user.skill_level} />
                    </div>
                  </TabsContent>
                  <TabsContent value="business">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4">
                      <DetailRow label="Negocio"   value={user.business_name} />
                      <DetailRow label="Contacto"  value={user.contact_person} />
                      <DetailRow label="Puesto"    value={user.job_title} />
                      <DetailRow label="CURP"      value={user.curp} />
                      <DetailRow label="RFC"       value={user.rfc} />
                      <DetailRow label="Sitio Web" value={user.website} />
                    </div>
                  </TabsContent>
                  <TabsContent value="location">
                    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4">
                      <DetailRow label="Estado"    value={user.state} />
                      <DetailRow label="Ciudad"    value={user.city} />
                      <DetailRow label="Dirección" value={user.address} />
                      <DetailRow label="Latitud"   value={user.latitude?.toString()} />
                      <DetailRow label="Longitud"  value={user.longitude?.toString()} />
                    </div>
                  </TabsContent>

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    {[
                      { label: 'Creado',       value: new Date(user.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) },
                      { label: 'Actualizado',  value: new Date(user.updated_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">{label}</p>
                        <p className="text-xs font-semibold text-white/55">{value}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* ── EDIT MODE ─────────────────────────────────────────── */
                <>
                  <TabsContent value="personal" className="space-y-3">
                    <Field label="Nombre Completo" req error={errors.full_name}>
                      <Input className={cn(inputCls, errors.full_name && 'border-red-500/40 focus-visible:border-red-500/60')}
                        placeholder="Nombre completo"
                        value={form.full_name ?? ''}
                        onChange={e => set('full_name', e.target.value)} />
                    </Field>
                    <Field label="Teléfono">
                      <Input className={inputCls} placeholder="+52 55 0000 0000"
                        value={form.phone ?? ''}
                        onChange={e => set('phone', e.target.value)} />
                    </Field>
                    <Field label="Nivel de Habilidad (NRTP)">
                      <Select value={form.skill_level ?? ''} onValueChange={v => set('skill_level', v)}>
                        <SelectTrigger className={selectCls}><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger>
                        <SelectContent className="bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl">
                          {SKILL_LEVELS.map(s => (
                            <SelectItem key={s.value} value={s.value} className="text-white/70 focus:bg-white/[0.06] focus:text-white">
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </TabsContent>

                  <TabsContent value="business" className="space-y-3">
                    {[
                      { key: 'business_name',  label: 'Nombre de Negocio',    ph: 'Nombre del negocio' },
                      { key: 'contact_person', label: 'Persona de Contacto',  ph: 'Nombre del contacto' },
                      { key: 'job_title',      label: 'Puesto',               ph: 'Puesto o título' },
                      { key: 'curp',           label: 'CURP',                 ph: 'CURP' },
                      { key: 'rfc',            label: 'RFC',                  ph: 'RFC' },
                      { key: 'website',        label: 'Sitio Web',            ph: 'https://example.com' },
                    ].map(({ key, label, ph }) => (
                      <Field key={key} label={label}>
                        <Input className={inputCls} placeholder={ph}
                          value={(form as any)[key] ?? ''}
                          onChange={e => set(key as keyof UpdateUserRequest, e.target.value)} />
                      </Field>
                    ))}
                  </TabsContent>

                  <TabsContent value="location" className="space-y-3">
                    {[
                      { key: 'state',   label: 'Estado',    ph: 'Estado',    type: 'text' },
                      { key: 'city',    label: 'Ciudad',    ph: 'Ciudad',    type: 'text' },
                      { key: 'address', label: 'Dirección', ph: 'Dirección', type: 'text' },
                    ].map(({ key, label, ph }) => (
                      <Field key={key} label={label}>
                        <Input className={inputCls} placeholder={ph}
                          value={(form as any)[key] ?? ''}
                          onChange={e => set(key as keyof UpdateUserRequest, e.target.value)} />
                      </Field>
                    ))}
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Latitud" error={errors.latitude}>
                        <Input type="number" className={cn(inputCls, errors.latitude && 'border-red-500/40')}
                          placeholder="-90 a 90"
                          value={form.latitude?.toString() ?? ''}
                          onChange={e => set('latitude', e.target.value ? parseFloat(e.target.value) : null)} />
                      </Field>
                      <Field label="Longitud" error={errors.longitude}>
                        <Input type="number" className={cn(inputCls, errors.longitude && 'border-red-500/40')}
                          placeholder="-180 a 180"
                          value={form.longitude?.toString() ?? ''}
                          onChange={e => set('longitude', e.target.value ? parseFloat(e.target.value) : null)} />
                      </Field>
                    </div>
                  </TabsContent>
                </>
              )}
            </Tabs>

            {/* ── Edit-only: status block ──────────────────────────────────── */}
            {mode === 'edit' && (
              <div className="mt-4 bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
                  <div className="w-6 h-6 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
                    <Shield className="w-3 h-3 text-[#ace600]" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Estado y Membresía</p>
                </div>
                <div className="p-4 space-y-1">
                  <Field label="Plan de Membresía">
                    <Select value={form.membership_status ?? ''} onValueChange={v => set('membership_status', v)}>
                      <SelectTrigger className={selectCls}><SelectValue placeholder="Seleccionar plan" /></SelectTrigger>
                      <SelectContent className="bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl">
                        {MEMBERSHIP_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value} className="text-white/70 focus:bg-white/[0.06] focus:text-white">
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="mt-3 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4">
                    <Toggle label="Usuario Activo" desc="El usuario puede acceder a la plataforma"
                      checked={!!form.is_active} onChange={v => set('is_active', v)} />
                    <Toggle label="Usuario Verificado" desc="Verificación de identidad completada"
                      checked={!!form.is_verified} onChange={v => set('is_verified', v)} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Submit error ─────────────────────────────────────────────── */}
            {errors.submit && (
              <div className="mt-4 flex items-start gap-2.5 p-3.5 bg-red-500/[0.06] border border-red-500/15 rounded-xl">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400/80">{errors.submit}</p>
              </div>
            )}

            {/* ── Footer actions ───────────────────────────────────────────── */}
            <div className="flex gap-2 mt-5 pt-4 border-t border-white/[0.06]">
              {mode === 'edit' ? (
                <>
                  <button onClick={onClose} disabled={loading}
                    className="h-9 px-4 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white disabled:opacity-40 transition-all">
                    Cancelar
                  </button>
                  <button onClick={() => setShowDeleteConfirm(true)} disabled={loading}
                    className="h-9 px-4 rounded-xl text-xs font-bold border border-red-500/20 bg-red-500/[0.06] hover:bg-red-500/[0.12] text-red-400 disabled:opacity-40 transition-all">
                    <Trash2 className="w-3.5 h-3.5 inline mr-1.5" />Eliminar
                  </button>
                  <button onClick={handleSave} disabled={loading}
                    className="ml-auto h-9 px-5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.18)] disabled:opacity-50 transition-all">
                    {loading
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Guardando…</>
                      : <><Check className="w-3.5 h-3.5" />Guardar Cambios</>}
                  </button>
                </>
              ) : (
                <button onClick={onClose}
                  className="ml-auto h-9 px-5 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white transition-all">
                  Cerrar
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm ───────────────────────────────────────────────────── */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-[#0d1117] border-white/[0.09] rounded-2xl p-0 overflow-hidden max-w-sm">
          <div className="h-0.5 bg-red-500/50" />
          <div className="p-6">
            <AlertDialogHeader>
              <div className="w-11 h-11 rounded-2xl bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <AlertDialogTitle className="text-base font-bold text-white mb-1">
                ¿Eliminar este usuario?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-white/35 leading-relaxed">
                Esta acción no se puede deshacer. Se eliminarán permanentemente la cuenta de{' '}
                <span className="font-semibold text-white/55">{user.full_name}</span> y todos sus datos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2 mt-5 flex-row">
              <AlertDialogCancel className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs font-semibold transition-all">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={loading}
                className="flex-1 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold border-0 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all">
                {loading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Eliminando…</>
                  : <>Sí, eliminar</>}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}