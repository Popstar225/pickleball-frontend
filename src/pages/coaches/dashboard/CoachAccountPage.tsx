import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { AppDispatch, RootState } from '@/store';
import {
  fetchCoachProfile, updateCoachProfile, deleteCoachAccount,
  fetchCoachStudents, addCoachStudent, updateCoachStudent,
} from '@/store/slices/coachDashboardSlice';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  User, Award, Users, Edit2, Trash2, Plus, AlertTriangle,
  Loader2, CheckCircle2, X, Save, ShieldCheck, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const inputCls =
  'h-10 rounded-xl text-sm bg-white/[0.04] border-white/[0.09] text-white placeholder:text-white/20 ' +
  'focus-visible:ring-0 focus-visible:border-[#ace600]/50 focus-visible:bg-[#ace600]/[0.03] transition-all ' +
  'disabled:opacity-30 disabled:cursor-not-allowed';

const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1.5';
const selectTriggerCls =
  'h-10 rounded-xl text-sm bg-white/[0.04] border-white/[0.09] text-white focus:ring-0 focus:border-[#ace600]/50 transition-all data-[placeholder]:text-white/20 disabled:opacity-30';

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Field({ label, req, children }: { label: string; req?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}{req && <span className="text-[#ace600] ml-0.5">*</span>}</label>
      {children}
    </div>
  );
}

function SectionCard({ icon: Icon, iconColor, iconBg, title, desc, action, children }: {
  icon: React.ElementType; iconColor: string; iconBg: string;
  title: string; desc?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-[#ace600]/30 via-[#ace600]/15 to-transparent" />
      <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center shrink-0', iconBg)}>
            <Icon className={cn('w-4 h-4', iconColor)} />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{title}</p>
            {desc && <p className="text-[11px] text-white/25 mt-0.5">{desc}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function Initials({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const letters = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const sz = size === 'lg' ? 'w-16 h-16 rounded-2xl text-lg' : size === 'md' ? 'w-9 h-9 rounded-xl text-[11px]' : 'w-7 h-7 rounded-lg text-[9px]';
  return (
    <div className={cn('bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center font-black text-[#ace600] shrink-0 select-none', sz)}>
      {letters || '?'}
    </div>
  );
}

function Tag({ label, color = 'lime' }: { label: string; color?: 'lime' | 'muted' }) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest',
      color === 'lime'
        ? 'bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]'
        : 'bg-white/[0.04] border-white/[0.08] text-white/35',
    )}>
      {label}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function CoachAccountPage() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const { profile, profileLoading, profileError, students, studentsLoading } =
    useSelector((state: RootState) => state.coachDashboard);

  const [isEditing,           setIsEditing]           = useState(false);
  const [isAddingStudent,     setIsAddingStudent]     = useState(false);
  const [showDeleteConfirm,   setShowDeleteConfirm]   = useState(false);
  const [formData,            setFormData]            = useState<any>(null);
  const [newStudent,          setNewStudent]          = useState({ playerId: '', notes: '' });
  const [addingStudentLoading,setAddingStudentLoading]= useState(false);

  useEffect(() => {
    dispatch(fetchCoachProfile());
    dispatch(fetchCoachStudents({ limit: 50, offset: 0 }));
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName:        profile.fullName || '',
        email:           profile.email || '',
        phone:           profile.phone || '',
        username:        profile.username || '',
        dateOfBirth:     profile.dateOfBirth || '',
        gender:          profile.gender || '',
        state:           profile.state || '',
        city:            profile.city || '',
        bio:             profile.bio || '',
        skillLevel:      profile.skillLevel || '0',
        experienceYears: profile.experienceYears || 0,
        hourlyRate:      profile.hourlyRate || '',
        specializations: profile.specializations || [],
        certifications:  profile.certifications || [],
        languages:       profile.languages || [],
        nrtpLevel:       profile?.skillLevel || 'N/A',
        specialization:  profile?.specializations || 'N/A',
        experience:      profile?.experienceYears || 'N/A',
      });
    }
  }, [profile]);

  const set = (k: string, v: any) => setFormData((p: any) => ({ ...p, [k]: v }));

  const handleSaveProfile = async () => {
    try {
      await dispatch(updateCoachProfile({
        fullName: formData.fullName, email: formData.email, phone: formData.phone,
        username: formData.username, dateOfBirth: formData.dateOfBirth, gender: formData.gender,
        state: formData.state, city: formData.city, bio: formData.bio,
        skillLevel: formData.skillLevel, experienceYears: formData.experienceYears,
        hourlyRate: formData.hourlyRate, specializations: formData.specializations,
        certifications: formData.certifications, languages: formData.languages,
      })).unwrap();
      setIsEditing(false);
      toast({ title: 'Perfil actualizado', description: 'Cambios guardados exitosamente.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'No se pudo actualizar', variant: 'destructive' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteCoachAccount('confirm-delete')).unwrap();
      toast({ title: 'Cuenta eliminada', description: 'Tu cuenta fue eliminada.', variant: 'destructive' });
      setTimeout(() => { window.location.href = '/auth/login'; }, 2000);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'No se pudo eliminar', variant: 'destructive' });
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.playerId) {
      toast({ title: 'Error', description: 'Selecciona un jugador.', variant: 'destructive' });
      return;
    }
    setAddingStudentLoading(true);
    try {
      await dispatch(addCoachStudent({ playerId: newStudent.playerId, notes: newStudent.notes || '' })).unwrap();
      setNewStudent({ playerId: '', notes: '' });
      setIsAddingStudent(false);
      dispatch(fetchCoachStudents({ limit: 50, offset: 0 }));
      toast({ title: 'Estudiante agregado', description: 'Registrado exitosamente.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'No se pudo agregar', variant: 'destructive' });
    } finally { setAddingStudentLoading(false); }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await dispatch(updateCoachStudent({ studentId, studentData: { status: 'inactive' } })).unwrap();
      dispatch(fetchCoachStudents({ limit: 50, offset: 0 }));
      toast({ title: 'Estudiante removido', description: 'Marcado como inactivo.' });
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'No se pudo remover', variant: 'destructive' });
    }
  };

  const activeCount = (students || []).filter((s: any) => s.status === 'active').length;

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (profileLoading && !formData) return (
    <div className="flex flex-col items-center justify-center h-96 gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
      <p className="text-xs text-white/20">Cargando perfil…</p>
    </div>
  );

  if (profileError && !formData) return (
    <div className="flex items-start gap-3 p-4 bg-red-500/[0.06] border border-red-500/15 rounded-2xl">
      <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
        <AlertTriangle className="w-4 h-4 text-red-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-red-400 mb-0.5">Error al cargar el perfil</p>
        <p className="text-xs text-red-400/60">{profileError}</p>
      </div>
    </div>
  );

  if (!formData) return null;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 max-w-5xl mx-auto">

      {/* ── Profile header ──────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        <div className="h-0.5 bg-gradient-to-r from-[#ace600]/50 via-[#ace600]/25 to-transparent" />
        <div className="p-6 flex flex-wrap items-start justify-between gap-5">

          {/* Identity */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <Initials name={formData.fullName || '??'} size="lg" />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0d1117]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-[20px] font-black text-white tracking-tight">
                  {formData.fullName || 'Mi Cuenta'}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
                  <ShieldCheck className="w-2.5 h-2.5" /> Coach
                </span>
              </div>
              <p className="text-xs text-white/30">@{formData.username} · Entrenador Certificado</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={() => setIsEditing(!isEditing)} disabled={profileLoading}
              className={cn(
                'inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[11px] font-bold border transition-all disabled:opacity-40',
                isEditing
                  ? 'border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50'
                  : 'border-[#ace600]/20 bg-[#ace600]/[0.07] hover:bg-[#ace600]/[0.14] text-[#ace600]',
              )}>
              {isEditing ? <><X className="w-3.5 h-3.5" /> Cancelar</> : <><Edit2 className="w-3.5 h-3.5" /> Editar Perfil</>}
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} disabled={profileLoading}
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-[11px] font-bold border border-red-500/20 bg-red-500/[0.06] hover:bg-red-500/[0.12] text-red-400 disabled:opacity-40 transition-all">
              <Trash2 className="w-3.5 h-3.5" /> Eliminar Cuenta
            </button>
          </div>
        </div>

        {/* Stat strip */}
        <div className="grid grid-cols-3 border-t border-white/[0.05] divide-x divide-white/[0.05]">
          {[
            { value: formData.experienceYears, label: 'Años exp.', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { value: activeCount,              label: 'Estudiantes',  icon: Users, color: 'text-sky-400',  bg: 'bg-sky-500/10 border-sky-500/20' },
            { value: formData.skillLevel,      label: 'Nivel NRTP',   icon: Award, color: 'text-[#ace600]', bg: 'bg-[#ace600]/10 border-[#ace600]/20' },
          ].map(({ value, label, icon: Icon, color, bg }) => (
            <div key={label} className="flex items-center gap-3 px-6 py-4">
              <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center shrink-0', bg)}>
                <Icon className={cn('w-3.5 h-3.5', color)} />
              </div>
              <div>
                <p className={cn('text-xl font-black leading-none', color)}>{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Personal Info ───────────────────────────────────────────────────── */}
      <SectionCard
        icon={User} iconColor="text-[#ace600]" iconBg="bg-[#ace600]/10 border-[#ace600]/20"
        title="Información Personal" desc="Datos personales y de contacto">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Nombre Completo', key: 'fullName', req: true },
              { label: 'Nombre de Usuario', key: 'username' },
              { label: 'Correo Electrónico', key: 'email', type: 'email' },
              { label: 'Teléfono', key: 'phone' },
              { label: 'Estado', key: 'state' },
              { label: 'Ciudad', key: 'city' },
              { label: 'Tarifa por Hora', key: 'hourlyRate' },
              { label: 'Nivel de Habilidad', key: 'skillLevel', type: 'number' },
              { label: 'Años de Experiencia', key: 'experienceYears', type: 'number' },
            ].map(({ label, key, req, type = 'text' }) => (
              <Field key={key} label={label} req={req}>
                <Input
                  className={inputCls} type={type}
                  value={formData[key] ?? ''}
                  onChange={e => set(key, type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                  disabled={!isEditing || profileLoading} />
              </Field>
            ))}

            <Field label="Fecha de Nacimiento">
              <Input className={inputCls} type="date"
                value={formData.dateOfBirth?.split('T')[0] || ''}
                onChange={e => set('dateOfBirth', e.target.value)}
                disabled={!isEditing || profileLoading} />
            </Field>

            <Field label="Género">
              <Select value={formData.gender || ''} onValueChange={v => set('gender', v)} disabled={!isEditing || profileLoading}>
                <SelectTrigger className={selectTriggerCls}><SelectValue placeholder="Selecciona género" /></SelectTrigger>
                <SelectContent className="bg-[#161c25] border-white/[0.08] rounded-xl shadow-2xl">
                  <SelectItem value="male"   className="text-white/70 focus:bg-white/[0.06] focus:text-white">Masculino</SelectItem>
                  <SelectItem value="female" className="text-white/70 focus:bg-white/[0.06] focus:text-white">Femenino</SelectItem>
                  <SelectItem value="other"  className="text-white/70 focus:bg-white/[0.06] focus:text-white">Otro</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Bio */}
          <Field label="Biografía">
            <textarea
              rows={3}
              value={formData.bio || ''}
              onChange={e => set('bio', e.target.value)}
              disabled={!isEditing || profileLoading}
              placeholder="Cuéntanos sobre ti…"
              className={cn(
                'w-full rounded-xl text-sm px-3.5 py-2.5 resize-y',
                'bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20',
                'outline-none focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03] transition-all',
                'disabled:opacity-30 disabled:cursor-not-allowed',
              )} />
          </Field>

          {/* Specializations */}
          {formData.specializations?.length > 0 && (
            <div>
              <label className={labelCls}>Especializaciones</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {formData.specializations.map((s: string) => <Tag key={s} label={s} color="lime" />)}
              </div>
            </div>
          )}

          {/* Languages */}
          {formData.languages?.length > 0 && (
            <div>
              <label className={labelCls}>Idiomas</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {formData.languages.map((l: string) => <Tag key={l} label={l} color="muted" />)}
              </div>
            </div>
          )}

          {/* Save bar */}
          {isEditing && (
            <div className="flex gap-2 pt-4 border-t border-white/[0.06]">
              <button onClick={handleSaveProfile} disabled={profileLoading}
                className="inline-flex items-center gap-1.5 h-9 px-5 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.18)] disabled:opacity-50 transition-all">
                {profileLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Guardando…</> : <><Save className="w-3.5 h-3.5" />Guardar Cambios</>}
              </button>
              <button onClick={() => setIsEditing(false)} disabled={profileLoading}
                className="h-9 px-4 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white disabled:opacity-40 transition-all">
                Cancelar
              </button>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Credentials ─────────────────────────────────────────────────────── */}
      <SectionCard
        icon={Award} iconColor="text-amber-400" iconBg="bg-amber-500/10 border-amber-500/20"
        title="Credenciales de Entrenador">
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Nivel NRTP',       value: formData.nrtpLevel,       badge: 'Verificado', badgeCls: 'bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]' },
              { label: 'Tipo de Licencia', value: formData.licenseType,     badge: 'Activa',     badgeCls: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
              { label: 'Especialización',  value: formData.specialization,  badge: null,          badgeCls: '' },
              { label: 'Experiencia',      value: formData.experience,      badge: null,          badgeCls: '' },
            ].map(({ label, value, badge, badgeCls }) => (
              <div key={label}
                className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{label}</p>
                <p className="text-lg font-black text-white/70 leading-tight truncate">{value ?? '—'}</p>
                {badge && (
                  <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider w-fit', badgeCls)}>
                    <CheckCircle2 className="w-2.5 h-2.5" />{badge}
                  </span>
                )}
              </div>
            ))}
          </div>

          {formData.certifications?.length > 0 && (
            <div>
              <label className={labelCls}>Certificaciones</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {formData.certifications.map((c: string) => <Tag key={c} label={c} color="lime" />)}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ── Students ────────────────────────────────────────────────────────── */}
      <SectionCard
        icon={Users} iconColor="text-sky-400" iconBg="bg-sky-500/10 border-sky-500/20"
        title="Mis Estudiantes" desc="Gestiona tus estudiantes y sus sesiones"
        action={
          <button onClick={() => setIsAddingStudent(true)}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[11px] font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_10px_rgba(172,230,0,0.15)] transition-all shrink-0">
            <Plus className="w-3.5 h-3.5" /> Agregar
          </button>
        }>
        {studentsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
          </div>
        ) : (students || []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Users className="w-8 h-8 text-white/[0.07]" />
            <p className="text-xs text-white/20">Sin estudiantes todavía</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['Estudiante', 'Nivel', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="px-6 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-white/20 first:pl-6">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(students || []).map((student: any) => {
                  const initials = `${student.firstName?.[0] ?? ''}${student.lastName?.[0] ?? ''}`;
                  return (
                    <tr key={student.id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center text-[10px] font-black text-[#ace600] shrink-0">
                            {initials || '?'}
                          </div>
                          <span className="text-xs font-bold text-white/70 group-hover:text-white transition-colors">
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-amber-500/10 border-amber-500/20 text-amber-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {student.level}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        {student.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-white/[0.04] border-white/[0.08] text-white/25">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/20" /> Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button className="h-7 px-2.5 rounded-lg text-[10px] font-bold border border-[#ace600]/20 bg-[#ace600]/[0.06] hover:bg-[#ace600]/[0.12] text-[#ace600] transition-all">
                            Ver Detalles
                          </button>
                          {student.status === 'active' && (
                            <button onClick={() => handleRemoveStudent(student.id)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center border border-red-500/20 bg-red-500/[0.06] hover:bg-red-500/[0.12] text-red-400 transition-all">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ── Add Student Dialog ───────────────────────────────────────────────── */}
      <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
        <DialogContent className="bg-[#0d1117] border-white/[0.09] rounded-2xl p-0 overflow-hidden max-w-md">
          <div className="h-0.5 bg-gradient-to-r from-[#ace600]/50 via-[#ace600]/25 to-transparent" />
          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-[#ace600]" />
                </div>
                <DialogTitle className="text-base font-bold text-white">Agregar Estudiante</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-white/25 ml-11">
                Registra un nuevo estudiante en tu programa de coaching
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Field label="ID del Jugador" req>
                <Input className={inputCls} placeholder="ID del jugador"
                  value={newStudent.playerId}
                  onChange={e => setNewStudent(p => ({ ...p, playerId: e.target.value }))} />
              </Field>
              <Field label="Notas (opcional)">
                <textarea rows={3} placeholder="Notas sobre el estudiante…"
                  value={newStudent.notes}
                  onChange={e => setNewStudent(p => ({ ...p, notes: e.target.value }))}
                  className={cn(
                    'w-full rounded-xl text-sm px-3.5 py-2.5 resize-y',
                    'bg-white/[0.04] border border-white/[0.09] text-white placeholder:text-white/20',
                    'outline-none focus:border-[#ace600]/50 transition-all',
                  )} />
              </Field>
            </div>

            <div className="flex gap-2 mt-5 pt-4 border-t border-white/[0.06]">
              <button onClick={() => setIsAddingStudent(false)} disabled={addingStudentLoading}
                className="flex-1 h-9 rounded-xl text-xs font-semibold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white disabled:opacity-40 transition-all">
                Cancelar
              </button>
              <button onClick={handleAddStudent} disabled={addingStudentLoading}
                className="flex-1 h-9 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.18)] disabled:opacity-50 transition-all">
                {addingStudentLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Agregando…</> : <>Agregar Estudiante</>}
              </button>
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
                ¿Eliminar tu cuenta?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs text-white/35 leading-relaxed">
                Esta acción no se puede deshacer. Se eliminarán permanentemente tu cuenta, estudiantes y todas las sesiones registradas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex gap-2 mt-5 flex-row">
              <AlertDialogCancel className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs font-semibold transition-all">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAccount} disabled={profileLoading}
                className="flex-1 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-xs font-bold border-0 inline-flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all">
                {profileLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Eliminando…</> : 'Sí, eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}