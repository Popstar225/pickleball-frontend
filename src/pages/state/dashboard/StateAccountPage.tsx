import { useEffect, useState, useRef } from 'react';
import { AvatarCropDialog } from '@/components/ui/AvatarCropDialog';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchStateProfile,
  updateStateProfile,
  deleteStateAccount,
} from '@/store/slices/stateDashboardSlice';
import { AppDispatch, RootState } from '@/store';
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
import {
  MapPin,
  Edit,
  X,
  Trash2,
  AlertTriangle,
  Loader2,
  Check,
  Mail,
  Phone,
  Globe,
  User,
  Shield,
  Users,
  Building2,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { getImageUrl } from '@/lib/utils';

// ─── Tokens ───────────────────────────────────────────────────────────────────
const A = '#ace600';

const inputCls =
  'w-full bg-white/[0.04] border border-white/[0.08] rounded-xl text-white/80 text-sm px-3.5 py-2.5 ' +
  'outline-none transition-all duration-150 ' +
  'focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03] focus:ring-0 ' +
  'disabled:opacity-35 disabled:cursor-not-allowed ' +
  'placeholder:text-white/20';

const labelCls = 'block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1.5';

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  textarea = false,
  rows = 3,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {textarea ? (
        <textarea
          className={`${inputCls} resize-y`}
          style={{ minHeight: rows * 28 }}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={readOnly}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={inputCls}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={readOnly}
          placeholder={placeholder}
        />
      )}
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

function SectionHeading({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-1">
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

// ─── Form type — keys match backend allowedFields exactly ─────────────────────
type FormData = {
  full_name: string;     // → coordinatorName
  email: string;
  phone: string;
  address: string;
  website: string;
  bio: string;           // → description
  profile_photo: string; // → logoUrl
};

const emptyForm: FormData = {
  full_name: '',
  email: '',
  phone: '',
  address: '',
  website: '',
  bio: '',
  profile_photo: '',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StateAccountPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, profileLoading } = useSelector((s: RootState) => s.stateDashboard);
  const { user } = useSelector((s: RootState) => s.auth);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [saved, setSaved] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletionConfirmed, setDeletionConfirmed] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  useEffect(() => {
    dispatch(fetchStateProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      const data: FormData = {
        full_name: profile.coordinatorName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        website: profile.website || '',
        bio: profile.description || '',
        profile_photo: profile.logoUrl || '',
      };
      setForm(data);
      setSaved(data);
    }
  }, [profile]);

  const set = (key: keyof FormData) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    setCropFileName(file.name);
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile: File) => {
    setCropSrc(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setPhotoPreview(base64);
      setForm((f) => ({ ...f, profile_photo: base64 }));
    };
    reader.readAsDataURL(croppedFile);
  };

  const handleSave = async () => {
    if (!form.full_name || !form.email) {
      toast.error('El nombre y el correo son requeridos');
      return;
    }
    setSaving(true);
    try {
      await dispatch(updateStateProfile(form)).unwrap();
      setSaved(form);
      setPhotoPreview(null);
      dispatch(fetchStateProfile());
      toast.success('Perfil actualizado correctamente');
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm(saved);
    setPhotoPreview(null);
  };

  const handleDeleteAccount = async () => {
    if (!deletionConfirmed) return;
    try {
      await dispatch(deleteStateAccount()).unwrap();
      toast.success('Cuenta eliminada');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (err: any) {
      toast.error(err?.message || 'No se pudo eliminar la cuenta');
    }
  };

  const avatarSrc = photoPreview || (profile?.logoUrl ? getImageUrl(profile.logoUrl) : null);
  const initials = (name: string) =>
    name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ED';

  if (profileLoading && !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#ace600] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <User className="w-5 h-5 text-[#ace600]" />
          <h1 className="text-[22px] font-bold text-white tracking-tight">Mi Cuenta</h1>
        </div>
        <p className="text-xs text-white/25">Gestiona la información de la delegación estatal</p>
      </div>

      {/* ── Identity card ─────────────────────────────────────────────────── */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl p-5">
        <div className="flex items-start gap-4">
          {/* Avatar + upload */}
          <div className="relative shrink-0 group">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Logo"
                className="w-16 h-16 rounded-2xl object-cover border border-white/[0.07]"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl border border-[#ace600]/20 flex items-center justify-center text-lg font-black select-none"
                style={{ background: 'rgba(172,230,0,0.08)', color: A }}
              >
                {initials(profile?.stateName || form.full_name || 'ED')}
              </div>
            )}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Cambiar foto"
            >
              <Upload className="w-4 h-4 text-white" />
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          {/* Identity text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-lg font-bold text-white truncate">
                {profile?.stateName || 'Delegación Estatal'}
              </p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
                <Shield className="w-2.5 h-2.5" />
                Delegación Estatal
              </span>
            </div>
            {form.full_name && (
              <p className="text-xs text-white/35 mt-0.5 flex items-center gap-1">
                <User className="w-3 h-3" />
                {form.full_name}
              </p>
            )}
            {form.email && (
              <p className="text-xs text-white/35 mt-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {form.email}
              </p>
            )}
            {form.phone && (
              <p className="text-xs text-white/35 mt-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {form.phone}
              </p>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/[0.05]">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">
                Miembros Activos
              </p>
              <p className="text-xl font-bold text-[#ace600]">{profile?.totalMembers ?? 0}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-[#ace600]" />
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-1">
                Clubes Activos
              </p>
              <p className="text-xl font-bold text-[#ace600]">{profile?.activeClubs ?? 0}</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-[#ace600]/10 border border-[#ace600]/20 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5 text-[#ace600]" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Contact info ──────────────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeading icon={User}>Información del Coordinador</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Nombre Completo"
            value={form.full_name}
            onChange={set('full_name')}
            placeholder="Nombre del coordinador"
          />
          <Field
            label="Correo Electrónico"
            value={form.email}
            onChange={set('email')}
            type="email"
            placeholder="coordinador@estado.gob.mx"
          />
          <Field
            label="Teléfono"
            value={form.phone}
            onChange={set('phone')}
            type="tel"
            placeholder="+52 (555) 555-5555"
          />
          <Field
            label="Sitio Web"
            value={form.website}
            onChange={set('website')}
            placeholder="https://delegacion.estado.gob.mx"
          />
        </div>
      </SectionCard>

      {/* ── Location & description ────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeading icon={MapPin}>Ubicación y Descripción</SectionHeading>
        <Field
          label="Dirección"
          value={form.address}
          onChange={set('address')}
          placeholder="Dirección de la delegación"
        />
        <Field
          label="Descripción"
          value={form.bio}
          onChange={set('bio')}
          textarea
          rows={4}
          placeholder="Información sobre la delegación estatal…"
        />
      </SectionCard>

      {/* ── Read-only account info ────────────────────────────────────────── */}
      <SectionCard>
        <SectionHeading icon={Shield}>Información de la Cuenta</SectionHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Estado"
            value={user?.state || profile?.stateName || '—'}
            onChange={() => {}}
            readOnly
          />
          <Field
            label="Tipo de Cuenta"
            value="Delegación Estatal"
            onChange={() => {}}
            readOnly
          />
          {profile?.foundationDate && (
            <Field
              label="Miembro Desde"
              value={new Date(profile.foundationDate).toLocaleDateString('es-MX', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              onChange={() => {}}
              readOnly
            />
          )}
          {profile?.id && (
            <Field
              label="ID de Cuenta"
              value={profile.id}
              onChange={() => {}}
              readOnly
            />
          )}
        </div>
      </SectionCard>

      {/* ── Sticky save bar ───────────────────────────────────────────────── */}
      <SaveBar
        visible={isDirty}
        onSave={handleSave}
        onCancel={handleDiscard}
        loading={saving}
      />

      {/* ── Danger zone ───────────────────────────────────────────────────── */}
      <div className="bg-red-500/[0.03] border border-red-500/15 rounded-2xl p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-6 h-6 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-3 h-3 text-red-400" />
          </div>
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-red-400/60">
            Zona de Peligro
          </span>
          <div className="flex-1 h-px bg-red-500/10" />
        </div>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-white/70">Eliminar cuenta</p>
            <p className="text-xs text-white/30 mt-0.5">
              Esta acción es irreversible. Se eliminarán todos los datos de esta delegación.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold border border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar Cuenta
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#0d1117] border border-red-500/20 rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  ¿Eliminar cuenta permanentemente?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-white/50">
                  Esta acción no puede deshacerse. Se eliminarán todos los datos asociados a esta
                  delegación estatal.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-2">
                <button
                  type="button"
                  onClick={() => setDeletionConfirmed(!deletionConfirmed)}
                  className="flex items-center gap-2.5 text-sm text-white/60 cursor-pointer hover:text-white/80 transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                      deletionConfirmed ? 'bg-red-500 border-red-500' : 'border-white/20'
                    }`}
                  >
                    {deletionConfirmed && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  Confirmo que deseo eliminar esta cuenta
                </button>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] rounded-xl">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  disabled={!deletionConfirmed}
                  className="bg-red-600 hover:bg-red-500 text-white rounded-xl disabled:opacity-40"
                >
                  Eliminar Cuenta
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {cropSrc && (
        <AvatarCropDialog
          imageSrc={cropSrc}
          originalFileName={cropFileName}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  );
}
