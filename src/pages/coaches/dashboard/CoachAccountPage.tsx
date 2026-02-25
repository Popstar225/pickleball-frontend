import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Users, Edit, Trash2, Plus, Award, AlertCircle, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AppDispatch, RootState } from '@/store';
import {
  fetchCoachProfile,
  updateCoachProfile,
  deleteCoachAccount,
  fetchCoachStudents,
  addCoachStudent,
  updateCoachStudent,
} from '@/store/slices/coachDashboardSlice';

// Accent colour tokens
const ACCENT = '#ace600';
const ACCENT_DIM = 'rgba(172,230,0,0.12)';
const ACCENT_BORD = 'rgba(172,230,0,0.25)';

// ── Tiny inline SVG wrapper ─────────────────────────────────────────────────
const Ico = ({ size = 16, children }: { size?: number; children: React.ReactNode }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);
const IcoUser = () => (
  <Ico>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Ico>
);
const IcoAward = () => (
  <Ico>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </Ico>
);
const IcoUsers = () => (
  <Ico>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </Ico>
);
const IcoEdit = () => (
  <Ico>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Ico>
);
const IcoTrash = () => (
  <Ico>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Ico>
);
const IcoPlus = () => (
  <Ico>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Ico>
);
const IcoX = () => (
  <Ico size={15}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Ico>
);
const IcoAlert = () => (
  <Ico size={20}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Ico>
);
const IcoSpin = () => (
  <Ico>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </Ico>
);
const IcoChevron = () => (
  <Ico size={12}>
    <polyline points="6 9 12 15 18 9" />
  </Ico>
);

// ── Shared classes ──────────────────────────────────────────────────────────
const inputCls = `w-full bg-[#111827] border border-white/10 rounded-xl text-[#f0f4ff] text-sm px-3.5 py-2.5
  outline-none transition-all duration-150
  focus:border-[#ace600] focus:ring-2 focus:ring-[#ace600]/20
  disabled:opacity-40 disabled:cursor-not-allowed placeholder:text-white/20`;

const labelCls = 'block text-[11px] font-semibold text-[#4a5a72] uppercase tracking-widest mb-1.5';

// ── Card wrapper ────────────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-[#0d1421] border border-white/[0.06] hover:border-white/10 rounded-2xl overflow-hidden transition-colors ${className}`}
    >
      {children}
    </div>
  );
}

// ── Card section icon + title row ───────────────────────────────────────────
function CardHeading({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
}) {
  return (
    <div className="px-7 pt-6">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, color: ACCENT }}
        >
          {icon}
        </div>
        <span className="font-bold text-base tracking-tight">{title}</span>
      </div>
      {desc && <p className="text-[#4a5a72] text-[13px] mt-1 ml-[42px]">{desc}</p>}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function CoachAccountPage() {
  const { toast } = useToast();
  const dispatch = useDispatch<AppDispatch>();

  const { profile, profileLoading, profileError, students, studentsLoading } = useSelector(
    (state: RootState) => state.coachDashboard,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [newStudent, setNewStudent] = useState({ playerId: '', notes: '' });
  const [isAddingStudentLoading, setIsAddingStudentLoading] = useState(false);

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchCoachProfile());
    dispatch(fetchCoachStudents({ limit: 50, offset: 0 }));
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        username: profile.username || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        state: profile.state || '',
        city: profile.city || '',
        bio: profile.bio || '',
        skillLevel: profile.skillLevel || '0',
        experienceYears: profile.experienceYears || 0,
        hourlyRate: profile.hourlyRate || '',
        specializations: profile.specializations || [],
        certifications: profile.certifications || [],
        languages: profile.languages || [],
        nrtpLevel: profile?.skillLevel || 'N/A',
        // licenseType: profile?.coaching_license_number || 'N/A',
        specialization: profile?.specializations || 'N/A',
        experience: profile?.experienceYears || 'N/A',
      });
    }
  }, [profile]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    try {
      await dispatch(
        updateCoachProfile({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          username: formData.username,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          state: formData.state,
          city: formData.city,
          bio: formData.bio,
          skillLevel: formData.skillLevel,
          experienceYears: formData.experienceYears,
          hourlyRate: formData.hourlyRate,
          specializations: formData.specializations,
          certifications: formData.certifications,
          languages: formData.languages,
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
      await dispatch(deleteCoachAccount('confirm-delete')).unwrap();
      toast({
        title: 'Cuenta eliminada',
        description: 'Tu cuenta ha sido eliminada permanentemente.',
        variant: 'destructive',
      });
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

  const handleAddStudent = async () => {
    if (!newStudent.playerId) {
      toast({
        title: 'Error',
        description: 'Por favor selecciona un jugador.',
        variant: 'destructive',
      });
      return;
    }
    setIsAddingStudentLoading(true);
    try {
      await dispatch(
        addCoachStudent({ playerId: newStudent.playerId, notes: newStudent.notes || '' }),
      ).unwrap();
      setNewStudent({ playerId: '', notes: '' });
      setIsAddingStudent(false);
      dispatch(fetchCoachStudents({ limit: 50, offset: 0 }));
      toast({
        title: 'Estudiante agregado',
        description: 'El estudiante ha sido registrado exitosamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo agregar el estudiante',
        variant: 'destructive',
      });
    } finally {
      setIsAddingStudentLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      await dispatch(
        updateCoachStudent({ studentId, studentData: { status: 'inactive' } }),
      ).unwrap();
      dispatch(fetchCoachStudents({ limit: 50, offset: 0 }));
      toast({
        title: 'Estudiante removido',
        description: 'El estudiante ha sido marcado como inactivo.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo remover el estudiante',
        variant: 'destructive',
      });
    }
  };

  const initials = formData?.fullName
    ? formData.fullName
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
    : '??';

  const activeCount = (students || []).filter((s: any) => s.status === 'active').length;

  // ── Loading / error states ─────────────────────────────────────────────
  if (profileLoading && !formData) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="animate-spin" style={{ color: ACCENT }}>
          <IcoSpin />
        </span>
      </div>
    );
  }

  if (profileError && !formData) {
    return (
      <div className="bg-red-950/60 border border-red-800 rounded-2xl p-6 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-red-200 font-medium">Error al cargar el perfil</p>
          <p className="text-red-300 text-sm mt-1">{profileError}</p>
        </div>
      </div>
    );
  }

  if (!formData) return null;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080c14] text-[#f0f4ff]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap'); * { font-family: 'DM Sans', sans-serif; } .syne { font-family: 'Syne', sans-serif; }`}</style>

      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-6">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-6 pb-8 border-b border-white/[0.06]">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div
                className="w-[72px] h-[72px] rounded-[18px] bg-gradient-to-br from-[#1e3a5f] to-[#0f2847] border border-white/10 flex items-center justify-center syne text-2xl font-bold"
                style={{ color: ACCENT }}
              >
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#080c14]" />
            </div>
            <div>
              <h1 className="syne text-2xl font-bold tracking-tight leading-tight">
                {formData.fullName || 'Mi Cuenta'}
              </h1>
              <p className="text-[#7a8ba8] text-sm mt-1">
                @{formData.username} · Entrenador Certificado
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setIsEditing(!isEditing)}
              disabled={profileLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[#f0f4ff] bg-transparent hover:bg-white/5 disabled:opacity-40 transition-all"
            >
              <IcoEdit /> {isEditing ? 'Cancelar' : 'Editar Perfil'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={profileLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/15 disabled:opacity-40 transition-all"
            >
              <IcoTrash /> Eliminar Cuenta
            </button>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-3 divide-x divide-white/[0.06] bg-[#111827] rounded-2xl overflow-hidden border border-white/[0.06]">
          {[
            { val: formData.experienceYears, lbl: 'Años de experiencia' },
            { val: activeCount, lbl: 'Estudiantes activos' },
            { val: formData.skillLevel, lbl: 'Nivel de habilidad' },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="flex flex-col gap-1 px-6 py-5">
              <span className="syne text-3xl font-bold tracking-tight" style={{ color: ACCENT }}>
                {val}
              </span>
              <span className="text-xs text-[#4a5a72]">{lbl}</span>
            </div>
          ))}
        </div>

        {/* ── Personal Info ── */}
        <Card>
          <CardHeading
            icon={<IcoUser />}
            title="Información Personal"
            desc="Datos personales y de contacto"
          />
          <div className="px-7 py-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(
                [
                  { label: 'Nombre Completo', key: 'fullName' },
                  { label: 'Nombre de Usuario', key: 'username' },
                  { label: 'Correo Electrónico', key: 'email', type: 'email' },
                  { label: 'Teléfono', key: 'phone' },
                  { label: 'Estado', key: 'state' },
                  { label: 'Ciudad', key: 'city' },
                  { label: 'Tarifa por Hora', key: 'hourlyRate' },
                  { label: 'Nivel de Habilidad', key: 'skillLevel', type: 'number', step: '0.1' },
                ] as const
              ).map(({ label, key, type = 'text', step }: any) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <input
                    className={inputCls}
                    type={type}
                    step={step}
                    value={formData[key] || ''}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    disabled={!isEditing || profileLoading}
                  />
                </div>
              ))}

              {/* Date of birth */}
              <div>
                <label className={labelCls}>Fecha de Nacimiento</label>
                <input
                  className={inputCls}
                  type="date"
                  value={formData.dateOfBirth?.split('T')[0] || ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  disabled={!isEditing || profileLoading}
                />
              </div>

              {/* Gender */}
              <div>
                <label className={labelCls}>Género</label>
                <div className="relative">
                  <select
                    className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    disabled={!isEditing || profileLoading}
                  >
                    <option value="">Selecciona género</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4a5a72]">
                    <IcoChevron />
                  </span>
                </div>
              </div>

              {/* Experience years */}
              <div>
                <label className={labelCls}>Años de Experiencia</label>
                <input
                  className={inputCls}
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData({ ...formData, experienceYears: parseInt(e.target.value) })
                  }
                  disabled={!isEditing || profileLoading}
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className={labelCls}>Biografía</label>
              <textarea
                className={`${inputCls} resize-y min-h-[88px]`}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing || profileLoading}
              />
            </div>

            {/* Specializations */}
            {formData.specializations?.length > 0 && (
              <div>
                <label className={labelCls}>Especializaciones</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.specializations.map((s: string) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        background: ACCENT_DIM,
                        border: `1px solid ${ACCENT_BORD}`,
                        color: ACCENT,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {formData.languages?.length > 0 && (
              <div>
                <label className={labelCls}>Idiomas</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.languages.map((l: string) => (
                    <span
                      key={l}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-[#7a8ba8]"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Save / Cancel */}
            {isEditing && (
              <div className="flex gap-2.5 pt-4 border-t border-white/[0.06]">
                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold syne disabled:opacity-50 transition-all"
                  style={{ background: ACCENT, color: '#080c14' }}
                >
                  {profileLoading ? (
                    <>
                      <span className="animate-spin">
                        <IcoSpin />
                      </span>{' '}
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  disabled={profileLoading}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[#f0f4ff] hover:bg-white/5 disabled:opacity-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </Card>

        {/* ── Credentials ── */}
        <Card>
          <CardHeading icon={<IcoAward />} title="Credenciales de Entrenador" />
          <div className="px-7 py-6 flex flex-col gap-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  lbl: 'Nivel NRTP',
                  val: formData.nrtpLevel,
                  badge: 'Verificado',
                  badgeStyle: {
                    background: ACCENT_DIM,
                    border: `1px solid ${ACCENT_BORD}`,
                    color: ACCENT,
                  },
                },
                {
                  lbl: 'Tipo de Licencia',
                  val: formData.licenseType,
                  badge: 'Activa',
                  badgeStyle: {
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    color: '#34d399',
                  },
                },
                { lbl: 'Especialización', val: formData.specialization, badge: null },
                { lbl: 'Experiencia', val: formData.experience, badge: null },
              ].map(({ lbl, val, badge, badgeStyle }: any) => (
                <div
                  key={lbl}
                  className="bg-[#111827] border border-white/[0.06] rounded-xl p-4 flex flex-col gap-2.5"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a5a72]">
                    {lbl}
                  </span>
                  <span className="syne text-xl font-bold tracking-tight">{val}</span>
                  {badge && (
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold w-fit"
                      style={badgeStyle}
                    >
                      {badge}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {formData.certifications?.length > 0 && (
              <div>
                <label className={labelCls}>Certificaciones</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.certifications.map((c: string) => (
                    <span
                      key={c}
                      className="px-3 py-1 rounded-lg text-xs font-semibold"
                      style={{
                        background: ACCENT_DIM,
                        border: `1px solid ${ACCENT_BORD}`,
                        color: ACCENT,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ── Students ── */}
        <Card>
          <div className="flex items-start justify-between gap-3 px-7 pt-6">
            <div>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: ACCENT_DIM,
                    border: `1px solid ${ACCENT_BORD}`,
                    color: ACCENT,
                  }}
                >
                  <IcoUsers />
                </div>
                <span className="font-bold text-base tracking-tight">Mis Estudiantes</span>
              </div>
              <p className="text-[#4a5a72] text-[13px] mt-1 ml-[42px]">
                Gestiona tus estudiantes y sus sesiones
              </p>
            </div>
            <button
              onClick={() => setIsAddingStudent(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold syne shrink-0 transition-all"
              style={{ background: ACCENT, color: '#080c14' }}
            >
              <IcoPlus /> Agregar
            </button>
          </div>

          <div className="px-7 py-5 overflow-x-auto">
            {studentsLoading ? (
              <div className="flex justify-center py-10">
                <span className="animate-spin" style={{ color: ACCENT }}>
                  <IcoSpin />
                </span>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Estudiante', 'Nivel', 'Estado', 'Acciones'].map((h) => (
                      <th
                        key={h}
                        className="pb-3 text-left text-[11px] font-semibold uppercase tracking-widest text-[#4a5a72] px-3 first:pl-0"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(students || []).map((student: any) => (
                    <tr
                      key={student.id}
                      className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-3 first:pl-0">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#0f2847] border border-white/10 flex items-center justify-center syne text-[13px] font-bold shrink-0"
                            style={{ color: ACCENT }}
                          >
                            {student.firstName?.[0]}
                            {student.lastName?.[0]}
                          </div>
                          <span className="font-medium text-sm">
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold syne"
                          style={{
                            background: 'rgba(245,158,11,0.1)',
                            border: '1px solid rgba(245,158,11,0.2)',
                            color: '#fbbf24',
                          }}
                        >
                          {student.level}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        {student.status === 'active' ? (
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold"
                            style={{
                              background: 'rgba(16,185,129,0.12)',
                              border: '1px solid rgba(16,185,129,0.25)',
                              color: '#34d399',
                            }}
                          >
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-white/5 border border-white/10 text-[#4a5a72]">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1">
                          <button
                            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(172,230,0,0.12)]"
                            style={{ color: ACCENT }}
                          >
                            Ver Detalles
                          </button>
                          {student.status === 'active' && (
                            <button
                              onClick={() => handleRemoveStudent(student.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all flex items-center"
                            >
                              <IcoTrash />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>

      {/* ── Add Student Modal ── */}
      {isAddingStudent && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setIsAddingStudent(false)}
        >
          <div
            className="bg-[#0d1421] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between px-7 pt-6">
              <div>
                <h2 className="syne text-lg font-bold">Agregar Nuevo Estudiante</h2>
                <p className="text-[#7a8ba8] text-[13px] mt-1">
                  Registra un nuevo estudiante en tu programa de coaching
                </p>
              </div>
              <button
                onClick={() => setIsAddingStudent(false)}
                className="text-[#4a5a72] hover:text-[#f0f4ff] transition-colors p-1"
              >
                <IcoX />
              </button>
            </div>

            <div className="px-7 py-5 flex flex-col gap-4">
              <div>
                <label className={labelCls}>ID del Jugador</label>
                <input
                  className={inputCls}
                  value={newStudent.playerId}
                  onChange={(e) => setNewStudent({ ...newStudent, playerId: e.target.value })}
                  placeholder="ID del jugador"
                />
              </div>
              <div>
                <label className={labelCls}>Notas (opcional)</label>
                <textarea
                  className={`${inputCls} resize-y`}
                  style={{ minHeight: 72 }}
                  value={newStudent.notes}
                  onChange={(e) => setNewStudent({ ...newStudent, notes: e.target.value })}
                  placeholder="Notas sobre el estudiante"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 px-7 pb-6 pt-2 border-t border-white/[0.06]">
              <button
                onClick={() => setIsAddingStudent(false)}
                disabled={isAddingStudentLoading}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[#f0f4ff] hover:bg-white/5 disabled:opacity-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddStudent}
                disabled={isAddingStudentLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold syne disabled:opacity-50 transition-all"
                style={{ background: ACCENT, color: '#080c14' }}
              >
                {isAddingStudentLoading ? (
                  <>
                    <span className="animate-spin">
                      <IcoSpin />
                    </span>{' '}
                    Agregando...
                  </>
                ) : (
                  'Agregar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-6"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-[#0d1421] border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-7 pt-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="w-11 h-11 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                  <IcoAlert />
                </div>
                <h2 className="syne text-lg font-bold">¿Eliminar cuenta?</h2>
                <p className="text-[#7a8ba8] text-[13px] mt-2 leading-relaxed">
                  Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todos
                  los datos asociados, incluyendo estudiantes y sesiones.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-[#4a5a72] hover:text-[#f0f4ff] transition-colors p-1 shrink-0 ml-4"
              >
                <IcoX />
              </button>
            </div>

            <div className="flex justify-end gap-2.5 px-7 pb-6 pt-5 border-t border-white/[0.06] mt-5">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[#f0f4ff] hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={profileLoading}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition-all"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
