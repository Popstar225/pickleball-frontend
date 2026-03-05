import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { AppDispatch, RootState } from '@/store';
import {
  fetchPlayerProfile,
  updatePlayerProfile,
  deletePlayerAccount,
} from '@/store/slices/playerDashboardSlice';
import { Autocomplete } from '@/components/ui/autocomplete';
import { getFullImageUrl } from '@/common/tools';
import {
  User, Activity, Shield, Mail, Phone, Calendar, MapPin,
  Edit, Save, X, Trash2, Camera, Upload, Trophy, Star,
  Swords, Bell, Loader2, AlertTriangle, Check, ChevronDown,
} from 'lucide-react';

// ─── Mexico States ────────────────────────────────────────────────────────────
const mexicoStates: Record<string, string> = {
  AG:'Aguascalientes', BC:'Baja California', BS:'Baja California Sur', CH:'Chihuahua',
  CL:'Colima', CM:'Campeche', CO:'Coahuila', CS:'Chiapas', DF:'Ciudad de México',
  DG:'Durango', GR:'Guerrero', GT:'Guanajuato', HG:'Hidalgo', JA:'Jalisco',
  ME:'Estado de México', MI:'Michoacán', MO:'Morelos', NA:'Nayarit', NL:'Nuevo León',
  OA:'Oaxaca', PB:'Puebla', QE:'Querétaro', QR:'Quintana Roo', SI:'Sinaloa',
  SL:'San Luis Potosí', SO:'Sonora', TB:'Tabasco', TL:'Tlaxcala', TM:'Tamaulipas',
  VE:'Veracruz', YU:'Yucatán', ZA:'Zacatecas',
};

const NAV_TABS = [
  { id: 'profile',     label: 'Perfil',        icon: User     },
  { id: 'stats',       label: 'Estadísticas',  icon: Activity },
  { id: 'preferences', label: 'Preferencias',  icon: Bell     },
];

// ─── Shared tokens ────────────────────────────────────────────────────────────
const inputCls =
  'w-full h-10 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-white ' +
  'placeholder:text-white/20 px-3 outline-none transition-all duration-150 ' +
  'focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03] ' +
  'disabled:opacity-35 disabled:cursor-not-allowed';

const selectCls =
  `${inputCls} appearance-none pr-8 cursor-pointer`;

const labelCls = 'block text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5';

// ─── Atoms ────────────────────────────────────────────────────────────────────
function SectionHeading({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-6 h-6 rounded-md bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3 h-3 text-[#ace600]" />
      </div>
      <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-white/30">{children}</span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, editing, type = 'text', onChange, disabled }: {
  icon: React.ElementType; label: string; value: string; editing: boolean;
  type?: string; onChange?: (v: string) => void; disabled?: boolean;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {editing ? (
        <input className={inputCls} type={type} value={value}
          onChange={e => onChange?.(e.target.value)} disabled={disabled} />
      ) : (
        <div className="flex items-center gap-2.5 h-10 px-0">
          <Icon className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
          <span className="text-sm text-white/65">{value || <span className="text-white/20 italic">—</span>}</span>
        </div>
      )}
    </div>
  );
}

function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(defaultChecked ?? true);
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-white/[0.04] last:border-0">
      <div>
        <p className="text-sm font-medium text-white/75">{label}</p>
        <p className="text-[11px] text-white/30 mt-0.5">{desc}</p>
      </div>
      <button onClick={() => setOn(v => !v)} type="button"
        className="relative shrink-0 rounded-full transition-all duration-200 focus:outline-none"
        style={{ width: 40, height: 22, background: on ? '#ace600' : 'rgba(255,255,255,0.1)' }}>
        <span className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: on ? 'translateX(18px)' : 'translateX(0)' }} />
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function PlayerAccountPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { profile, profileLoading, profileError } = useSelector((s: RootState) => s.playerDashboard);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    id: '', fullName: '', dateOfBirth: '', age: 0, gender: '', state: '',
    curp: '', ineOrPassport: '', nrtpLevel: 'Intermedio', email: '', phone: '',
    profilePhoto: '', username: '', membershipStatus: '', city: '', bio: '',
    emergencyContact: '', medicalInfo: '', joinedDate: '', lastActive: '',
    totalTournaments: 0, ranking: null as any, currentClub: null as any,
  });

  useEffect(() => { dispatch(fetchPlayerProfile()); }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setForm({
        id: profile.id || '', fullName: profile.fullName || '',
        dateOfBirth: profile.dateOfBirth || '',
        age: typeof profile.age === 'number' ? profile.age : parseInt(profile.age as string) || 0,
        gender: profile.gender || '', state: profile.state || '', curp: profile.curp || '',
        ineOrPassport: profile.ineOrPassport || '', nrtpLevel: profile.nrtpLevel || 'Intermedio',
        email: profile.email || '', phone: profile.phone || '',
        profilePhoto: profile.profilePhoto || '', username: profile.username || '',
        membershipStatus: profile.membershipStatus || '', city: profile.city || '',
        bio: profile.bio || '', emergencyContact: profile.emergencyContact || '',
        medicalInfo: profile.medicalInfo || '', joinedDate: profile.joinedDate || '',
        lastActive: profile.lastActive || '', totalTournaments: profile.totalTournaments || 0,
        ranking: profile.ranking || null, currentClub: profile.currentClub || null,
      });
      if (profile.profilePhoto) setPreviewUrl(getFullImageUrl(profile.profilePhoto));
    }
  }, [profile]);

  const set = (field: string, val: any) => setForm(p => ({ ...p, [field]: val }));

  const handleSave = async () => {
    try {
      const fd = new FormData();
      const data: Record<string, any> = {
        id: form.id, full_name: form.fullName, date_of_birth: form.dateOfBirth,
        age: form.age, gender: form.gender, state: form.state, curp: form.curp,
        ine_passport_file: form.ineOrPassport, skill_level: form.nrtpLevel,
        email: form.email, phone: form.phone, username: form.username,
        city: form.city, bio: form.bio, emergency_contact: form.emergencyContact,
        medical_info: form.medicalInfo,
      };
      Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') fd.append(k, v as any); });
      if (selectedFile) fd.set('profile_photo', selectedFile);
      await dispatch(updatePlayerProfile(fd));
      setSelectedFile(null);
      setIsEditing(false);
      toast({ title: 'Perfil actualizado', description: 'Tu información ha sido guardada.' });
    } catch (err: any) {
      toast({ title: 'Error al guardar', description: err?.message || 'No se pudo actualizar', variant: 'destructive' });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        id: profile.id || '', fullName: profile.fullName || '', dateOfBirth: profile.dateOfBirth || '',
        age: typeof profile.age === 'number' ? profile.age : parseInt(profile.age as string) || 0,
        gender: profile.gender || '', state: profile.state || '', curp: profile.curp || '',
        ineOrPassport: profile.ineOrPassport || '', nrtpLevel: profile.nrtpLevel || 'Intermedio',
        email: profile.email || '', phone: profile.phone || '', profilePhoto: profile.profilePhoto || '',
        username: profile.username || '', membershipStatus: profile.membershipStatus || '',
        city: profile.city || '', bio: profile.bio || '', emergencyContact: profile.emergencyContact || '',
        medicalInfo: profile.medicalInfo || '', joinedDate: profile.joinedDate || '',
        lastActive: profile.lastActive || '', totalTournaments: profile.totalTournaments || 0,
        ranking: profile.ranking || null, currentClub: profile.currentClub || null,
      });
      setSelectedFile(null);
      setPreviewUrl(getFullImageUrl(profile.profilePhoto) || null);
    }
    setIsEditing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast({ title: 'Archivo inválido', variant: 'destructive' }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: 'Archivo muy grande (máx 5 MB)', variant: 'destructive' }); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = ev => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deletePlayerAccount('confirm-delete')).unwrap();
      toast({ title: 'Cuenta eliminada', variant: 'destructive' });
      setTimeout(() => { window.location.href = '/auth/login'; }, 2000);
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message, variant: 'destructive' });
    }
  };

  const initials = form.fullName.split(' ').filter(Boolean).map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'JP';

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (profileLoading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
        <p className="text-xs text-white/25">Cargando perfil…</p>
      </div>
    );
  }
  if (profileError && !profile) {
    return (
      <div className="flex items-start gap-3 p-5 bg-red-500/[0.06] border border-red-500/15 rounded-2xl">
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-300">Error al cargar el perfil</p>
          <p className="text-xs text-red-400/70 mt-0.5">{profileError}</p>
        </div>
      </div>
    );
  }

  const statusCfg = form.membershipStatus === 'active'
    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    : 'bg-amber-500/10 text-amber-400 border-amber-500/20';

  return (
    <div className="space-y-6 p-1">

      {/* ── Profile hero card ──────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
        {/* banner */}
        <div className="h-20 bg-gradient-to-r from-[#0f1e3a] via-[#0d1117] to-[#0f2040]" />

        <div className="px-6 pb-5 -mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          {/* avatar + info */}
          <div className="flex items-end gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-2xl border-2 border-[#0d1117] overflow-hidden shadow-xl bg-gradient-to-br from-[#1a2744] to-[#0f1e3a] flex items-center justify-center text-xl font-bold text-[#ace600]">
                {previewUrl
                  ? <img src={previewUrl} alt="Perfil" className="w-full h-full object-cover" />
                  : initials
                }
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-[#0d1117] border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-[#ace600] transition-colors">
                {selectedFile ? <Upload className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
              </button>
              {selectedFile && (
                <button onClick={handleSave}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#ace600] flex items-center justify-center"
                  title="Guardar foto">
                  <Check className="w-3 h-3 text-black" />
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            </div>

            <div className="pb-0.5">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-white leading-tight">{form.fullName || 'Tu Nombre'}</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg}`}>
                  {form.membershipStatus || 'Activo'}
                </span>
              </div>
              <p className="text-xs text-white/30 mb-2">@{form.username || '—'}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600]">
                  <Star className="w-2.5 h-2.5" /> {form.nrtpLevel}
                </span>
                {form.city && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400">
                    <MapPin className="w-2.5 h-2.5" /> {form.city}
                  </span>
                )}
                {form.joinedDate && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/30">
                    <Calendar className="w-2.5 h-2.5" /> Desde {new Date(form.joinedDate).getFullYear()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-2 pb-0.5">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/50 hover:text-white text-xs font-semibold transition-all">
                <Edit className="w-3.5 h-3.5" /> Editar Perfil
              </button>
            ) : (
              <>
                <button onClick={handleSave} disabled={profileLoading}
                  className="flex items-center gap-1.5 h-8 px-4 rounded-xl bg-[#ace600] hover:bg-[#c0f000] text-black text-xs font-bold transition-all disabled:opacity-50 shadow-[0_0_14px_rgba(172,230,0,0.2)]">
                  {profileLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {profileLoading ? 'Guardando…' : 'Guardar'}
                </button>
                <button onClick={handleCancel} disabled={profileLoading}
                  className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-white/[0.08] text-white/40 hover:text-white text-xs font-semibold transition-all">
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              </>
            )}
            <button onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-red-500/20 text-red-400 bg-red-500/[0.06] hover:bg-red-500/[0.12] text-xs font-semibold transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* stat strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.05] border-t border-white/[0.05]">
          {[
            { label: 'Nivel', value: form.nrtpLevel || '—' },
            { label: 'Membresía', value: form.membershipStatus || 'Basic' },
            { label: 'Torneos', value: form.totalTournaments },
            { label: 'Último Login', value: form.lastActive ? new Date(form.lastActive).toLocaleDateString('es-MX') : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="px-5 py-3.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1">{label}</p>
              <p className="text-sm font-bold text-[#ace600] truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab nav ───────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1.5 bg-[#0d1117] border border-white/[0.07] rounded-2xl w-fit">
        {NAV_TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === id
                ? 'bg-[#ace600] text-black'
                : 'text-white/35 hover:text-white/60 hover:bg-white/[0.04]'
            }`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ══ PROFILE TAB ═══════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

          {/* Left col: bio + contact */}
          <div className="md:col-span-2 bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 space-y-5">
            <SectionHeading icon={User}>Sobre mí</SectionHeading>

            <div>
              <label className={labelCls}>Biografía</label>
              {isEditing
                ? <textarea className={`${inputCls} h-auto py-2.5 resize-none`} rows={4}
                    value={form.bio} onChange={e => set('bio', e.target.value)}
                    placeholder="Cuéntanos sobre ti…" disabled={profileLoading} />
                : <p className="text-sm text-white/50 leading-relaxed">
                    {form.bio || <span className="text-white/20 italic">Sin biografía aún.</span>}
                  </p>
              }
            </div>

            <div className="h-px bg-white/[0.05]" />

            <div className="space-y-3">
              <InfoRow icon={Mail}     label="Correo"            value={form.email}       editing={false} />
              <InfoRow icon={Phone}    label="Teléfono"          value={form.phone}       editing={isEditing} onChange={v => set('phone', v)}    disabled={profileLoading} />
              <InfoRow icon={Calendar} label="Fecha de Nacimiento" value={form.dateOfBirth?.split('T')[0] || ''} editing={isEditing} type="date" onChange={v => set('dateOfBirth', v)} disabled={profileLoading} />
              <InfoRow icon={MapPin}   label="Ciudad"            value={form.city}        editing={isEditing} onChange={v => set('city', v)}     disabled={profileLoading} />
            </div>
          </div>

          {/* Right col: main form */}
          <div className="md:col-span-3 bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 space-y-5">
            <SectionHeading icon={Shield}>Información Personal</SectionHeading>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelCls}>Nombre Completo</label>
                <input className={inputCls} type="text" value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  disabled={!isEditing || profileLoading} placeholder="Tu nombre completo" />
              </div>

              <div>
                <label className={labelCls}>Nombre de Usuario</label>
                <input className={inputCls} type="text" value={form.username}
                  onChange={e => set('username', e.target.value)}
                  disabled={!isEditing || profileLoading} placeholder="@usuario" />
              </div>

              <div>
                <label className={labelCls}>Nivel de Habilidad</label>
                <div className="relative">
                  <select className={selectCls} value={form.nrtpLevel}
                    onChange={e => set('nrtpLevel', e.target.value)}
                    disabled={!isEditing || profileLoading}>
                    {['Principiante', 'Intermedio', 'Avanzado', 'Profesional'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Género</label>
                <div className="relative">
                  <select className={selectCls} value={form.gender}
                    onChange={e => set('gender', e.target.value)}
                    disabled={!isEditing || profileLoading}>
                    <option value="">Seleccionar…</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelCls}>Estado</label>
                <Autocomplete
                  options={Object.values(mexicoStates)}
                  value={form.state || profile?.state || ''}
                  onChange={v => set('state', v)}
                  disabled={!isEditing || profileLoading}
                  placeholder="Selecciona estado…"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="h-px bg-white/[0.05]" />

            {/* Emergency section */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Información de Emergencia</p>

              <div>
                <label className={labelCls}>CURP</label>
                <input className={inputCls} type="text" value={form.curp}
                  onChange={e => set('curp', e.target.value)}
                  disabled={!isEditing || profileLoading} placeholder="CURP del jugador" />
              </div>
              <div>
                <label className={labelCls}>Contacto de Emergencia</label>
                <input className={inputCls} type="text" value={form.emergencyContact}
                  onChange={e => set('emergencyContact', e.target.value)}
                  disabled={!isEditing || profileLoading} placeholder="Nombre y teléfono" />
              </div>
              <div>
                <label className={labelCls}>Información Médica</label>
                <textarea className={`${inputCls} h-auto py-2.5 resize-none`} rows={3}
                  value={form.medicalInfo} onChange={e => set('medicalInfo', e.target.value)}
                  disabled={!isEditing || profileLoading} placeholder="Alergias, condiciones, medicamentos…" />
              </div>
            </div>

            {/* Editing hint */}
            {isEditing && (
              <div className="flex items-center gap-2.5 bg-[#ace600]/[0.06] border border-[#ace600]/15 rounded-xl px-4 py-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ace600] animate-pulse flex-shrink-0" />
                <p className="text-xs text-[#ace600]/80 font-medium">Modo edición activo. Recuerda guardar los cambios.</p>
              </div>
            )}

            {/* Danger zone */}
            <div className="flex items-center justify-between p-4 bg-red-500/[0.04] border border-red-500/12 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-red-300">Zona de peligro</p>
                <p className="text-[11px] text-red-400/50 mt-0.5">Eliminar tu cuenta permanentemente</p>
              </div>
              <button onClick={() => setShowDelete(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-all">
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ STATS TAB ═════════════════════════════════════════════════════════ */}
      {activeTab === 'stats' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Nivel de Habilidad', value: form.nrtpLevel || '—', icon: Swords       },
              { label: 'Membresía',          value: form.membershipStatus || 'Basic', icon: Trophy },
              { label: 'Verificación',       value: profile?.is_verified ? 'Verificado' : 'Pendiente', icon: Shield },
              { label: 'Torneos',            value: String(form.totalTournaments), icon: Trophy  },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4">
                <div className="w-7 h-7 rounded-lg bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center mb-3">
                  <Icon className="w-3.5 h-3.5 text-[#ace600]" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-1">{label}</p>
                <p className="text-lg font-bold text-[#ace600]">{value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-white/25" />
                <span className="text-sm font-semibold text-white/60">Detalles de Membresía</span>
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {[
                { label: 'Estado de Membresía', value: form.membershipStatus || 'Basic', badge: true },
                { label: 'Verificado',          value: profile?.is_verified ? 'Sí' : 'No', badge: false },
                { label: 'Último Login',        value: form.lastActive ? new Date(form.lastActive).toLocaleDateString('es-MX') : 'Nunca', badge: false },
                { label: 'Tipo de Usuario',     value: profile?.user_type || 'player', badge: false },
                { label: 'Torneos Totales',     value: String(form.totalTournaments), badge: false },
              ].map(({ label, value, badge }) => (
                <div key={label} className="flex items-center justify-between px-5 py-3.5">
                  <span className="text-sm text-white/40">{label}</span>
                  {badge
                    ? <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#ace600]/10 border border-[#ace600]/20 text-[#ace600]">{value}</span>
                    : <span className="text-sm font-semibold text-white/70">{value}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ PREFERENCES TAB ══════════════════════════════════════════════════ */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Play prefs */}
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 space-y-4">
            <SectionHeading icon={Swords}>Preferencias de Juego</SectionHeading>

            <div>
              <label className={labelCls}>Nivel de Habilidad</label>
              <div className="relative">
                <select className={selectCls} value={form.nrtpLevel}
                  onChange={e => set('nrtpLevel', e.target.value)}
                  disabled={!isEditing || profileLoading}>
                  {['Principiante', 'Intermedio', 'Avanzado', 'Profesional'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Mano Dominante</label>
              <div className="relative">
                <select className={`${selectCls} opacity-40 cursor-not-allowed`} disabled>
                  {['Ambas', 'Derecha', 'Izquierda'].map(g => <option key={g}>{g}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
              </div>
              <p className="mt-1 text-[10px] text-white/20">Próximamente disponible</p>
            </div>

            {!isEditing && (
              <p className="text-[11px] text-white/25">Haz clic en "Editar Perfil" para modificar estas preferencias.</p>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
            <SectionHeading icon={Bell}>Notificaciones</SectionHeading>
            <div>
              <Toggle label="Torneos próximos"     desc="Alertas sobre torneos cercanos a ti"        defaultChecked />
              <Toggle label="Mensajes de clubes"   desc="Notificaciones de tus clubes afiliados"     defaultChecked />
              <Toggle label="Resultados"           desc="Actualizaciones de torneos en que participas" defaultChecked={false} />
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm dialog ──────────────────────────────────────────── */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setShowDelete(false)}>
          <div className="bg-[#0d1117] border border-white/[0.08] rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="w-11 h-11 rounded-2xl bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center mb-4">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-base font-bold text-white mb-1">¿Eliminar cuenta?</h2>
              <p className="text-sm text-white/35 leading-relaxed">
                Esta acción no se puede deshacer. Se eliminarán permanentemente tu cuenta y todos los datos asociados.
              </p>
            </div>
            <div className="flex gap-2.5 px-6 pb-6">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all">
                Cancelar
              </button>
              <button onClick={handleDeleteAccount}
                className="flex-1 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-bold transition-all shadow-[0_0_16px_rgba(239,68,68,0.2)]">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}