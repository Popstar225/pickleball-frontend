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

// ── Accent tokens ────────────────────────────────────────────────────────────
const ACCENT = '#ace600';
const ACCENT_DIM = 'rgba(172,230,0,0.12)';
const ACCENT_BORD = 'rgba(172,230,0,0.25)';

// ── Mexico States ────────────────────────────────────────────────────────────
const mexicoStates: Record<string, string> = {
  AG: 'Aguascalientes',
  BC: 'Baja California',
  BS: 'Baja California Sur',
  CH: 'Chihuahua',
  CL: 'Colima',
  CM: 'Campeche',
  CO: 'Coahuila',
  CS: 'Chiapas',
  DF: 'Federal District',
  DG: 'Durango',
  GR: 'Guerrero',
  GT: 'Guanajuato',
  HG: 'Hidalgo',
  JA: 'Jalisco',
  ME: 'México State',
  MI: 'Michoacán',
  MO: 'Morelos',
  NA: 'Nayarit',
  NL: 'Nuevo León',
  OA: 'Oaxaca',
  PB: 'Puebla',
  QE: 'Querétaro',
  QR: 'Quintana Roo',
  SI: 'Sinaloa',
  SL: 'San Luis Potosí',
  SO: 'Sonora',
  TB: 'Tabasco',
  TL: 'Tlaxcala',
  TM: 'Tamaulipas',
  VE: 'Veracruz',
  YU: 'Yucatán',
  ZA: 'Zacatecas',
};

const NAV_TABS = [
  { id: 'profile', label: 'Perfil' },
  { id: 'stats', label: 'Estadísticas' },
  { id: 'preferences', label: 'Preferencias' },
];

// ── SVG icon wrapper ─────────────────────────────────────────────────────────
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
const IcoActivity = () => (
  <Ico>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </Ico>
);
const IcoShield = () => (
  <Ico>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </Ico>
);
const IcoMail = () => (
  <Ico>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </Ico>
);
const IcoPhone = () => (
  <Ico>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.54 4.9 2 2 0 0 1 3.5 2.72h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </Ico>
);
const IcoCal = () => (
  <Ico>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Ico>
);
const IcoPin = () => (
  <Ico>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Ico>
);
const IcoEdit = () => (
  <Ico>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Ico>
);
const IcoSave = () => (
  <Ico>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </Ico>
);
const IcoX = () => (
  <Ico size={15}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Ico>
);
const IcoTrash = () => (
  <Ico>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Ico>
);
const IcoCamera = () => (
  <Ico>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 0 2-2l2-3h12l2 3a2 2 0 0 0 2 2v11z" />
    <circle cx="12" cy="13" r="4" />
  </Ico>
);
const IcoUpload = () => (
  <Ico>
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </Ico>
);
const IcoTrophy = () => (
  <Ico>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </Ico>
);
const IcoStar = () => (
  <Ico>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Ico>
);
const IcoSpin = () => (
  <Ico>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </Ico>
);
const IcoAlert = () => (
  <Ico size={20}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </Ico>
);
const IcoBell = () => (
  <Ico>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </Ico>
);
const IcoChevron = () => (
  <Ico size={12}>
    <polyline points="6 9 12 15 18 9" />
  </Ico>
);
const IcoSwords = () => (
  <Ico>
    <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
    <line x1="13" y1="19" x2="19" y2="13" />
    <line x1="16" y1="16" x2="20" y2="20" />
    <line x1="19" y1="21" x2="21" y2="19" />
  </Ico>
);

// ── Shared classes ────────────────────────────────────────────────────────────
const inputCls = `w-full bg-[#111827] border border-white/10 rounded-xl text-[#f0f4ff] text-sm px-3.5 py-2.5
  outline-none transition-all duration-150
  focus:border-[#ace600] focus:ring-2 focus:ring-[#ace600]/20
  disabled:opacity-40 disabled:cursor-not-allowed placeholder:text-white/20`;

const labelCls = 'block text-[11px] font-semibold text-[#4a5a72] uppercase tracking-widest mb-1.5';

// ── Reusable card shell ───────────────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-[#0d1421] border border-white/[0.06] hover:border-white/10 rounded-2xl overflow-hidden transition-colors ${className}`}
    >
      {children}
    </div>
  );
}

// ── Card section heading ──────────────────────────────────────────────────────
function SectionHead({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 mb-5">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}`, color: ACCENT }}
      >
        {icon}
      </div>
      <div>
        <p className="syne font-bold text-base text-[#f0f4ff] leading-tight">{title}</p>
        {desc && <p className="text-[#4a5a72] text-[13px] mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PlayerAccountPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { profile, profileLoading, profileError } = useSelector(
    (state: RootState) => state.playerDashboard,
  );

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    dateOfBirth: '',
    age: 0,
    gender: '',
    state: '',
    curp: '',
    ineOrPassport: '',
    nrtpLevel: 'Intermedio',
    email: '',
    phone: '',
    profilePhoto: '',
    username: '',
    membershipStatus: '',
    city: '',
    bio: '',
    emergencyContact: '',
    medicalInfo: '',
    joinedDate: '',
    lastActive: '',
    totalTournaments: 0,
    ranking: null as any,
    currentClub: null as any,
  });

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchPlayerProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        id: profile.id || '',
        fullName: profile.fullName || '',
        dateOfBirth: profile.dateOfBirth || '',
        age: typeof profile.age === 'number' ? profile.age : parseInt(profile.age as string) || 0,
        gender: profile.gender || '',
        state: profile.state || '',
        curp: profile.curp || '',
        ineOrPassport: profile.ineOrPassport || '',
        nrtpLevel: profile.nrtpLevel || 'Intermedio',
        email: profile.email || '',
        phone: profile.phone || '',
        profilePhoto: profile.profilePhoto || '',
        username: profile.username || '',
        membershipStatus: profile.membershipStatus || '',
        city: profile.city || '',
        bio: profile.bio || '',
        emergencyContact: profile.emergencyContact || '',
        medicalInfo: profile.medicalInfo || '',
        joinedDate: profile.joinedDate || '',
        lastActive: profile.lastActive || '',
        totalTournaments: profile.totalTournaments || 0,
        ranking: profile.ranking || null,
        currentClub: profile.currentClub || null,
      });
      if (profile.profilePhoto) setPreviewUrl(getFullImageUrl(profile.profilePhoto));
    }
  }, [profile]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    try {
      const updateData = new FormData();
      const apiData: Record<string, any> = {
        id: formData.id,
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth,
        age: formData.age,
        gender: formData.gender,
        state: formData.state,
        curp: formData.curp,
        ine_passport_file: formData.ineOrPassport,
        skill_level: formData.nrtpLevel,
        email: formData.email,
        phone: formData.phone,
        profile_photo: formData.profilePhoto,
        username: formData.username,
        membership_status: formData.membershipStatus,
        city: formData.city,
        bio: formData.bio,
        emergency_contact: formData.emergencyContact,
        medical_info: formData.medicalInfo,
        createdAt: formData.joinedDate,
        last_login: formData.lastActive,
        totalTournaments: formData.totalTournaments,
        ranking: formData.ranking,
        currentClub: formData.currentClub,
      };
      Object.entries(apiData).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') updateData.append(k, v as any);
      });
      if (selectedFile) updateData.set('profile_photo', selectedFile);
      await dispatch(updatePlayerProfile(updateData));
      setSelectedFile(null);
      if (previewUrl && !profile?.profilePhoto) setPreviewUrl(null);
      toast({
        title: 'Perfil actualizado',
        description: 'Tu información ha sido guardada correctamente.',
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Error al guardar',
        description: error?.message || 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        id: profile.id || '',
        fullName: profile.fullName || '',
        dateOfBirth: profile.dateOfBirth || '',
        age: typeof profile.age === 'number' ? profile.age : parseInt(profile.age as string) || 0,
        gender: profile.gender || '',
        state: profile.state || '',
        curp: profile.curp || '',
        ineOrPassport: profile.ineOrPassport || '',
        nrtpLevel: profile.nrtpLevel || 'Intermedio',
        email: profile.email || '',
        phone: profile.phone || '',
        profilePhoto: profile.profilePhoto || '',
        username: profile.username || '',
        membershipStatus: profile.membershipStatus || '',
        city: profile.city || '',
        bio: profile.bio || '',
        emergencyContact: profile.emergencyContact || '',
        medicalInfo: profile.medicalInfo || '',
        joinedDate: profile.joinedDate || '',
        lastActive: profile.lastActive || '',
        totalTournaments: profile.totalTournaments || 0,
        ranking: profile.ranking || null,
        currentClub: profile.currentClub || null,
      });
      setSelectedFile(null);
      setPreviewUrl(getFullImageUrl(profile.profilePhoto) || null);
    }
    setIsEditing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Tipo de archivo inválido',
        description: 'Por favor selecciona una imagen válida.',
        variant: 'destructive',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Archivo demasiado grande',
        description: 'La imagen debe ser menor a 5MB.',
        variant: 'destructive',
      });
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) return;
    try {
      const photoData = new FormData();
      photoData.append('profile_photo', selectedFile);
      await dispatch(updatePlayerProfile(photoData)).unwrap();
      setSelectedFile(null);
      toast({
        title: 'Foto actualizada',
        description: 'Tu foto de perfil ha sido guardada correctamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error al guardar foto',
        description: error?.message || 'No se pudo actualizar la foto de perfil',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deletePlayerAccount('confirm-delete')).unwrap();
      toast({
        title: 'Cuenta eliminada',
        description: 'Tu cuenta ha sido eliminada correctamente.',
      });
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error al eliminar',
        description: error?.message || 'No se pudo eliminar la cuenta',
        variant: 'destructive',
      });
    }
  };

  const initials = formData.fullName
    ? formData.fullName
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'JP';

  const activeCount = formData.totalTournaments;

  // ── Loading / Error ──────────────────────────────────────────────────────────
  if (profileLoading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <span className="animate-spin" style={{ color: ACCENT }}>
          <IcoSpin />
        </span>
        <p className="text-[#4a5a72] text-sm">Cargando perfil...</p>
      </div>
    );
  }

  if (profileError && !profile) {
    return (
      <div className="flex items-start gap-4 p-5 bg-red-950/40 border border-red-800/50 rounded-2xl">
        <span className="text-red-400 shrink-0 mt-0.5">
          <IcoAlert />
        </span>
        <div>
          <p className="text-red-200 font-semibold">Error al cargar el perfil</p>
          <p className="text-red-400 text-sm mt-1">{profileError}</p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-[#f0f4ff]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .syne { font-family: 'Syne', sans-serif; }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-6">
        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-6 pb-8 border-b border-white/[0.06]">
          {/* Avatar + name */}
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className="w-[72px] h-[72px] rounded-[18px] border-2 overflow-hidden"
                style={{ borderColor: ACCENT }}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full bg-gradient-to-br from-[#1e3a5f] to-[#0f2847] flex items-center justify-center syne text-2xl font-bold"
                    style={{ color: ACCENT }}
                  >
                    {initials}
                  </div>
                )}
              </div>
              {/* Camera button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#111827] border-2 border-[#080c14] flex items-center justify-center transition-colors hover:bg-[#1a2535]"
                style={{ color: ACCENT }}
              >
                {selectedFile ? <IcoUpload /> : <IcoCamera />}
              </button>
              {/* Save photo mini-button */}
              {selectedFile && (
                <button
                  onClick={handleSavePhoto}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full border-2 border-[#080c14] flex items-center justify-center text-[#080c14] text-xs font-bold"
                  style={{ background: ACCENT }}
                  title="Guardar foto"
                >
                  <IcoSave />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Name / meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="syne text-2xl font-bold tracking-tight leading-tight">
                  {formData.fullName || 'Tu Nombre'}
                </h1>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    background: ACCENT_DIM,
                    border: `1px solid ${ACCENT_BORD}`,
                    color: ACCENT,
                  }}
                >
                  {formData.membershipStatus || 'Activo'}
                </span>
              </div>
              <p className="text-[#7a8ba8] text-sm mb-2">@{formData.username || '—'}</p>
              <div className="flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                  style={{
                    background: ACCENT_DIM,
                    border: `1px solid ${ACCENT_BORD}`,
                    color: ACCENT,
                  }}
                >
                  <IcoStar /> {formData.nrtpLevel}
                </span>
                {formData.city && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300">
                    <IcoPin /> {formData.city}
                  </span>
                )}
                {formData.joinedDate && (
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#4a5a72]">
                    <IcoCal /> Desde {new Date(formData.joinedDate).getFullYear()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 flex-wrap">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[#f0f4ff] bg-transparent hover:bg-white/5 transition-all"
              >
                <IcoEdit /> Editar Perfil
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold syne disabled:opacity-50 transition-all"
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
                    <>
                      <IcoSave /> Guardar
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={profileLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-[#f0f4ff] hover:bg-white/5 disabled:opacity-50 transition-all"
                >
                  <IcoX /> Cancelar
                </button>
              </>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/15 transition-all"
            >
              <IcoTrash /> Eliminar Cuenta
            </button>
          </div>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.06] bg-[#111827] rounded-2xl overflow-hidden border border-white/[0.06]">
          {[
            { val: formData.nrtpLevel, lbl: 'Nivel de Habilidad' },
            { val: formData.membershipStatus || 'Basic', lbl: 'Membresía' },
            { val: formData.totalTournaments, lbl: 'Torneos' },
            {
              val: profile?.lastActive
                ? new Date(profile.lastActive).toLocaleDateString('es-MX')
                : '—',
              lbl: 'Último Login',
            },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="flex flex-col gap-1 px-5 py-4">
              <span
                className="syne text-xl font-bold tracking-tight truncate"
                style={{ color: ACCENT }}
              >
                {val}
              </span>
              <span className="text-xs text-[#4a5a72]">{lbl}</span>
            </div>
          ))}
        </div>

        {/* ── Tab Nav ── */}
        <div className="flex gap-1.5 p-1.5 bg-[#0d1421] border border-white/[0.06] rounded-2xl w-fit">
          {NAV_TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold syne transition-all ${
                activeTab === id
                  ? 'text-[#080c14]'
                  : 'text-[#4a5a72] hover:text-[#f0f4ff] hover:bg-white/5'
              }`}
              style={activeTab === id ? { background: ACCENT } : {}}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ══ PROFILE TAB ══════════════════════════════════════════════════════ */}
        {activeTab === 'profile' && (
          <div className="grid gap-5 md:grid-cols-5">
            {/* Left – Bio + contact */}
            <Card className="md:col-span-2 px-6 py-6 flex flex-col gap-5">
              <SectionHead icon={<IcoUser />} title="Sobre mí" desc="Tu presentación pública" />

              {/* Bio */}
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  placeholder="Cuéntanos sobre ti y tu pasión por el deporte..."
                  className={`${inputCls} resize-none`}
                  disabled={profileLoading}
                />
              ) : (
                <p className="text-[#7a8ba8] text-sm leading-relaxed">
                  {formData.bio || (
                    <span className="text-[#4a5a72] italic">Sin biografía aún.</span>
                  )}
                </p>
              )}

              <div className="border-t border-white/[0.06]" />

              {/* Contact fields */}
              <div className="flex flex-col gap-4">
                {(
                  [
                    {
                      icon: <IcoMail />,
                      label: 'Correo',
                      field: 'email',
                      type: 'email',
                      readOnly: true,
                    },
                    { icon: <IcoPhone />, label: 'Teléfono', field: 'phone', type: 'tel' },
                    {
                      icon: <IcoCal />,
                      label: 'Fecha de Nacimiento',
                      field: 'dateOfBirth',
                      type: 'date',
                    },
                    { icon: <IcoPin />, label: 'Ciudad', field: 'city', type: 'text' },
                  ] as any[]
                ).map(({ icon, label, field, type, readOnly }) => (
                  <div key={field}>
                    <label className={labelCls}>{label}</label>
                    {isEditing && !readOnly ? (
                      <input
                        type={type}
                        value={(formData as any)[field]}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        className={inputCls}
                        disabled={profileLoading}
                      />
                    ) : (
                      <div className="flex items-center gap-2.5 py-1.5">
                        <span className="text-[#4a5a72] shrink-0">{icon}</span>
                        <span className="text-[#f0f4ff] text-sm">
                          {(formData as any)[field] || <span className="text-[#4a5a72]">—</span>}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Right – Main form */}
            <Card className="md:col-span-3 px-6 py-6 flex flex-col gap-5">
              <SectionHead
                icon={<IcoShield />}
                title="Información Personal"
                desc="Datos de tu perfil deportivo"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name – spans both cols */}
                <div className="sm:col-span-2">
                  <label className={labelCls}>Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    placeholder="Tu nombre completo"
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditing || profileLoading}
                    className={inputCls}
                  />
                </div>

                {/* Skill level */}
                <div>
                  <label className={labelCls}>Nivel de Habilidad</label>
                  <div className="relative">
                    <select
                      value={formData.nrtpLevel}
                      onChange={(e) => setFormData({ ...formData, nrtpLevel: e.target.value })}
                      disabled={!isEditing || profileLoading}
                      className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                    >
                      {['Principiante', 'Intermedio', 'Avanzado', 'Profesional'].map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4a5a72]">
                      <IcoChevron />
                    </span>
                  </div>
                </div>

                {/* State autocomplete */}
                <div>
                  <label className={labelCls}>Estado</label>
                  <Autocomplete
                    options={Object.values(mexicoStates)}
                    value={formData.state || profile?.state || ''}
                    onChange={(value) => setFormData({ ...formData, state: value })}
                    disabled={!isEditing || profileLoading}
                    placeholder="Selecciona tu estado"
                    className={inputCls}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className={labelCls}>Género</label>
                  <div className="relative">
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      disabled={!isEditing || profileLoading}
                      className={`${inputCls} appearance-none pr-8 cursor-pointer`}
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

                {/* Username */}
                <div>
                  <label className={labelCls}>Nombre de Usuario</label>
                  <input
                    type="text"
                    value={formData.username}
                    placeholder="@usuario"
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing || profileLoading}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Emergency section */}
              <div className="border-t border-white/[0.06] pt-4 flex flex-col gap-4">
                <p className="syne text-sm font-semibold text-[#f0f4ff]">
                  Información de Emergencia
                </p>

                <div>
                  <label className={labelCls}>CURP</label>
                  <input
                    type="text"
                    value={formData.curp}
                    placeholder="CURP del jugador"
                    onChange={(e) => setFormData({ ...formData, curp: e.target.value })}
                    disabled={!isEditing || profileLoading}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Contacto de Emergencia</label>
                  <input
                    type="text"
                    value={formData.emergencyContact}
                    placeholder="Nombre y teléfono de contacto"
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    disabled={!isEditing || profileLoading}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Información Médica</label>
                  <textarea
                    value={formData.medicalInfo}
                    rows={3}
                    placeholder="Alergias, condiciones médicas, medicamentos..."
                    onChange={(e) => setFormData({ ...formData, medicalInfo: e.target.value })}
                    disabled={!isEditing || profileLoading}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>

              {/* Editing banner */}
              {isEditing && (
                <div
                  className="flex items-center gap-3 p-3.5 rounded-xl"
                  style={{ background: ACCENT_DIM, border: `1px solid ${ACCENT_BORD}` }}
                >
                  <span
                    className="w-2 h-2 rounded-full animate-pulse shrink-0"
                    style={{ background: ACCENT }}
                  />
                  <p className="text-xs font-medium" style={{ color: ACCENT }}>
                    Estás en modo edición. Recuerda guardar los cambios.
                  </p>
                </div>
              )}

              {/* Danger zone */}
              <div className="mt-auto pt-4 border-t border-white/[0.06]">
                <div className="flex items-center justify-between p-4 rounded-xl bg-red-950/30 border border-red-900/30">
                  <div>
                    <p className="text-red-300 font-semibold text-sm">Zona de peligro</p>
                    <p className="text-red-500/70 text-xs mt-0.5">
                      Eliminar cuenta permanentemente
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 border border-red-700/40 hover:border-red-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    <IcoTrash /> Eliminar
                  </button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* ══ STATS TAB ════════════════════════════════════════════════════════ */}
        {activeTab === 'stats' && (
          <div className="flex flex-col gap-5">
            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  lbl: 'Nivel de Habilidad',
                  val: formData.nrtpLevel || 'No definido',
                  icon: <IcoSwords />,
                },
                {
                  lbl: 'Estado de Membresía',
                  val: formData.membershipStatus || 'Basic',
                  icon: <IcoTrophy />,
                },
                {
                  lbl: 'Verificación',
                  val: profile?.is_verified ? 'Verificado' : 'Pendiente',
                  icon: <IcoStar />,
                },
                {
                  lbl: 'Último Login',
                  val: profile?.lastActive
                    ? new Date(profile.lastActive).toLocaleDateString('es-MX')
                    : 'Nunca',
                  icon: <IcoActivity />,
                },
              ].map(({ lbl, val, icon }) => (
                <div
                  key={lbl}
                  className="bg-[#0d1421] border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-3"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: ACCENT_DIM,
                      border: `1px solid ${ACCENT_BORD}`,
                      color: ACCENT,
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <p className="text-[#4a5a72] text-xs mb-1">{lbl}</p>
                    <p className="syne text-2xl font-bold" style={{ color: ACCENT }}>
                      {val}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Membership details */}
            <Card className="px-7 py-6">
              <SectionHead icon={<IcoTrophy />} title="Detalles de Membresía" />
              {[
                {
                  label: 'Estado de Membresía',
                  value: null,
                  badge: formData.membershipStatus || 'Basic',
                },
                { label: 'Verificado', value: null, badge: profile?.is_verified ? 'Sí' : 'No' },
                {
                  label: 'Último Login',
                  value: profile?.lastActive
                    ? new Date(profile.lastActive).toLocaleDateString('es-MX')
                    : 'Nunca',
                  badge: null,
                },
                { label: 'Tipo de Usuario', value: profile?.user_type || 'player', badge: null },
                { label: 'Torneos Totales', value: String(formData.totalTournaments), badge: null },
              ].map(({ label, value, badge }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-3.5 border-b border-white/[0.04] last:border-none"
                >
                  <span className="text-[#7a8ba8] text-sm">{label}</span>
                  {badge ? (
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        background: ACCENT_DIM,
                        border: `1px solid ${ACCENT_BORD}`,
                        color: ACCENT,
                      }}
                    >
                      {badge}
                    </span>
                  ) : (
                    <span className="text-[#f0f4ff] text-sm font-medium">{value}</span>
                  )}
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ══ PREFERENCES TAB ═════════════════════════════════════════════════ */}
        {activeTab === 'preferences' && (
          <div className="grid gap-5 md:grid-cols-2">
            {/* Play preferences */}
            <Card className="px-6 py-6 flex flex-col gap-5">
              <SectionHead
                icon={<IcoSwords />}
                title="Preferencias de Juego"
                desc="Configuración de tu perfil deportivo"
              />

              <div>
                <label className={labelCls}>Nivel de Habilidad</label>
                <div className="relative">
                  <select
                    value={formData.nrtpLevel}
                    onChange={(e) => setFormData({ ...formData, nrtpLevel: e.target.value })}
                    disabled={!isEditing || profileLoading}
                    className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                  >
                    {['Principiante', 'Intermedio', 'Avanzado', 'Profesional'].map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4a5a72]">
                    <IcoChevron />
                  </span>
                </div>
              </div>

              <div>
                <label className={labelCls}>Preferencia de Juego</label>
                <div className="relative">
                  <select
                    disabled
                    className={`${inputCls} appearance-none pr-8 opacity-40 cursor-not-allowed`}
                  >
                    {['Ambos', 'Derecha', 'Izquierda'].map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#4a5a72]">
                    <IcoChevron />
                  </span>
                </div>
              </div>

              {!isEditing && (
                <p className="text-[#4a5a72] text-xs">
                  Haz clic en "Editar Perfil" para modificar estas preferencias.
                </p>
              )}
            </Card>

            {/* Notifications */}
            <Card className="px-6 py-6 flex flex-col gap-1">
              <SectionHead
                icon={<IcoBell />}
                title="Notificaciones"
                desc="Controla qué notificaciones recibes"
              />

              {[
                { title: 'Torneos próximos', desc: 'Recibe alertas sobre torneos cercanos a ti' },
                { title: 'Mensajes de clubes', desc: 'Notificaciones de tus clubes afiliados' },
                {
                  title: 'Resultados de torneos',
                  desc: 'Actualizaciones de torneos en que participas',
                },
              ].map(({ title, desc }) => (
                <div
                  key={title}
                  className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-none"
                >
                  <div>
                    <p className="text-[#f0f4ff] text-sm font-medium">{title}</p>
                    <p className="text-[#4a5a72] text-xs mt-0.5">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4 shrink-0">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div
                      className="w-9 h-5 bg-[#1a2535] rounded-full
                      peer peer-checked:bg-[#ace600]
                      after:content-[''] after:absolute after:top-0.5 after:left-0.5
                      after:bg-white after:rounded-full after:h-4 after:w-4
                      after:transition-all peer-checked:after:translate-x-4"
                    />
                  </label>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>

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
                  los datos asociados.
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
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-all"
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
