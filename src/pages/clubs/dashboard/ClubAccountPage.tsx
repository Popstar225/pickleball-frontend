'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Mexico } from '@/constants/constants';
import {
  fetchClubProfile,
  updateClubProfile,
  deleteClubAccount,
} from '@/store/slices/clubDashboardSlice';
import { AppDispatch, RootState } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { ClubProfile, ClubOperatingHours } from '@/store/slices/clubDashboardSlice';
import { createClub } from '@/store/slices/clubsSlice';
import { getFullImageUrl } from '@/common/tools';
import { getImageUrl } from '@/lib/utils';

import {
  Building2,
  MapPin,
  Edit,
  X,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
  Clock,
  Mail,
  Share2,
  Settings,
  Calendar,
  User,
  Shield,
  Upload,
  Plus,
  Image as ImageIcon,
  Star,
  Trophy,
  Users,
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const A = '#ace600'; // accent

const inputCls =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/80 text-sm px-3.5 py-2.5 ' +
  'outline-none transition-all duration-150 ' +
  'focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03] focus:ring-0 ' +
  'disabled:opacity-35 disabled:cursor-not-allowed ' +
  'placeholder:text-white/20';

const labelCls = 'block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1.5';

// ─── Days ─────────────────────────────────────────────────────────────────────
const DAYS: { key: keyof ClubOperatingHours; label: string; short: string }[] = [
  { key: 'monday', label: 'Lunes', short: 'LUN' },
  { key: 'tuesday', label: 'Martes', short: 'MAR' },
  { key: 'wednesday', label: 'Miércoles', short: 'MIÉ' },
  { key: 'thursday', label: 'Jueves', short: 'JUE' },
  { key: 'friday', label: 'Viernes', short: 'VIE' },
  { key: 'saturday', label: 'Sábado', short: 'SÁB' },
  { key: 'sunday', label: 'Domingo', short: 'DOM' },
];

const TAB_CONFIG = [
  { value: 'identity', label: 'Identidad', icon: Building2 },
  { value: 'contact', label: 'Contacto', icon: Mail },
  { value: 'location', label: 'Ubicación', icon: MapPin },
  { value: 'courts', label: 'Canchas', icon: Settings },
  { value: 'availability', label: 'Servicios', icon: Calendar },
  { value: 'membership', label: 'Membresía', icon: Shield },
  { value: 'rules', label: 'Reglas', icon: Settings },
  { value: 'media', label: 'Medios', icon: Share2 },
  { value: 'owner', label: 'Propietario', icon: User },
  { value: 'hours', label: 'Horarios', icon: Clock },
] as const;
type TabValue = (typeof TAB_CONFIG)[number]['value'];

const CLUB_TYPES = {
  RECREATIONAL: 'recreational',
  COMPETITIVE: 'competitive',
  TRAINING: 'training',
  MIXED: 'mixed',
} as const;
const CLUB_TYPES_OPTIONS = [
  { value: 'recreational', label: 'Recreativo' },
  { value: 'competitive', label: 'Competitivo' },
  { value: 'training', label: 'Escuela' },
  { value: 'mixed', label: 'Mixto' },
];
const MEMBERSHIP_STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'expired', label: 'Expirado' },
];
const SUBSCRIPTION_PLAN_OPTIONS = [
  { value: 'basic', label: 'Básico' },
  { value: 'premium', label: 'Premium' },
];
// ─── Primitives ───────────────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  disabled,
  type = 'text',
  placeholder = '',
  textarea = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {textarea ? (
        <textarea
          className={`${inputCls} resize-y`}
          style={{ minHeight: rows * 28 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={inputCls}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function Dropdown({
  label,
  value,
  onChange,
  disabled,
  options,
  placeholder = 'Seleccionar...',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  options: readonly (string | { value: string; label: string })[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={`${inputCls} flex items-center`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-[#161c25] border border-white/[0.08] rounded-xl shadow-2xl">
          {options.map((opt) => {
            const v = typeof opt === 'string' ? opt.toLowerCase() : opt.value;
            const l = typeof opt === 'string' ? opt : opt.label;
            return (
              <SelectItem
                key={v}
                value={v}
                className="text-white/70 focus:bg-white/[0.06] focus:text-white"
              >
                {l}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

function SearchableDropdown({
  label,
  value,
  onChange,
  disabled,
  options,
  placeholder = 'Buscar...',
  isMexicoData = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  options: readonly any[];
  placeholder?: string;
  isMexicoData?: boolean;
}) {
  const [search, setSearch] = useState('');
  const filtered = options.filter((o) =>
    isMexicoData
      ? (o as { state: string; code: string }).state.toLowerCase().includes(search.toLowerCase())
      : (o as string).toLowerCase().includes(search.toLowerCase()),
  );

  const displayValue = isMexicoData ? Mexico.find((m) => m.code === value)?.state || '' : value;

  return (
    <div className="relative z-40">
      <label className={labelCls}>{label}</label>
      <input
        type="text"
        value={search !== '' ? search : displayValue}
        onChange={(e) => {
          setSearch(e.target.value);
          if (!e.target.value) onChange('');
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={inputCls}
        autoComplete="off"
      />
      {search && filtered.length > 0 && (
        <div className="absolute mt-1.5 w-full bg-[#161c25] border border-white/[0.08] rounded-xl overflow-hidden max-h-48 overflow-y-auto shadow-2xl z-50">
          {filtered.map((opt) => {
            const code = isMexicoData ? (opt as { state: string; code: string }).code : '';
            const state = isMexicoData
              ? (opt as { state: string; code: string }).state
              : (opt as string);
            return (
              <button
                key={isMexicoData ? code : state}
                type="button"
                onClick={() => {
                  onChange(isMexicoData ? code : state);
                  setSearch('');
                }}
                disabled={disabled}
                className="w-full text-left px-3.5 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                {state}
              </button>
            );
          })}
        </div>
      )}
      {search && filtered.length === 0 && (
        <p className="mt-1 text-xs text-white/25 px-1">Sin resultados</p>
      )}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-white/[0.04] last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/75">{label}</p>
        {description && <p className="text-[11px] text-white/30 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className="relative shrink-0 w-10 h-5.5 rounded-full transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed focus:outline-none"
        style={{ background: checked ? A : 'rgba(255,255,255,0.1)', height: '22px', width: '40px' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5 flex flex-col gap-4">
      {children}
    </div>
  );
}

function SaveBar({
  visible,
  onSave,
  onCancel,
  loading,
}: {
  visible: boolean;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="sticky bottom-4 z-20 mt-4 transition-all duration-200"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
      }}
    >
      <div
        className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border border-white/[0.08] shadow-2xl"
        style={{ background: 'rgba(10,13,20,0.96)', backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <p className="text-xs font-medium text-white/40">Cambios sin guardar</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/[0.08] text-white/50 hover:text-white/80 hover:bg-white/[0.04] disabled:opacity-40 transition-all"
          >
            <X className="w-3.5 h-3.5" /> Descartar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-black disabled:opacity-50 transition-all shadow-[0_0_16px_rgba(172,230,0,0.2)]"
            style={{ background: A }}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form type & helpers ──────────────────────────────────────────────────────
type FormData = {
  id: string;
  name: string;
  clubType: string;
  description: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  state: string;
  city: string;
  address: string;
  latitude: string;
  longitude: string;
  foundedDate: string;
  memberCount: number;
  maxMembers: number;
  hasCourts: boolean;
  courtCount: number;
  courtTypes: string[];
  offersTraining: boolean;
  offersTournaments: boolean;
  offersEquipment: boolean;
  membershipStatus: string;
  membershipExpiresAt: string;
  subscriptionPlan: string;
  membershipFee: string;
  courtRentalFee: string;
  logoUrl: string;
  bannerImage: string;
  photos: string[];
  website: string;
  socialMedia: { facebook?: string; instagram?: string; twitter?: string };
  operatingHours: ClubOperatingHours;
  availability: {
    court_booking: boolean;
    drop_in: boolean;
    leagues: boolean;
    tournaments: boolean;
  };
  clubRules: string;
  dressCode: string;
  totalTournaments: number;
  totalMatches: number;
  averageRating: string;
  reviewCount: number;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  settings: { allow_guest_play: boolean; max_guest_visits: number; auto_approve_members: boolean };
  notes: string;
  owner: { id: string; name: string; email: string; profilePhoto: string | null };
};

const emptyFormData: FormData = {
  id: '',
  name: '',
  clubType: '',
  description: '',
  contactPerson: '',
  contactEmail: '',
  contactPhone: '',
  contactWhatsapp: '',
  state: '',
  city: '',
  address: '',
  latitude: '',
  longitude: '',
  foundedDate: '',
  memberCount: 0,
  maxMembers: 0,
  hasCourts: false,
  courtCount: 0,
  courtTypes: [],
  offersTraining: false,
  offersTournaments: false,
  offersEquipment: false,
  membershipStatus: 'active',
  membershipExpiresAt: '',
  subscriptionPlan: 'basic',
  membershipFee: '',
  courtRentalFee: '',
  logoUrl: '',
  bannerImage: '',
  photos: [],
  website: '',
  socialMedia: {},
  operatingHours: {
    monday: { open: '06:00', close: '22:00' },
    tuesday: { open: '06:00', close: '22:00' },
    wednesday: { open: '06:00', close: '22:00' },
    thursday: { open: '06:00', close: '22:00' },
    friday: { open: '06:00', close: '23:00' },
    saturday: { open: '07:00', close: '23:00' },
    sunday: { open: '07:00', close: '21:00' },
  },
  availability: { court_booking: true, drop_in: true, leagues: false, tournaments: false },
  clubRules: '',
  dressCode: '',
  totalTournaments: 0,
  totalMatches: 0,
  averageRating: '',
  reviewCount: 0,
  isActive: true,
  isVerified: false,
  isFeatured: false,
  settings: { allow_guest_play: true, max_guest_visits: 3, auto_approve_members: false },
  notes: '',
  owner: { id: '', name: '', email: '', profilePhoto: null },
};

function toForm(p: ClubProfile): FormData {
  return {
    id: p.id ?? '',
    name: p.name ?? '',
    clubType: p.clubType ?? '',
    description: p.description ?? '',
    contactPerson: p.contactPerson ?? '',
    contactEmail: p.contactEmail ?? '',
    contactPhone: p.contactPhone ?? '',
    contactWhatsapp: p.contactWhatsapp ?? '',
    state: p.state ?? '',
    city: p.city ?? '',
    address: p.address ?? '',
    latitude: p.latitude ?? '',
    longitude: p.longitude ?? '',
    foundedDate: p.foundedDate ?? '',
    memberCount: p.memberCount ?? 0,
    maxMembers: p.maxMembers ?? 0,
    hasCourts: p.hasCourts ?? false,
    courtCount: p.courtCount ?? 0,
    courtTypes: p.courtTypes ?? [],
    offersTraining: p.offersTraining ?? false,
    offersTournaments: p.offersTournaments ?? false,
    offersEquipment: p.offersEquipment ?? false,
    membershipStatus: p.membershipStatus ?? 'active',
    membershipExpiresAt: p.membershipExpiresAt ?? '',
    subscriptionPlan: p.subscriptionPlan ?? 'basic',
    membershipFee: p.membershipFee ?? '',
    courtRentalFee: p.courtRentalFee ?? '',
    logoUrl: p.logoUrl ?? '',
    bannerImage: p.bannerImage ?? '',
    photos: p.photos ?? [],
    website: p.website ?? '',
    socialMedia: p.socialMedia ?? {},
    operatingHours: p.operatingHours ?? {},
    availability: p.availability ?? {
      court_booking: false,
      drop_in: false,
      leagues: false,
      tournaments: false,
    },
    clubRules: p.clubRules ?? '',
    dressCode: p.dressCode ?? '',
    totalTournaments: p.totalTournaments ?? 0,
    totalMatches: p.totalMatches ?? 0,
    averageRating: p.averageRating ?? '',
    reviewCount: p.reviewCount ?? 0,
    isActive: p.isActive ?? false,
    isVerified: p.isVerified ?? false,
    isFeatured: p.isFeatured ?? false,
    settings: p.settings ?? {
      allow_guest_play: false,
      max_guest_visits: 0,
      auto_approve_members: false,
    },
    notes: p.notes ?? '',
    owner: p.owner ?? { id: '', name: '', email: '', profilePhoto: null },
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ClubAccountPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();
  const { profile, profileLoading, profileError } = useSelector((s: RootState) => s.clubDashboard);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [hours, setHours] = useState<ClubOperatingHours | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('identity');
  const [isNewClub, setIsNewClub] = useState(false);
  const [courtTypesRaw, setCourtTypesRaw] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    dispatch(fetchClubProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile && !isEditing) {
      const f = toForm(profile);
      setFormData(f);
      setHours(profile.operatingHours ?? null);
      setCourtTypesRaw(f.courtTypes.join(', '));
      setIsNewClub(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profileError && !formData && !profile) {
      setFormData(emptyFormData);
      setHours(emptyFormData.operatingHours);
      setCourtTypesRaw('');
      setIsNewClub(true);
      setIsEditing(true);
    }
  }, [profileError, formData, profile]);

  const set = (key: keyof FormData, val: any) => setFormData((p) => (p ? { ...p, [key]: val } : p));
  const setAvailability = (field: keyof FormData['availability'], val: boolean) =>
    setFormData((p) => (p ? { ...p, availability: { ...p.availability, [field]: val } } : p));
  const setSettings = (field: keyof FormData['settings'], val: boolean | number) =>
    setFormData((p) => (p ? { ...p, settings: { ...p.settings, [field]: val } } : p));
  const setSocialMedia = (field: keyof FormData['socialMedia'], val: string) =>
    setFormData((p) => (p ? { ...p, socialMedia: { ...p.socialMedia, [field]: val } } : p));
  const setOwner = (field: keyof FormData['owner'], val: string | null) =>
    setFormData((p) => (p ? { ...p, owner: { ...p.owner, [field]: val } } : p));
  const setHour = (day: keyof ClubOperatingHours, field: 'open' | 'close', val: string) =>
    setHours((h) => (h ? { ...h, [day]: { ...h[day], [field]: val } } : h));

  function readFileAsBase64(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const b64 = await readFileAsBase64(file);
      setFormData((p) => (p ? { ...p, logoUrl: b64 } : p));
    } catch {
    } finally {
      setUploadingLogo(false);
    }
  }
  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const b64 = await readFileAsBase64(file);
      setFormData((p) => (p ? { ...p, bannerImage: b64 } : p));
    } catch {
    } finally {
      setUploadingBanner(false);
    }
  }
  async function handlePhotosUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPhotos(true);
    try {
      const arr = await Promise.all(files.map(readFileAsBase64));
      setFormData((p) => (p ? { ...p, photos: [...p.photos, ...arr] } : p));
    } catch {
    } finally {
      setUploadingPhotos(false);
    }
  }

  const handleSave = async () => {
    if (!formData) return;
    const finalCourtTypes = courtTypesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      if (isNewClub && profileError) {
        await dispatch(
          createClub({
            name: formData.name,
            club_type: (formData.clubType as any) || CLUB_TYPES.RECREATIONAL,
            description: formData.description,
            contact_person: formData.contactPerson,
            contact_email: formData.contactEmail,
            contact_phone: formData.contactPhone,
            contact_whatsapp: formData.contactWhatsapp,
            state: formData.state,
            city: formData.city,
            address: formData.address,
            latitude: formData.latitude ? Number(formData.latitude) : undefined,
            longitude: formData.longitude ? Number(formData.longitude) : undefined,
            founded_date: formData.foundedDate,
            max_members: formData.maxMembers,
            has_courts: formData.hasCourts,
            court_count: formData.courtCount,
            court_types: finalCourtTypes,
            offers_training: formData.offersTraining,
            offers_tournaments: formData.offersTournaments,
            offers_equipment: formData.offersEquipment,
            membership_fee: formData.membershipFee ? Number(formData.membershipFee) : undefined,
            court_rental_fee: formData.courtRentalFee ? Number(formData.courtRentalFee) : undefined,
            website: formData.website,
            social_media: formData.socialMedia,
            operating_hours: hours ?? formData.operatingHours,
            club_rules: formData.clubRules,
            dress_code: formData.dressCode,
            logo: formData.logoUrl || undefined,
            banner: formData.bannerImage || undefined,
            photos: formData.photos.length ? formData.photos : undefined,
          }),
        ).unwrap();
        setIsEditing(false);
        toast({ title: 'Club creado', description: 'El club ha sido creado exitosamente.' });
      } else {
        await dispatch(
          updateClubProfile({
            ...formData,
            courtTypes: finalCourtTypes,
            photos: formData.photos,
            logoUrl: formData.logoUrl,
            bannerImage: formData.bannerImage,
            operatingHours: hours ?? formData.operatingHours,
          }),
        ).unwrap();
        setIsEditing(false);
        toast({ title: 'Perfil actualizado', description: 'Los cambios han sido guardados.' });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo actualizar',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    if (profile) {
      const f = toForm(profile);
      setFormData(f);
      setHours(profile.operatingHours ?? null);
      setCourtTypesRaw(f.courtTypes.join(', '));
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteClubAccount('confirm-delete')).unwrap();
      toast({ title: 'Club eliminado', variant: 'destructive' });
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo eliminar',
        variant: 'destructive',
      });
    }
  };

  if (profileLoading && !formData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: A }} />
        <p className="text-xs text-white/25">Cargando perfil…</p>
      </div>
    );
  }
  if (!formData) return null;

  const initials =
    formData.name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || (isNewClub ? 'NC' : 'CL');
  const isDisabled = !isEditing || profileLoading;

  const statusCfg =
    formData.membershipStatus === 'active'
      ? {
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/20',
          label: 'Activo',
        }
      : formData.membershipStatus === 'expired'
        ? {
            bg: 'bg-red-500/10',
            text: 'text-red-400',
            border: 'border-red-500/20',
            label: 'Expirado',
          }
        : {
            bg: 'bg-amber-500/10',
            text: 'text-amber-400',
            border: 'border-amber-500/20',
            label: 'Pendiente',
          };

  const planLabel =
    SUBSCRIPTION_PLAN_OPTIONS.find((o) => o.value === formData.subscriptionPlan)?.label ??
    formData.subscriptionPlan;
  const memberPct =
    formData.maxMembers > 0 ? Math.min((formData.memberCount / formData.maxMembers) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-[#080c14] text-white p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">
          {/* banner strip */}
          <div
            className="relative h-24 overflow-hidden"
            style={{
              background: formData.bannerImage
                ? `url(${formData.bannerImage}) center/cover no-repeat`
                : 'linear-gradient(135deg,#0f1e3a 0%,#0d1117 100%)',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117]/80 to-transparent" />
          </div>

          <div className="px-6 pb-5 -mt-8 relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            {/* avatar + name */}
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                <div
                  className="w-16 h-16 rounded-2xl border-2 border-[#0d1117] flex items-center justify-center text-xl font-bold overflow-hidden shadow-xl"
                  style={{
                    background: formData.logoUrl
                      ? `url(${formData.logoUrl}) center/cover no-repeat`
                      : `linear-gradient(135deg,#1a2744,#0f1e3a)`,
                    color: A,
                  }}
                >
                  {!formData.logoUrl && initials}
                </div>
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0d1117]"
                  style={{ background: formData.isActive ? '#22c55e' : '#374151' }}
                />
              </div>
              <div className="pb-0.5">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-lg font-bold text-white leading-tight">
                    {formData.name || (isNewClub ? 'Nuevo Club' : 'Mi Club')}
                  </h1>
                  {formData.isVerified && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#ace600]/10 border border-[#ace600]/20"
                      style={{ color: A }}
                    >
                      Verificado
                    </span>
                  )}
                  {formData.isFeatured && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                      Destacado
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/35 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  {[formData.city, formData.state].filter(Boolean).join(', ') || 'Sin ubicación'}
                </p>
              </div>
            </div>

            {/* actions */}
            <div className="flex gap-2 pb-0.5">
              <button
                type="button"
                onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
                disabled={profileLoading}
                className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.05] text-xs font-semibold disabled:opacity-40 transition-all"
              >
                {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
                {isEditing ? 'Cancelar' : isNewClub ? 'Crear Club' : 'Editar'}
              </button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    disabled={profileLoading || isNewClub}
                    className="flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-red-500/20 text-red-400 bg-red-500/[0.06] hover:bg-red-500/[0.12] text-xs font-semibold disabled:opacity-40 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-[#0d1117] border border-white/[0.08] rounded-2xl p-0 shadow-2xl overflow-hidden max-w-sm">
                  <div className="p-6">
                    <div className="w-11 h-11 rounded-2xl bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base font-bold text-white">
                        ¿Eliminar este club?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-sm text-white/35 leading-relaxed mt-1">
                        Esta acción no se puede deshacer. Se eliminarán permanentemente el club y
                        todos sus datos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                  </div>
                  <AlertDialogFooter className="flex gap-2.5 px-6 pb-6 flex-row">
                    <AlertDialogCancel className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/60 hover:text-white text-sm font-semibold transition-all">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="flex-1 h-9 rounded-xl bg-red-500/80 hover:bg-red-500 text-white text-sm font-bold border-0 transition-all"
                    >
                      Sí, eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Members */}
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Users className="w-3 h-3 text-white/25" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                Miembros
              </p>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-2xl font-bold leading-none" style={{ color: A }}>
                {formData.memberCount}
              </span>
              {formData.maxMembers > 0 && (
                <span className="text-xs text-white/25 mb-0.5">/ {formData.maxMembers}</span>
              )}
            </div>
            {formData.maxMembers > 0 && (
              <div className="mt-2.5 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${memberPct}%`, background: A }}
                />
              </div>
            )}
          </div>

          {/* Tournaments */}
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Trophy className="w-3 h-3 text-white/25" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                Torneos
              </p>
            </div>
            <span className="text-2xl font-bold leading-none" style={{ color: A }}>
              {formData.totalTournaments}
            </span>
            <p className="text-[11px] text-white/25 mt-1.5">{formData.totalMatches} partidos</p>
          </div>

          {/* Rating */}
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Star className="w-3 h-3 text-white/25" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                Rating
              </p>
            </div>
            <div className="flex items-end gap-1.5">
              <span className="text-2xl font-bold leading-none" style={{ color: A }}>
                {formData.averageRating || '—'}
              </span>
              {formData.averageRating && (
                <span className="text-xs text-white/25 mb-0.5">/ 5.0</span>
              )}
            </div>
            <p className="text-[11px] text-white/25 mt-1.5">{formData.reviewCount} reseñas</p>
          </div>

          {/* Subscription */}
          <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Shield className="w-3 h-3 text-white/25" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">
                Suscripción
              </p>
            </div>
            <span
              className={`inline-flex text-xs font-bold px-2.5 py-1 rounded-lg border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
            >
              {statusCfg.label}
            </span>
            <p className="text-[11px] text-white/25 mt-1.5">Plan {planLabel}</p>
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="flex h-auto w-full overflow-x-auto gap-1 bg-[#0d1117] border border-white/[0.07] rounded-2xl p-1.5">
            {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-white/30 whitespace-nowrap transition-all data-[state=active]:font-bold data-[state=active]:text-black"
                style={{ '--tw-bg-opacity': '1' } as any}
                data-active={activeTab === value}
                // Tailwind data-[state=active] can't use dynamic colors, so we inline
              >
                <Icon className="w-3 h-3" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Identity ───────────────────────────────────────────────── */}
          <TabsContent value="identity" className="mt-4">
            <SectionCard>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Nombre del Club"
                  value={formData.name}
                  onChange={(v) => set('name', v)}
                  disabled={isDisabled}
                  placeholder="Nombre oficial"
                />
                <Dropdown
                  label="Tipo de Club"
                  value={formData.clubType}
                  onChange={(v) => set('clubType', v)}
                  disabled={isDisabled}
                  options={CLUB_TYPES_OPTIONS}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Sitio Web"
                  value={formData.website}
                  onChange={(v) => set('website', v)}
                  disabled={isDisabled}
                  placeholder="https://miclub.com"
                />
                <Field
                  label="Fecha de Fundación"
                  value={formData.foundedDate?.split('T')[0] || ''}
                  onChange={(v) => set('foundedDate', v)}
                  disabled={isDisabled}
                  type="date"
                />
              </div>
              <Field
                label="Descripción"
                value={formData.description}
                onChange={(v) => set('description', v)}
                disabled={isDisabled}
                textarea
                rows={4}
                placeholder="Describe tu club…"
              />
              <Field
                label="Notas Internas"
                value={formData.notes}
                onChange={(v) => set('notes', v)}
                disabled={isDisabled}
                textarea
                rows={2}
                placeholder="Notas de administración…"
              />
            </SectionCard>
          </TabsContent>

          {/* ── Contact ─────────────────────────────────────────────────── */}
          <TabsContent value="contact" className="mt-4">
            <SectionCard>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Persona de Contacto"
                  value={formData.contactPerson}
                  onChange={(v) => set('contactPerson', v)}
                  disabled={isDisabled}
                  placeholder="Nombre completo"
                />
                <Field
                  label="Correo Electrónico"
                  value={formData.contactEmail}
                  onChange={(v) => set('contactEmail', v)}
                  disabled={isDisabled}
                  type="email"
                  placeholder="correo@club.com"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Teléfono"
                  value={formData.contactPhone}
                  onChange={(v) => set('contactPhone', v)}
                  disabled={isDisabled}
                  placeholder="+52 55 0000 0000"
                />
                <Field
                  label="WhatsApp"
                  value={formData.contactWhatsapp}
                  onChange={(v) => set('contactWhatsapp', v)}
                  disabled={isDisabled}
                  placeholder="+52 55 0000 0000"
                />
              </div>
            </SectionCard>
          </TabsContent>

          {/* ── Location ─────────────────────────────────────────────────── */}
          <TabsContent value="location" className="mt-4">
            <SectionCard>
              <Field
                label="Dirección"
                value={formData.address}
                onChange={(v) => set('address', v)}
                disabled={isDisabled}
                placeholder="Calle, número, colonia"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Ciudad"
                  value={formData.city}
                  onChange={(v) => set('city', v)}
                  disabled={isDisabled}
                  placeholder="Ciudad"
                />
                <SearchableDropdown
                  label="Estado"
                  value={formData.state}
                  onChange={(v) => set('state', v)}
                  disabled={isDisabled}
                  options={Mexico}
                  isMexicoData={true}
                  placeholder="Buscar estado…"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Latitud"
                  value={formData.latitude}
                  onChange={(v) => set('latitude', v)}
                  disabled={isDisabled}
                  placeholder="19.4326"
                />
                <Field
                  label="Longitud"
                  value={formData.longitude}
                  onChange={(v) => set('longitude', v)}
                  disabled={isDisabled}
                  placeholder="-99.1332"
                />
              </div>
            </SectionCard>
          </TabsContent>

          {/* ── Courts ───────────────────────────────────────────────────── */}
          <TabsContent value="courts" className="mt-4">
            <SectionCard>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field
                  label="Miembros Actuales"
                  value={formData.memberCount.toString()}
                  onChange={(v) => set('memberCount', Number(v))}
                  disabled={isDisabled}
                  type="number"
                />
                <Field
                  label="Máximo de Miembros"
                  value={formData.maxMembers.toString()}
                  onChange={(v) => set('maxMembers', Number(v))}
                  disabled={isDisabled}
                  type="number"
                />
                <Field
                  label="Cantidad de Canchas"
                  value={formData.courtCount.toString()}
                  onChange={(v) => set('courtCount', Number(v))}
                  disabled={isDisabled}
                  type="number"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Court types */}
                <div>
                  <label className={labelCls}>Tipos de Cancha</label>
                  <div className="flex flex-col gap-2">
                    {formData.courtTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {formData.courtTypes.map((ct, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border"
                            style={{
                              background: 'rgba(172,230,0,0.08)',
                              border: '1px solid rgba(172,230,0,0.2)',
                              color: A,
                            }}
                          >
                            {ct}
                            {!isDisabled && (
                              <button
                                type="button"
                                onClick={() =>
                                  set(
                                    'courtTypes',
                                    formData.courtTypes.filter((_, j) => j !== i),
                                  )
                                }
                                className="hover:opacity-60 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        className={inputCls}
                        type="text"
                        value={courtTypesRaw}
                        placeholder="Ej. Polvo de ladrillo"
                        disabled={isDisabled}
                        onChange={(e) => setCourtTypesRaw(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && courtTypesRaw.trim()) {
                            e.preventDefault();
                            const t = courtTypesRaw.trim();
                            if (!formData.courtTypes.includes(t)) {
                              set('courtTypes', [...formData.courtTypes, t]);
                              setCourtTypesRaw('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={isDisabled || !courtTypesRaw.trim()}
                        onClick={() => {
                          const t = courtTypesRaw.trim();
                          if (t && !formData.courtTypes.includes(t)) {
                            set('courtTypes', [...formData.courtTypes, t]);
                            setCourtTypesRaw('');
                          }
                        }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
                        style={{
                          background:
                            !isDisabled && courtTypesRaw.trim() ? A : 'rgba(255,255,255,0.06)',
                          color:
                            !isDisabled && courtTypesRaw.trim()
                              ? '#080c14'
                              : 'rgba(255,255,255,0.25)',
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <Field
                  label="Cuota de Membresía ($)"
                  value={formData.membershipFee}
                  onChange={(v) => set('membershipFee', v)}
                  disabled={isDisabled}
                  type="number"
                />
                <Field
                  label="Renta de Cancha ($)"
                  value={formData.courtRentalFee}
                  onChange={(v) => set('courtRentalFee', v)}
                  disabled={isDisabled}
                  type="number"
                />
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4">
                <Toggle
                  label="Canchas Propias"
                  description="El club cuenta con instalaciones propias"
                  checked={formData.hasCourts}
                  onChange={(v) => set('hasCourts', v)}
                  disabled={isDisabled}
                />
                <Toggle
                  label="Ofrece Entrenamiento"
                  description="Clases y entrenamiento disponibles"
                  checked={formData.offersTraining}
                  onChange={(v) => set('offersTraining', v)}
                  disabled={isDisabled}
                />
                <Toggle
                  label="Organiza Torneos"
                  description="El club organiza torneos propios"
                  checked={formData.offersTournaments}
                  onChange={(v) => set('offersTournaments', v)}
                  disabled={isDisabled}
                />
                <Toggle
                  label="Vende Equipamiento"
                  description="Tienda de equipos y accesorios"
                  checked={formData.offersEquipment}
                  onChange={(v) => set('offersEquipment', v)}
                  disabled={isDisabled}
                />
              </div>
            </SectionCard>
          </TabsContent>

          {/* ── Availability ─────────────────────────────────────────────── */}
          <TabsContent value="availability" className="mt-4">
            <SectionCard>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4">
                <Toggle
                  label="Reserva de Canchas"
                  description="Los miembros pueden reservar canchas online"
                  checked={formData.availability.court_booking}
                  onChange={(v) => setAvailability('court_booking', v)}
                  disabled={isDisabled}
                />
                <Toggle
                  label="Drop-In"
                  description="Acceso libre sin reserva previa"
                  checked={formData.availability.drop_in}
                  onChange={(v) => setAvailability('drop_in', v)}
                  disabled={isDisabled}
                />
                <Toggle
                  label="Ligas"
                  description="Participación en ligas activas"
                  checked={formData.availability.leagues}
                  onChange={(v) => setAvailability('leagues', v)}
                  disabled={isDisabled}
                />
                <Toggle
                  label="Torneos"
                  description="Torneos abiertos a inscripción"
                  checked={formData.availability.tournaments}
                  onChange={(v) => setAvailability('tournaments', v)}
                  disabled={isDisabled}
                />
              </div>
            </SectionCard>
          </TabsContent>

          {/* ── Membership ───────────────────────────────────────────────── */}
          <TabsContent value="membership" className="mt-4">
            <SectionCard>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Dropdown
                  label="Estado de Membresía"
                  value={formData.membershipStatus}
                  onChange={(v) => set('membershipStatus', v)}
                  disabled={true}
                  options={MEMBERSHIP_STATUS_OPTIONS}
                />
                <Dropdown
                  label="Plan de Suscripción"
                  value={formData.subscriptionPlan}
                  onChange={(v) => set('subscriptionPlan', v)}
                  disabled={true}
                  options={SUBSCRIPTION_PLAN_OPTIONS}
                />
                <Field
                  label="Vence el"
                  value={formData.membershipExpiresAt?.split('T')[0] || ''}
                  onChange={(v) => set('membershipExpiresAt', v)}
                  disabled={true}
                  type="date"
                />
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4">
                <Toggle
                  label="Club Activo"
                  description="El club está operando actualmente"
                  checked={formData.isActive}
                  onChange={(v) => set('isActive', v)}
                  disabled={true}
                />
                <Toggle
                  label="Club Verificado"
                  description="Verificación oficial completada"
                  checked={formData.isVerified}
                  onChange={(v) => set('isVerified', v)}
                  disabled={true}
                />
                <Toggle
                  label="Club Destacado"
                  description="Aparece como destacado en búsquedas"
                  checked={formData.isFeatured}
                  onChange={(v) => set('isFeatured', v)}
                  disabled={true}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Field
                  label="Total de Torneos"
                  value={formData.totalTournaments.toString()}
                  onChange={(v) => set('totalTournaments', Number(v))}
                  disabled={true}
                  type="number"
                />
                <Field
                  label="Total de Partidos"
                  value={formData.totalMatches.toString()}
                  onChange={(v) => set('totalMatches', Number(v))}
                  disabled={true}
                  type="number"
                />
                <Field
                  label="Rating Promedio"
                  value={formData.averageRating}
                  onChange={(v) => set('averageRating', v)}
                  disabled={true}
                  placeholder="4.5"
                />
                <Field
                  label="Reseñas"
                  value={formData.reviewCount.toString()}
                  onChange={(v) => set('reviewCount', Number(v))}
                  disabled={true}
                  type="number"
                />
              </div>
            </SectionCard>
          </TabsContent>

          {/* ── Rules ───────────────────────────────────────────────────── */}
          <TabsContent value="rules" className="mt-4">
            <SectionCard>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Reglas del Club"
                  value={formData.clubRules}
                  onChange={(v) => set('clubRules', v)}
                  disabled={isDisabled}
                  textarea
                  rows={5}
                  placeholder="Normas de convivencia…"
                />
                <Field
                  label="Código de Vestimenta"
                  value={formData.dressCode}
                  onChange={(v) => set('dressCode', v)}
                  disabled={isDisabled}
                  textarea
                  rows={5}
                  placeholder="Indumentaria requerida…"
                />
              </div>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4">
                <Toggle
                  label="Permitir Invitados"
                  description="Los miembros pueden traer invitados"
                  checked={formData?.settings?.allow_guest_play}
                  onChange={(v) => setSettings('allow_guest_play', v)}
                  disabled={isDisabled}
                />
                <Toggle
                  label="Auto-aprobar Miembros"
                  description="Nuevos miembros aprobados automáticamente"
                  checked={formData?.settings?.auto_approve_members}
                  onChange={(v) => setSettings('auto_approve_members', v)}
                  disabled={isDisabled}
                />
              </div>
              <div className="max-w-xs">
                <Field
                  label="Máx. Visitas de Invitado"
                  value={formData?.settings?.max_guest_visits?.toString()}
                  onChange={(v) => setSettings('max_guest_visits', Number(v))}
                  disabled={isDisabled}
                  type="number"
                />
              </div>
            </SectionCard>
          </TabsContent>

          {/* ── Media ───────────────────────────────────────────────────── */}
          <TabsContent value="media" className="mt-4">
            <SectionCard>
              {/* Logo */}
              <div>
                <label className={labelCls}>Logo del Club</label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl border border-white/[0.08] shrink-0 flex items-center justify-center overflow-hidden"
                    style={{
                      background: formData.logoUrl
                        ? `url(${getImageUrl(formData.logoUrl)}) center/cover no-repeat`
                        : 'rgba(172,230,0,0.06)',
                      color: A,
                    }}
                  >
                    {!formData.logoUrl && <ImageIcon className="w-5 h-5 opacity-30" />}
                  </div>
                  <div className="flex-1">
                    <label
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed text-xs font-semibold cursor-pointer transition-all w-fit ${isDisabled ? 'border-white/[0.06] text-white/25 cursor-not-allowed' : 'border-[#ace600]/25 text-[#ace600] hover:bg-[#ace600]/[0.05]'}`}
                    >
                      {uploadingLogo ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      {formData.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isDisabled || uploadingLogo}
                        onChange={handleLogoUpload}
                      />
                    </label>
                    {formData.logoUrl && !isDisabled && (
                      <button
                        type="button"
                        onClick={() => set('logoUrl', '')}
                        className="mt-1 text-[11px] text-red-400 hover:text-red-300 transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                    <p className="text-[10px] text-white/20 mt-1">PNG, JPG · máx. 2 MB</p>
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/[0.05]" />

              {/* Banner */}
              <div>
                <label className={labelCls}>Banner</label>
                <div
                  className="relative w-full h-24 rounded-xl border border-dashed overflow-hidden flex items-center justify-center transition-all"
                  style={{
                    background: formData.bannerImage
                      ? `url(${formData.bannerImage}) center/cover no-repeat`
                      : 'rgba(255,255,255,0.02)',
                    borderColor: isDisabled ? 'rgba(255,255,255,0.06)' : 'rgba(172,230,0,0.2)',
                  }}
                >
                  {!formData.bannerImage && (
                    <div className="flex flex-col items-center gap-1">
                      <ImageIcon className="w-5 h-5 opacity-15" style={{ color: A }} />
                      <span className="text-[11px] text-white/20">Sin banner</span>
                    </div>
                  )}
                  {formData.bannerImage && !isDisabled && (
                    <button
                      type="button"
                      onClick={() => set('bannerImage', '')}
                      className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                  {!isDisabled && (
                    <label className="absolute inset-0 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isDisabled || uploadingBanner}
                        onChange={handleBannerUpload}
                      />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-white/20 mt-1.5">Recomendado: 1200×400px</p>
              </div>

              <div className="h-px bg-white/[0.05]" />

              {/* Photos */}
              <div>
                <label className={labelCls}>Fotos del Club</label>
                <div className="flex flex-wrap gap-2.5">
                  {formData.photos.map((url, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/[0.08] shrink-0"
                    >
                      <img
                        src={getFullImageUrl(url)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {!isDisabled && (
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              'photos',
                              formData.photos.filter((_, j) => j !== i),
                            )
                          }
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                  ))}
                  {!isDisabled && (
                    <label
                      className="w-20 h-20 rounded-xl border border-dashed flex flex-col items-center justify-center cursor-pointer shrink-0 transition-all hover:bg-[#ace600]/[0.04]"
                      style={{ borderColor: 'rgba(172,230,0,0.2)' }}
                    >
                      {uploadingPhotos ? (
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: A }} />
                      ) : (
                        <Plus className="w-4 h-4" style={{ color: A }} />
                      )}
                      <span className="text-[10px] font-semibold mt-0.5" style={{ color: A }}>
                        Agregar
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={isDisabled || uploadingPhotos}
                        onChange={handlePhotosUpload}
                      />
                    </label>
                  )}
                </div>
                {formData.photos.length === 0 && isDisabled && (
                  <p className="text-xs text-white/20 mt-2">
                    Sin fotos. Activa la edición para agregar.
                  </p>
                )}
              </div>

              <div className="h-px bg-white/[0.05]" />

              {/* Social */}
              <div>
                <label className={labelCls}>Redes Sociales</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field
                    label="Facebook"
                    value={formData.socialMedia.facebook || ''}
                    onChange={(v) => setSocialMedia('facebook', v)}
                    disabled={isDisabled}
                    placeholder="https://facebook.com/…"
                  />
                  <Field
                    label="Instagram"
                    value={formData.socialMedia.instagram || ''}
                    onChange={(v) => setSocialMedia('instagram', v)}
                    disabled={isDisabled}
                    placeholder="https://instagram.com/…"
                  />
                  <Field
                    label="Twitter / X"
                    value={formData.socialMedia.twitter || ''}
                    onChange={(v) => setSocialMedia('twitter', v)}
                    disabled={isDisabled}
                    placeholder="https://twitter.com/…"
                  />
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          {/* ── Owner ───────────────────────────────────────────────────── */}
          <TabsContent value="owner" className="mt-4">
            <SectionCard>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Nombre del Propietario"
                  value={formData.owner.name}
                  onChange={(v) => setOwner('name', v)}
                  disabled={isDisabled}
                />
                <Field
                  label="Email del Propietario"
                  value={formData.owner.email}
                  onChange={(v) => setOwner('email', v)}
                  disabled={isDisabled}
                  type="email"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="ID del Propietario"
                  value={formData.owner.id}
                  onChange={(v) => setOwner('id', v)}
                  disabled={isDisabled}
                />
                <Field
                  label="Foto (URL)"
                  value={formData.owner.profilePhoto || ''}
                  onChange={(v) => setOwner('profilePhoto', v)}
                  disabled={isDisabled}
                />
              </div>
              {(formData.owner.name || formData.owner.email) && (
                <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden border border-white/[0.08]"
                    style={{
                      background: formData.owner.profilePhoto
                        ? `url(${formData.owner.profilePhoto}) center/cover no-repeat`
                        : 'rgba(172,230,0,0.08)',
                      color: A,
                    }}
                  >
                    {!formData.owner.profilePhoto && formData.owner.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/80">
                      {formData.owner.name || '—'}
                    </p>
                    <p className="text-xs text-white/30">{formData.owner.email || '—'}</p>
                  </div>
                </div>
              )}
            </SectionCard>
          </TabsContent>

          {/* ── Hours ───────────────────────────────────────────────────── */}
          <TabsContent value="hours" className="mt-4">
            <SectionCard>
              <div className="hidden sm:grid grid-cols-[1fr_160px_160px] pb-3 border-b border-white/[0.05]">
                {['Día', 'Apertura', 'Cierre'].map((h) => (
                  <span key={h} className={labelCls}>
                    {h}
                  </span>
                ))}
              </div>
              {hours ? (
                <div className="flex flex-col">
                  {DAYS.map(({ key, label, short }) => {
                    const active = !!(hours[key]?.open || hours[key]?.close);
                    return (
                      <div
                        key={key}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_160px_160px] items-center gap-3 py-3 border-b border-white/[0.04] last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 transition-all"
                            style={{
                              background: active
                                ? 'rgba(172,230,0,0.08)'
                                : 'rgba(255,255,255,0.03)',
                              color: active ? A : 'rgba(255,255,255,0.2)',
                              border: `1px solid ${active ? 'rgba(172,230,0,0.18)' : 'rgba(255,255,255,0.05)'}`,
                            }}
                          >
                            {short}
                          </span>
                          <span className="text-sm font-medium text-white/65">{label}</span>
                        </div>
                        <div>
                          <label className={`${labelCls} sm:hidden`}>Apertura</label>
                          <input
                            type="time"
                            value={hours[key]?.open || ''}
                            disabled={isDisabled}
                            onChange={(e) => setHour(key, 'open', e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={`${labelCls} sm:hidden`}>Cierre</label>
                          <input
                            type="time"
                            value={hours[key]?.close || ''}
                            disabled={isDisabled}
                            onChange={(e) => setHour(key, 'close', e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center py-12 text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border"
                    style={{
                      background: 'rgba(172,230,0,0.06)',
                      borderColor: 'rgba(172,230,0,0.12)',
                      color: A,
                    }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-white/50">Sin horarios configurados</p>
                  <p className="text-xs text-white/25 mt-1">
                    Activa la edición para agregar horarios
                  </p>
                </div>
              )}
            </SectionCard>
          </TabsContent>
        </Tabs>

        <SaveBar
          visible={isEditing}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={profileLoading}
        />
      </div>
    </div>
  );
}
