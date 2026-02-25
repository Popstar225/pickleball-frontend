'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClubProfile,
  updateClubProfile,
  deleteClubAccount,
} from '@/store/slices/clubDashboardSlice';
import { AppDispatch, RootState } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { ClubProfile, ClubOperatingHours } from '@/store/slices/clubDashboardSlice';
import { createClub } from '@/store/slices/clubsSlice';
import { uploadImageToCloudinary } from '@/lib/imageUpload';
import { getFullImageUrl } from '@/common/tools';

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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
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
import { getImageUrl } from '@/lib/utils';

// ─── Design tokens ────────────────────────────────────────────────────────────
const ACCENT = '#ace600';

const inputCls =
  'w-full bg-[#111827] border border-white/10 rounded-xl text-[#f0f4ff] text-sm px-3.5 py-2.5 ' +
  'outline-none transition-all duration-150 ' +
  'focus:border-[#ace600] focus:ring-2 focus:ring-[#ace600]/20 ' +
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-transparent ' +
  'placeholder:text-white/20';

const labelCls = 'block text-[11px] font-semibold text-[#4a5a72] uppercase tracking-widest mb-1.5';

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

// ─── Tabs config ──────────────────────────────────────────────────────────────
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

// ─── Club type options (backend) ─────────────────────────────────────────────
const CLUB_TYPES = {
  RECREATIONAL: 'recreational',
  COMPETITIVE: 'competitive',
  TRAINING: 'training',
  MIXED: 'mixed',
} as const;

// ─── Club type display options (for UI with Spanish labels) ───────────────────
const CLUB_TYPES_OPTIONS = [
  { value: CLUB_TYPES.RECREATIONAL, label: 'Recreativo' },
  { value: CLUB_TYPES.COMPETITIVE, label: 'Competitivo' },
  { value: CLUB_TYPES.TRAINING, label: 'Escuela' },
  { value: CLUB_TYPES.MIXED, label: 'Mixto' },
] as const;

// ─── Membership status options ────────────────────────────────────────────────
const MEMBERSHIP_STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'expired', label: 'Expirado' },
] as const;

// ─── Subscription plan options ────────────────────────────────────────────────
const SUBSCRIPTION_PLAN_OPTIONS = [
  { value: 'basic', label: 'Básico' },
  { value: 'premium', label: 'Premium' },
] as const;

// ─── Mexican states ───────────────────────────────────────────────────────────
const MEXICAN_STATES = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
] as const;

// ─── Shared primitives ────────────────────────────────────────────────────────

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
        <SelectTrigger
          className={`${inputCls} bg-[#111827] border-white/10 text-[#f0f4ff]`}
          style={{
            background: 'rgba(17, 24, 39, 1)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(240, 244, 255, 1)',
          }}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent
          className="bg-[#111827] border-white/10 text-[#f0f4ff]"
          style={{
            background: 'rgba(17, 24, 39, 1)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          {options.map((option) => {
            const optValue = typeof option === 'string' ? option.toLowerCase() : option.value;
            const optLabel = typeof option === 'string' ? option : option.label;
            return (
              <SelectItem key={optValue} value={optValue} className="text-[#f0f4ff]">
                {optLabel}
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  options: readonly string[];
  placeholder?: string;
}) {
  const [search, setSearch] = useState('');
  const filtered = options.filter((opt) => opt.toLowerCase().includes(search.toLowerCase()));

  // Handler for input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (val === '') {
      onChange(''); // Clear the value in parent
    }
  };

  return (
    <div className="relative z-40">
      <label className={labelCls}>{label}</label>
      <input
        type="text"
        value={search !== '' ? search : value}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className={inputCls}
        autoComplete="off"
      />
      {search && filtered.length > 0 && (
        <div
          className="mt-2 border border-white/10 rounded-xl overflow-hidden max-h-48 overflow-y-auto"
          style={{
            background: 'rgba(17, 24, 39, 1)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            position: 'absolute',
          }}
        >
          {filtered.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setSearch('');
              }}
              disabled={disabled}
              className="w-full text-left px-3.5 py-2.5 text-sm text-[#f0f4ff] hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
      {search && filtered.length === 0 && (
        <div className="mt-2 px-3.5 py-2.5 text-sm text-[#4a5a72] text-center">
          No se encontraron resultados
        </div>
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
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-white/[0.05] last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[#f0f4ff]">{label}</p>
        {description && <p className="text-xs text-[#4a5a72] mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className="relative shrink-0 w-11 h-6 rounded-full transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: checked ? ACCENT : 'rgba(255,255,255,0.1)' }}
      >
        <span
          className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

/** Wrapper card for every tab's content */
function TabCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0d1421] border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-5">
      {children}
    </div>
  );
}

/** Save / Cancel bar – always in the DOM, shown/hidden via CSS to avoid React reconciliation crashes */
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
        className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border border-white/10 shadow-2xl"
        style={{ background: 'rgba(13,20,33,0.96)', backdropFilter: 'blur(16px)' }}
      >
        <p className="text-sm text-[#4a5a72]">Cambios sin guardar</p>
        <div className="flex gap-2.5">
          {/* Plain <button> to avoid shadcn DOM reconciliation issues */}
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm border border-white/10 text-[#f0f4ff] bg-transparent hover:bg-white/5 disabled:opacity-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Descartar
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-black disabled:opacity-50 transition-opacity"
            style={{ background: ACCENT }}
          >
            <Loader2
              className="w-3.5 h-3.5 animate-spin"
              style={{ display: loading ? 'inline' : 'none' }}
            />
            <Check className="w-3.5 h-3.5" style={{ display: loading ? 'none' : 'inline' }} />
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form type ────────────────────────────────────────────────────────────────
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

// ─── Empty form data for creating new clubs ─────────────────────────────────────
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
  availability: {
    court_booking: true,
    drop_in: true,
    leagues: false,
    tournaments: false,
  },
  clubRules: '',
  dressCode: '',
  totalTournaments: 0,
  totalMatches: 0,
  averageRating: '',
  reviewCount: 0,
  isActive: true,
  isVerified: false,
  isFeatured: false,
  settings: {
    allow_guest_play: true,
    max_guest_visits: 3,
    auto_approve_members: false,
  },
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
  const user = useSelector((state: RootState) => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [hours, setHours] = useState<ClubOperatingHours | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('identity');
  const [isNewClub, setIsNewClub] = useState(false);
  // Raw string state for comma-separated fields – avoids mid-keystroke splitting
  const [courtTypesRaw, setCourtTypesRaw] = useState('');
  const [photosRaw, setPhotosRaw] = useState('');
  // Upload states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    dispatch(fetchClubProfile());
  }, [dispatch]);

  useEffect(() => {
    // Only seed form from Redux when NOT editing – prevents overwriting unsaved edits
    // when updateClubProfile writes the updated profile back to the Redux store on save.
    if (profile && !isEditing) {
      const f = toForm(profile);
      setFormData(f);
      setHours(profile.operatingHours ?? null);
      setCourtTypesRaw(f.courtTypes.join(', '));
      setPhotosRaw(f.photos.join(', '));
      setIsNewClub(false);
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initialize empty form when club not found (for creating new club)
  useEffect(() => {
    if (profileError && !formData && !profile) {
      setFormData(emptyFormData);
      setHours(emptyFormData.operatingHours);
      setCourtTypesRaw(emptyFormData.courtTypes.join(', '));
      setPhotosRaw(emptyFormData.photos.join(', '));
      setIsNewClub(true);
      setIsEditing(true);
    }
  }, [profileError, formData, profile]);

  // ── Functional updater for nested objects to avoid stale-closure bugs ─────
  const set = (key: keyof FormData, val: any) => setFormData((p) => (p ? { ...p, [key]: val } : p));

  // Nested-safe setters that use functional updater pattern to always read
  // the LATEST state, preventing stale-closure overwrites when toggling fast.
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

  const handleSave = async () => {
    try {
      // Commit raw comma-separated fields before saving in case user didn't blur
      const finalCourtTypes = courtTypesRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Debug: Log image data
      console.log('Image data on save:', {
        logoUrl: formData.logoUrl ? `${formData.logoUrl.substring(0, 50)}...` : 'EMPTY',
        bannerImage: formData.bannerImage ? `${formData.bannerImage.substring(0, 50)}...` : 'EMPTY',
        photosCount: formData.photos?.length || 0,
      });

      if (isNewClub && profileError) {
        const response = await dispatch(
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
            operating_hours: hours ?? formData?.operatingHours,
            club_rules: formData.clubRules,
            dress_code: formData.dressCode,
            logo: formData.logoUrl || undefined,
            banner: formData.bannerImage || undefined,
            photos: formData.photos && formData.photos.length > 0 ? formData.photos : undefined,
          }),
        ).unwrap();
        console.log('Club creado:', response);
        if (!(response as any)?.success) {
          setIsNewClub(true);
        } else {
          setIsNewClub(true);
          setIsEditing(false);
        }

        toast({ title: 'Club creado', description: 'El club ha sido creado exitosamente.' });
      } else {
        await dispatch(
          updateClubProfile({
            ...formData,
            courtTypes: finalCourtTypes,
            photos: formData.photos,
            logoUrl: formData.logoUrl,
            bannerImage: formData.bannerImage,
            operatingHours: hours ?? formData?.operatingHours,
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
      setPhotosRaw(f.photos.join(', '));
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteClubAccount('confirm-delete')).unwrap();
      toast({
        title: 'Club eliminado',
        description: 'El club ha sido eliminado.',
        variant: 'destructive',
      });
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

  // Helper to read file as base64
  function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Logo upload handler (base64)
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const base64 = await readFileAsBase64(file);
      console.log('Logo base64 read:', base64.substring(0, 50));
      setFormData((p) => {
        const updated = p ? { ...p, logoUrl: base64 } : p;
        console.log('FormData after logo update:', {
          logoUrl: updated?.logoUrl ? `${updated.logoUrl.substring(0, 50)}...` : 'EMPTY',
        });
        return updated;
      });
      toast({ title: 'Logo seleccionado', description: 'El logo será guardado al hacer save.' });
    } catch (err) {
      console.error('Logo upload error:', err);
      toast({
        title: 'Error',
        description: 'No se pudo leer el logo',
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  }

  // Banner upload handler (base64)
  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const base64 = await readFileAsBase64(file);
      console.log('Banner base64 read:', base64.substring(0, 50));
      setFormData((p) => {
        const updated = p ? { ...p, bannerImage: base64 } : p;
        console.log('FormData after banner update:', {
          bannerImage: updated?.bannerImage
            ? `${updated.bannerImage.substring(0, 50)}...`
            : 'EMPTY',
        });
        return updated;
      });
      toast({
        title: 'Banner seleccionado',
        description: 'El banner será guardado al hacer save.',
      });
    } catch (err) {
      console.error('Banner upload error:', err);
      toast({
        title: 'Error',
        description: 'No se pudo leer el banner',
        variant: 'destructive',
      });
    } finally {
      setUploadingBanner(false);
    }
  }

  // Photos upload handler (base64)
  async function handlePhotosUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingPhotos(true);
    try {
      const base64Array = await Promise.all(
        files.map(async (file) => {
          return readFileAsBase64(file);
        }),
      );
      console.log('Photos base64 read:', base64Array.length, 'items');
      setFormData((p) => {
        const updated = p ? { ...p, photos: [...p.photos, ...base64Array] } : p;
        console.log('FormData after photos update:', { photosCount: updated?.photos?.length || 0 });
        return updated;
      });
      toast({
        title: 'Fotos seleccionadas',
        description: 'Las fotos serán guardadas al hacer save.',
      });
    } catch (err) {
      console.error('Photos upload error:', err);
      toast({
        title: 'Error',
        description: 'No se pudieron leer una o más fotos',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhotos(false);
    }
  }

  if (profileLoading && !formData) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: ACCENT }} />
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

  const getStatusLabel = () => {
    const option = MEMBERSHIP_STATUS_OPTIONS.find((opt) => opt.value === formData.membershipStatus);
    return option ? option.label : formData.membershipStatus;
  };

  const statusColor =
    formData.membershipStatus === 'active'
      ? { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)', text: '#22c55e' }
      : formData.membershipStatus === 'expired'
        ? { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', text: '#ef4444' }
        : { bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.25)', text: '#fb923c' };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080c14] text-[#f0f4ff] p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-white/[0.06]">
          {/* Club identity */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div
                className="w-16 h-16 rounded-2xl border border-white/10 flex items-center justify-center text-xl font-bold overflow-hidden"
                style={{
                  background: formData.logoUrl
                    ? `url(${formData.logoUrl}) center/cover no-repeat`
                    : 'linear-gradient(135deg, #1a2744, #0f1e3a)',
                  color: ACCENT,
                }}
              >
                {!formData.logoUrl && initials}
              </div>
              <span
                className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#080c14]"
                style={{ background: formData.isActive ? '#22c55e' : '#4b5563' }}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white leading-tight">
                  {formData.name || (isNewClub ? 'Nuevo Club' : 'Mi Club')}
                </h1>
                {formData.isVerified && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                    style={{
                      background: 'rgba(172,230,0,0.1)',
                      color: ACCENT,
                      border: '1px solid rgba(172,230,0,0.2)',
                    }}
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
              <p className="text-[#4a5a72] text-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {[formData.city, formData.state].filter(Boolean).join(', ') || 'Sin ubicación'}
              </p>
            </div>
          </div>

          {/* Action buttons – plain <button> elements to avoid shadcn Slot DOM reconciliation crash */}
          <div className="flex gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
              disabled={profileLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-[#f0f4ff] bg-transparent hover:bg-white/5 disabled:opacity-40 transition-colors"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {isEditing ? 'Cancelar' : isNewClub ? 'Crear Club' : 'Editar'}
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  disabled={profileLoading || isNewClub}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-red-500/20 text-red-400 bg-red-500/10 hover:bg-red-500/15 disabled:opacity-40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-[#0d1421] border-white/10 rounded-2xl">
                <AlertDialogHeader>
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-3">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <AlertDialogTitle className="text-lg font-bold text-[#f0f4ff]">
                    ¿Eliminar este club?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-[#7a8ba8] text-sm leading-relaxed">
                    Esta acción no se puede deshacer. Se eliminarán permanentemente el club y todos
                    sus datos: miembros, torneos, canchas y pagos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-white/10 text-[#f0f4ff] hover:bg-white/5 rounded-xl bg-transparent">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl border-0"
                  >
                    Sí, eliminar club
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* ── Stats row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Members */}
          <div className="bg-[#111827] border border-white/10 rounded-xl p-4">
            <p className="text-[11px] text-[#4a5a72] uppercase tracking-widest mb-2">Miembros</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold" style={{ color: ACCENT }}>
                {formData.memberCount}
              </span>
              {formData.maxMembers > 0 && (
                <span className="text-xs text-[#4a5a72] mb-0.5">/ {formData.maxMembers} máx</span>
              )}
            </div>
            {formData.maxMembers > 0 && (
              <div className="mt-2 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((formData.memberCount / formData.maxMembers) * 100, 100)}%`,
                    background: ACCENT,
                  }}
                />
              </div>
            )}
          </div>

          {/* Tournaments */}
          <div className="bg-[#111827] border border-white/10 rounded-xl p-4">
            <p className="text-[11px] text-[#4a5a72] uppercase tracking-widest mb-2">Torneos</p>
            <span className="text-2xl font-bold" style={{ color: ACCENT }}>
              {formData.totalTournaments}
            </span>
            <p className="text-[11px] text-[#4a5a72] mt-1">
              {formData.totalMatches} partidos totales
            </p>
          </div>

          {/* Rating */}
          <div className="bg-[#111827] border border-white/10 rounded-xl p-4">
            <p className="text-[11px] text-[#4a5a72] uppercase tracking-widest mb-2">Rating</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-bold" style={{ color: ACCENT }}>
                {formData.averageRating || '—'}
              </span>
              {formData.averageRating && (
                <span className="text-xs text-[#4a5a72] mb-0.5">/ 5.0</span>
              )}
            </div>
            <p className="text-[11px] text-[#4a5a72] mt-1">{formData.reviewCount} reseñas</p>
          </div>

          {/* Membership status */}
          <div className="bg-[#111827] border border-white/10 rounded-xl p-4">
            <p className="text-[11px] text-[#4a5a72] uppercase tracking-widest mb-2">Suscripción</p>
            <span
              className="inline-block text-xs font-bold px-2.5 py-1 rounded-lg capitalize"
              style={{
                background: statusColor.bg,
                color: statusColor.text,
                border: `1px solid ${statusColor.border}`,
              }}
            >
              {getStatusLabel() || 'Sin estado'}
            </span>
            {formData.subscriptionPlan &&
              (() => {
                const planOption = SUBSCRIPTION_PLAN_OPTIONS.find(
                  (opt) => opt.value === formData.subscriptionPlan,
                );
                const planLabel = planOption ? planOption.label : formData.subscriptionPlan;
                return <p className="text-[11px] text-[#4a5a72] mt-2">Plan: {planLabel}</p>;
              })()}
          </div>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          {/* Tab list – horizontal scroll on mobile */}
          <TabsList className="flex h-auto w-full overflow-x-auto gap-1 bg-[#111827] border border-white/[0.06] rounded-xl p-1.5">
            {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-[#4a5a72] whitespace-nowrap transition-all data-[state=active]:font-semibold data-[state=active]:text-[#080c14] data-[state=active]:bg-[#ace600]"
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Identity ─────────────────────────────────────────────────── */}
          <TabsContent value="identity" className="mt-4">
            <TabCard>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Nombre del Club"
                  value={formData.name}
                  onChange={(v) => set('name', v)}
                  disabled={isDisabled}
                  placeholder="Nombre oficial del club"
                />
                <Dropdown
                  label="Tipo de Club"
                  value={formData.clubType}
                  onChange={(v) => set('clubType', v)}
                  disabled={isDisabled}
                  options={CLUB_TYPES_OPTIONS as any}
                  placeholder="Seleccionar tipo de club"
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
                placeholder="Describe tu club brevemente..."
              />
              <Field
                label="Notas Internas"
                value={formData.notes}
                onChange={(v) => set('notes', v)}
                disabled={isDisabled}
                textarea
                rows={2}
                placeholder="Notas de administración..."
              />
            </TabCard>
          </TabsContent>

          {/* ── Contact ──────────────────────────────────────────────────── */}
          <TabsContent value="contact" className="mt-4">
            <TabCard>
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
            </TabCard>
          </TabsContent>

          {/* ── Location ─────────────────────────────────────────────────── */}
          <TabsContent value="location" className="mt-4">
            <TabCard>
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
                  options={MEXICAN_STATES}
                  placeholder="Buscar estado..."
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
            </TabCard>
          </TabsContent>

          {/* ── Courts ───────────────────────────────────────────────────── */}
          <TabsContent value="courts" className="mt-4">
            <TabCard>
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
                {/* courtTypes: badge-based input */}
                <div>
                  <label className={labelCls}>Tipos de Cancha</label>
                  <div className="flex flex-col gap-2.5">
                    {/* Badge display */}
                    {formData.courtTypes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.courtTypes.map((courtType, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                            style={{
                              background: 'rgba(172,230,0,0.12)',
                              border: '1px solid rgba(172,230,0,0.25)',
                              color: ACCENT,
                            }}
                          >
                            <span>{courtType}</span>
                            {!isDisabled && (
                              <button
                                type="button"
                                onClick={() =>
                                  set(
                                    'courtTypes',
                                    formData.courtTypes.filter((_, i) => i !== idx),
                                  )
                                }
                                className="hover:opacity-70 transition-opacity"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Input field */}
                    <div className="flex gap-2">
                      <input
                        className={inputCls}
                        type="text"
                        value={courtTypesRaw}
                        placeholder="Agregar tipo de cancha..."
                        disabled={isDisabled}
                        onChange={(e) => setCourtTypesRaw(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && courtTypesRaw.trim()) {
                            e.preventDefault();
                            const newType = courtTypesRaw.trim();
                            if (!formData.courtTypes.includes(newType)) {
                              set('courtTypes', [...formData.courtTypes, newType]);
                              setCourtTypesRaw('');
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newType = courtTypesRaw.trim();
                          if (newType && !formData.courtTypes.includes(newType)) {
                            set('courtTypes', [...formData.courtTypes, newType]);
                            setCourtTypesRaw('');
                          }
                        }}
                        disabled={isDisabled || !courtTypesRaw.trim()}
                        className="px-3 py-2 rounded-lg text-sm font-medium border shrink-0 transition-colors"
                        style={{
                          background: isDisabled || !courtTypesRaw.trim() ? '#1a2744' : ACCENT,
                          color: isDisabled || !courtTypesRaw.trim() ? '#4a5a72' : '#080c14',
                          borderColor:
                            isDisabled || !courtTypesRaw.trim() ? 'rgba(255,255,255,0.06)' : ACCENT,
                          cursor: isDisabled || !courtTypesRaw.trim() ? 'not-allowed' : 'pointer',
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
              <div className="bg-[#111827] border border-white/[0.06] rounded-xl px-4 mt-1">
                <Toggle
                  label="Tiene Canchas Propias"
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
            </TabCard>
          </TabsContent>

          {/* ── Availability ─────────────────────────────────────────────── */}
          <TabsContent value="availability" className="mt-4">
            <TabCard>
              <div className="bg-[#111827] border border-white/[0.06] rounded-xl px-4">
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
            </TabCard>
          </TabsContent>

          {/* ── Membership ───────────────────────────────────────────────── */}
          <TabsContent value="membership" className="mt-4">
            <TabCard>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Dropdown
                  label="Estado de Membresía"
                  value={formData.membershipStatus}
                  onChange={(v) => set('membershipStatus', v)}
                  disabled={true}
                  options={MEMBERSHIP_STATUS_OPTIONS as any}
                  placeholder="Seleccionar estado"
                />
                <Dropdown
                  label="Plan de Suscripción"
                  value={formData.subscriptionPlan}
                  onChange={(v) => set('subscriptionPlan', v)}
                  disabled={true}
                  options={SUBSCRIPTION_PLAN_OPTIONS as any}
                  placeholder="Seleccionar plan"
                />
                <Field
                  label="Vence el"
                  value={formData.membershipExpiresAt?.split('T')[0] || ''}
                  onChange={(v) => set('membershipExpiresAt', v)}
                  disabled={true}
                  type="date"
                />
              </div>
              <div className="bg-[#111827] border border-white/[0.06] rounded-xl px-4 mt-1">
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
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                  label="Cantidad de Reseñas"
                  value={formData.reviewCount.toString()}
                  onChange={(v) => set('reviewCount', Number(v))}
                  disabled={true}
                  type="number"
                />
              </div>
            </TabCard>
          </TabsContent>

          {/* ── Rules ────────────────────────────────────────────────────── */}
          <TabsContent value="rules" className="mt-4">
            <TabCard>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Reglas del Club"
                  value={formData.clubRules}
                  onChange={(v) => set('clubRules', v)}
                  disabled={isDisabled}
                  textarea
                  rows={5}
                  placeholder="Normas de convivencia, uso de instalaciones..."
                />
                <Field
                  label="Código de Vestimenta"
                  value={formData.dressCode}
                  onChange={(v) => set('dressCode', v)}
                  disabled={isDisabled}
                  textarea
                  rows={5}
                  placeholder="Indumentaria requerida..."
                />
              </div>
              <div className="bg-[#111827] border border-white/[0.06] rounded-xl px-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Máx. Visitas de Invitado"
                  value={formData?.settings?.max_guest_visits?.toString()}
                  onChange={(v) => setSettings('max_guest_visits', Number(v))}
                  disabled={isDisabled}
                  type="number"
                />
              </div>
            </TabCard>
          </TabsContent>

          {/* ── Media ────────────────────────────────────────────────────── */}
          <TabsContent value="media" className="mt-4">
            <TabCard>
              {/* Logo */}
              <div>
                <label className={labelCls}>Logo del Club</label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl border border-white/10 shrink-0 flex items-center justify-center text-lg font-bold overflow-hidden"
                    style={{
                      background: formData.logoUrl
                        ? `url(${getImageUrl(formData.logoUrl)}) center/cover no-repeat`
                        : 'rgba(172,230,0,0.08)',
                      color: ACCENT,
                    }}
                  >
                    {!formData.logoUrl && (
                      <ImageIcon className="w-6 h-6 opacity-40" style={{ color: ACCENT }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <label
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed text-sm font-medium cursor-pointer transition-colors ${
                        isDisabled
                          ? 'border-white/[0.06] text-[#4a5a72] cursor-not-allowed'
                          : 'border-[#ace600]/30 text-[#ace600] hover:bg-[#ace600]/5'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      {formData.logoUrl ? 'Cambiar logo' : 'Subir logo'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isDisabled || uploadingLogo}
                        onChange={handleLogoUpload}
                      />
                      {uploadingLogo && <span className="text-xs text-[#4a5a72]">Subiendo...</span>}
                    </label>
                    {formData.logoUrl && !isDisabled && (
                      <button
                        type="button"
                        onClick={() => set('logoUrl', '')}
                        className="mt-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                      >
                        Eliminar logo
                      </button>
                    )}
                    <p className="text-[11px] text-[#4a5a72] mt-1">PNG, JPG o WEBP · máx. 2 MB</p>
                  </div>
                </div>
              </div>

              {/* Banner */}
              <div>
                <label className={labelCls}>Imagen de Banner</label>
                <div
                  className="relative w-full h-28 rounded-xl border border-dashed overflow-hidden flex items-center justify-center transition-colors"
                  style={{
                    background: formData.bannerImage
                      ? `url(${formData.bannerImage}) center/cover no-repeat`
                      : 'rgba(255,255,255,0.02)',
                    borderColor: isDisabled ? 'rgba(255,255,255,0.06)' : 'rgba(172,230,0,0.25)',
                  }}
                >
                  {!formData.bannerImage && (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <ImageIcon className="w-6 h-6 opacity-20" style={{ color: ACCENT }} />
                      <span className="text-xs text-[#4a5a72]">Sin banner</span>
                    </div>
                  )}
                  {formData.bannerImage && !isDisabled && (
                    <button
                      type="button"
                      onClick={() => set('bannerImage', '')}
                      className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-white" />
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
                      {uploadingBanner && (
                        <span className="text-xs text-[#4a5a72]">Subiendo...</span>
                      )}
                    </label>
                  )}
                </div>
                <p className="text-[11px] text-[#4a5a72] mt-1.5">
                  Recomendado: 1200×400px · PNG o JPG
                </p>
              </div>

              {/* Additional photos */}
              <div>
                <label className={labelCls}>Fotos del Club</label>
                <div className="flex flex-wrap gap-3">
                  {formData.photos.map((url, i) => (
                    <div
                      key={i}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0"
                    >
                      <img
                        src={getFullImageUrl(url)}
                        alt={`Foto ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {!isDisabled && (
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              'photos',
                              formData.photos.filter((_, idx) => idx !== i),
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
                      className="w-20 h-20 rounded-xl border border-dashed flex flex-col items-center justify-center cursor-pointer shrink-0 transition-colors hover:bg-[#ace600]/5"
                      style={{ borderColor: 'rgba(172,230,0,0.3)' }}
                    >
                      <Plus className="w-5 h-5 mb-0.5" style={{ color: ACCENT }} />
                      <span className="text-[10px] font-semibold" style={{ color: ACCENT }}>
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
                      {uploadingPhotos && (
                        <span className="text-xs text-[#4a5a72]">Subiendo...</span>
                      )}
                    </label>
                  )}
                </div>
                {formData.photos.length === 0 && isDisabled && (
                  <p className="text-xs text-[#4a5a72] mt-2">
                    Sin fotos. Activa la edición para agregar.
                  </p>
                )}
              </div>

              {/* Social media */}
              <div>
                <label className={labelCls}>Redes Sociales</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field
                    label="Facebook"
                    value={formData.socialMedia.facebook || ''}
                    onChange={(v) => setSocialMedia('facebook', v)}
                    disabled={isDisabled}
                    placeholder="https://facebook.com/..."
                  />
                  <Field
                    label="Instagram"
                    value={formData.socialMedia.instagram || ''}
                    onChange={(v) => setSocialMedia('instagram', v)}
                    disabled={isDisabled}
                    placeholder="https://instagram.com/..."
                  />
                  <Field
                    label="Twitter / X"
                    value={formData.socialMedia.twitter || ''}
                    onChange={(v) => setSocialMedia('twitter', v)}
                    disabled={isDisabled}
                    placeholder="https://twitter.com/..."
                  />
                </div>
              </div>
            </TabCard>
          </TabsContent>

          {/* ── Owner ────────────────────────────────────────────────────── */}
          <TabsContent value="owner" className="mt-4">
            <TabCard>
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
                  label="Foto del Propietario (URL)"
                  value={formData.owner.profilePhoto || ''}
                  onChange={(v) => setOwner('profilePhoto', v)}
                  disabled={isDisabled}
                />
              </div>
              {/* Owner preview */}
              {(formData.owner.name || formData.owner.email) && (
                <div className="flex items-center gap-3 p-4 bg-[#111827] border border-white/[0.06] rounded-xl">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden"
                    style={{
                      background: formData.owner.profilePhoto
                        ? `url(${formData.owner.profilePhoto}) center/cover no-repeat`
                        : 'rgba(172,230,0,0.1)',
                      color: ACCENT,
                      border: '1px solid rgba(172,230,0,0.2)',
                    }}
                  >
                    {!formData.owner.profilePhoto && formData.owner.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{formData.owner.name || '—'}</p>
                    <p className="text-xs text-[#4a5a72]">{formData.owner.email || '—'}</p>
                  </div>
                </div>
              )}
            </TabCard>
          </TabsContent>

          {/* ── Hours ────────────────────────────────────────────────────── */}
          <TabsContent value="hours" className="mt-4">
            <TabCard>
              {/* Column headers */}
              <div className="hidden sm:grid grid-cols-[1fr_140px_140px] pb-3 border-b border-white/[0.05]">
                {['Día', 'Apertura', 'Cierre'].map((h) => (
                  <span key={h} className={labelCls}>
                    {h}
                  </span>
                ))}
              </div>

              {hours ? (
                <div className="flex flex-col gap-0">
                  {DAYS.map(({ key, label, short }) => {
                    const isSet = !!(hours[key]?.open || hours[key]?.close);
                    return (
                      <div
                        key={key}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_140px_140px] items-center gap-3 py-3 -mx-1 px-1 rounded-xl hover:bg-white/[0.02] transition-colors border-b border-white/[0.04] last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                            style={{
                              background: isSet ? 'rgba(172,230,0,0.1)' : 'rgba(255,255,255,0.04)',
                              color: isSet ? ACCENT : '#4a5a72',
                              border: `1px solid ${isSet ? 'rgba(172,230,0,0.2)' : 'rgba(255,255,255,0.06)'}`,
                            }}
                          >
                            {short}
                          </span>
                          <span className="text-sm font-medium text-[#f0f4ff]">{label}</span>
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
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                    style={{
                      background: 'rgba(172,230,0,0.08)',
                      border: '1px solid rgba(172,230,0,0.15)',
                      color: ACCENT,
                    }}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-medium text-[#f0f4ff]">Sin horarios configurados</p>
                  <p className="text-xs text-[#4a5a72] mt-1">
                    Activa la edición para agregar horarios
                  </p>
                </div>
              )}
            </TabCard>
          </TabsContent>
        </Tabs>

        {/* ── Sticky save bar – always mounted, visibility via CSS to avoid React DOM crash ── */}
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
