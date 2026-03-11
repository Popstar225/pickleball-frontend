/**
 * Microsite Dashboard Editor
 * Used by clubs, states, and partners to manage their public microsite.
 */
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { api } from '@/lib/api';
import { siteBaseURL } from '@/lib/const';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Image as ImageIcon, Upload, Trash2, Plus, ExternalLink, Eye,
  Palette, Phone, Mail, MapPin, Save, Loader2, CheckCircle2,
  BookOpen, Handshake, Edit3, Globe, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApiRes<T = unknown> { success: boolean; data: T; message?: string }
interface GalleryImage { id: string; url: string; caption: string; order: number }
interface Sponsor { id: string; name: string; logo_url: string | null; website: string }
interface Settings {
  banner_url: string | null; gallery: GalleryImage[]; sponsors: Sponsor[];
  theme_color: string;
  contact_override: { email?: string; phone?: string; whatsapp?: string; address?: string };
}
interface BlogPost {
  id: string; title: string; content: string; excerpt: string;
  cover_image: string | null; tags: string[]; is_published: boolean;
  published_at: string | null; created_at: string;
}
interface MicrositeProfile { username: string; name: string; type: string; status: string; public_url: string }

async function apiCall<T>(fn: () => Promise<ApiRes<T>>): Promise<T | null> {
  try { const res = await fn(); return res.success ? res.data : null; } catch { return null; }
}

// ─── Tokens ───────────────────────────────────────────────────────────────────
const inputCls =
  'w-full bg-white/[0.04] border border-white/[0.09] rounded-xl text-white/80 text-sm px-3.5 py-2.5 ' +
  'outline-none transition-all duration-150 focus:border-[#ace600]/50 focus:bg-[#ace600]/[0.03] ' +
  'disabled:opacity-35 disabled:cursor-not-allowed placeholder:text-white/20';
const labelCls = 'block text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1.5';

// ─── Atoms ────────────────────────────────────────────────────────────────────
function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden', className)}>
      <div className="h-0.5 bg-gradient-to-r from-[#ace600]/35 via-[#ace600]/15 to-transparent" />
      <div className="p-5">{children}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, iconColor, iconBg, title, desc, action }: {
  icon: React.ElementType; iconColor: string; iconBg: string;
  title: string; desc?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-8 h-8 rounded-xl border flex items-center justify-center shrink-0', iconBg)}>
          <Icon className={cn('w-4 h-4', iconColor)} />
        </div>
        <div>
          <p className="text-sm font-bold text-white">{title}</p>
          {desc && <p className="text-[11px] text-white/25 mt-0.5">{desc}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={labelCls}>{label}</label>{children}</div>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => onChange(!checked)}
        className="relative shrink-0 rounded-full transition-all duration-200 focus:outline-none"
        style={{ background: checked ? '#ace600' : 'rgba(255,255,255,0.09)', height: 22, width: 40 }}>
        <span className="absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-transform duration-200"
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(0)' }} />
      </button>
      <span className={cn('text-xs font-bold', checked ? 'text-[#ace600]' : 'text-white/30')}>{label}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 border border-dashed border-white/[0.08] rounded-2xl">
      <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
        <Icon className="w-5 h-5 text-white/10" />
      </div>
      <p className="text-xs text-white/20">{text}</p>
    </div>
  );
}

function SaveButton({ onClick, loading, label = 'Guardar', disabled }: {
  onClick: () => void; loading: boolean; label?: string; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={loading || disabled}
      className="inline-flex items-center gap-1.5 h-9 px-5 rounded-xl text-xs font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)] disabled:opacity-40 transition-all">
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
      {loading ? 'Guardando…' : label}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function MicrositeDashboardPage() {
  useSelector((state: RootState) => state.auth.user);

  const [settings, setSettings] = useState<Settings>({
    banner_url: null, gallery: [], sponsors: [],
    theme_color: '#ace600', contact_override: {},
  });
  const [blogPosts,       setBlogPosts]       = useState<BlogPost[]>([]);
  const [profile,         setProfile]         = useState<MicrositeProfile | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [saved,           setSaved]           = useState(false);
  const [tab,             setTab]             = useState('banner');

  const [blogDialog,      setBlogDialog]      = useState<{ open: boolean; post: Partial<BlogPost> | null }>({ open: false, post: null });
  const [sponsorDialog,   setSponsorDialog]   = useState(false);
  const [sponsorForm,     setSponsorForm]     = useState({ name: '', website: '' });
  const [galleryCaption,  setGalleryCaption]  = useState<Record<string, string>>({});

  const bannerRef      = useRef<HTMLInputElement>(null);
  const galleryRef     = useRef<HTMLInputElement>(null);
  const sponsorLogoRef = useRef<HTMLInputElement>(null);
  const blogCoverRef   = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([loadSettings(), loadBlogPosts()]).finally(() => setLoading(false));
  }, []);

  const loadSettings = async () => {
    const data = await apiCall(() => api.get<ApiRes<{ settings: Settings; profile: MicrositeProfile }>>('/microsites/my'));
    if (data) { setSettings(data.settings); setProfile(data.profile); }
  };
  const loadBlogPosts = async () => {
    const data = await apiCall(() => api.get<ApiRes<{ posts: BlogPost[] }>>('/microsites/my/blog'));
    if (data) setBlogPosts(data.posts);
  };
  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const handleBannerUpload = async (file: File) => {
    const fd = new FormData(); fd.append('banner', file);
    setSaving(true);
    try {
      const data = await apiCall(() => api.post<ApiRes<{ banner_url: string }>, FormData>('/microsites/my/banner', fd));
      if (data) { setSettings(s => ({ ...s, banner_url: data.banner_url })); flash(); }
    } finally { setSaving(false); }
  };
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const data = await apiCall(() => api.put<ApiRes<{ settings: Settings }>, object>('/microsites/my/settings', {
        theme_color: settings.theme_color, contact_override: settings.contact_override,
      }));
      if (data) flash();
    } finally { setSaving(false); }
  };
  const handleGalleryUpload = async (file: File) => {
    const fd = new FormData(); fd.append('gallery_image', file); fd.append('caption', '');
    setSaving(true);
    try {
      const data = await apiCall(() => api.post<ApiRes<{ gallery: GalleryImage[] }>, FormData>('/microsites/my/gallery', fd));
      if (data) setSettings(s => ({ ...s, gallery: data.gallery }));
    } finally { setSaving(false); }
  };
  const handleUpdateCaption = async (imageId: string) => {
    const data = await apiCall(() => api.put<ApiRes<{ gallery: GalleryImage[] }>, object>(`/microsites/my/gallery/${imageId}`, { caption: galleryCaption[imageId] ?? '' }));
    if (data) { setSettings(s => ({ ...s, gallery: data.gallery })); flash(); }
  };
  const handleDeleteGallery = async (imageId: string) => {
    const data = await apiCall(() => api.delete<ApiRes<{ gallery: GalleryImage[] }>>(`/microsites/my/gallery/${imageId}`));
    if (data) setSettings(s => ({ ...s, gallery: data.gallery }));
  };
  const handleAddSponsor = async () => {
    const fd = new FormData(); fd.append('name', sponsorForm.name); fd.append('website', sponsorForm.website);
    if (sponsorLogoRef.current?.files?.[0]) fd.append('sponsor_logo', sponsorLogoRef.current.files[0]);
    setSaving(true);
    try {
      const data = await apiCall(() => api.post<ApiRes<{ sponsors: Sponsor[] }>, FormData>('/microsites/my/sponsors', fd));
      if (data) { setSettings(s => ({ ...s, sponsors: data.sponsors })); setSponsorDialog(false); setSponsorForm({ name: '', website: '' }); flash(); }
    } finally { setSaving(false); }
  };
  const handleDeleteSponsor = async (sponsorId: string) => {
    const data = await apiCall(() => api.delete<ApiRes<{ sponsors: Sponsor[] }>>(`/microsites/my/sponsors/${sponsorId}`));
    if (data) setSettings(s => ({ ...s, sponsors: data.sponsors }));
  };
  const handleSaveBlogPost = async () => {
    if (!blogDialog.post) return;
    const post = blogDialog.post;
    const fd = new FormData();
    fd.append('title', post.title ?? ''); fd.append('content', post.content ?? '');
    fd.append('excerpt', post.excerpt ?? ''); fd.append('tags', JSON.stringify(post.tags ?? []));
    fd.append('is_published', String(post.is_published ?? false));
    if (blogCoverRef.current?.files?.[0]) fd.append('cover_image', blogCoverRef.current.files[0]);
    setSaving(true);
    try {
      const url = post.id ? `/microsites/my/blog/${post.id}` : '/microsites/my/blog';
      const data = post.id
        ? await apiCall(() => api.put<ApiRes<{ post: BlogPost }>, FormData>(url, fd))
        : await apiCall(() => api.post<ApiRes<{ post: BlogPost }>, FormData>(url, fd));
      if (data) { await loadBlogPosts(); setBlogDialog({ open: false, post: null }); flash(); }
    } finally { setSaving(false); }
  };
  const handleDeleteBlogPost = async (postId: string) => {
    await apiCall(() => api.delete<ApiRes<null>>(`/microsites/my/blog/${postId}`));
    await loadBlogPosts();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
      <p className="text-xs text-white/20">Cargando micrositio…</p>
    </div>
  );

  const publicUrl = profile?.public_url ? `${siteBaseURL}${profile.public_url}` : null;
  const PRESET_COLORS = ['#ace600', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

  const TAB_CONFIG = [
    { key: 'banner',          label: 'Portada',         icon: ImageIcon },
    { key: 'apariencia',      label: 'Apariencia',      icon: Palette },
    { key: 'contacto',        label: 'Contacto',        icon: Phone },
    { key: 'galeria',         label: 'Galería',         icon: ImageIcon },
    { key: 'patrocinadores',  label: 'Patrocinadores',  icon: Handshake },
    { key: 'blog',            label: 'Blog',            icon: BookOpen },
  ] as const;

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[22px] font-black text-white tracking-tight">Mi Micrositio</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <Globe className="w-2.5 h-2.5" />
              {profile?.type === 'club' ? 'Club' : 'Asociación'}
            </span>
          </div>
          <p className="text-xs text-white/25">
            Gestiona tu página pública · {profile?.name ?? '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> Guardado
            </span>
          )}
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[11px] font-bold border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white transition-all">
              <Eye className="w-3.5 h-3.5" /> Ver público <ExternalLink className="w-3 h-3 opacity-50" />
            </a>
          )}
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex h-auto w-full overflow-x-auto gap-1 bg-[#0d1117] border border-white/[0.07] rounded-2xl p-1.5 scrollbar-none">
          {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
            <TabsTrigger key={key} value={key}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all text-white/30 hover:text-white/55 hover:bg-white/[0.04] data-[state=active]:bg-[#ace600] data-[state=active]:text-black data-[state=active]:shadow-[0_0_10px_rgba(172,230,0,0.18)]">
              <Icon className="w-3 h-3 shrink-0" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Banner ────────────────────────────────────────────────────────── */}
        <TabsContent value="banner" className="mt-4">
          <SectionCard>
            <SectionHeader icon={ImageIcon} iconColor="text-[#ace600]" iconBg="bg-[#ace600]/10 border-[#ace600]/20"
              title="Imagen de Portada" desc="Banner superior del micrositio (1200×400px recomendado)" />
            <div className="relative w-full h-40 rounded-xl overflow-hidden border border-dashed border-white/[0.08] bg-white/[0.02] mb-4">
              {settings.banner_url
                ? <img src={settings.banner_url} alt="Banner" className="w-full h-full object-cover" />
                : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-8 h-8 text-white/10" />
                    <span className="text-xs text-white/20">Sin imagen de portada</span>
                  </div>
                )}
              {saving && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
                </div>
              )}
            </div>
            <input ref={bannerRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files?.[0] && handleBannerUpload(e.target.files[0])} />
            <div className="flex items-center gap-3">
              <button onClick={() => bannerRef.current?.click()} disabled={saving}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold border border-[#ace600]/25 bg-[#ace600]/[0.07] hover:bg-[#ace600]/[0.14] text-[#ace600] disabled:opacity-40 transition-all">
                <Upload className="w-3.5 h-3.5" />
                {settings.banner_url ? 'Cambiar imagen' : 'Subir imagen'}
              </button>
              <p className="text-[10px] text-white/20">PNG, JPG · máx. 10 MB</p>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── Apariencia ────────────────────────────────────────────────────── */}
        <TabsContent value="apariencia" className="mt-4">
          <SectionCard>
            <SectionHeader icon={Palette} iconColor="text-violet-400" iconBg="bg-violet-500/10 border-violet-500/20"
              title="Apariencia" desc="Personaliza el color principal del micrositio" />
            <div className="space-y-4">
              <Field label="Color Principal">
                <div className="flex items-center gap-3 flex-wrap mt-1">
                  <input type="color" value={settings.theme_color}
                    onChange={e => setSettings(s => ({ ...s, theme_color: e.target.value }))}
                    className="w-10 h-10 rounded-xl border border-white/[0.09] bg-transparent cursor-pointer overflow-hidden" />
                  <input className={cn(inputCls, 'w-32 font-mono')} value={settings.theme_color}
                    onChange={e => setSettings(s => ({ ...s, theme_color: e.target.value }))} />
                  <div className="flex gap-2">
                    {PRESET_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setSettings(s => ({ ...s, theme_color: c }))}
                        className={cn('w-7 h-7 rounded-full border-2 hover:scale-110 transition-transform', settings.theme_color === c ? 'border-white/50 scale-110' : 'border-white/[0.12]')}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              </Field>

              {/* Preview swatch */}
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <div className="w-8 h-8 rounded-lg shrink-0" style={{ background: settings.theme_color }} />
                <div>
                  <p className="text-xs font-bold text-white/50">Vista previa del color</p>
                  <p className="text-[10px] text-white/20 font-mono">{settings.theme_color}</p>
                </div>
              </div>

              <div className="pt-1 border-t border-white/[0.05]">
                <SaveButton onClick={handleSaveSettings} loading={saving} label="Guardar Apariencia" />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── Contacto ──────────────────────────────────────────────────────── */}
        <TabsContent value="contacto" className="mt-4">
          <SectionCard>
            <SectionHeader icon={Phone} iconColor="text-sky-400" iconBg="bg-sky-500/10 border-sky-500/20"
              title="Información de Contacto" desc="Datos mostrados en la pestaña Contacto del micrositio" />
            <div className="space-y-3">
              {([
                { key: 'email'    as const, label: 'Email',     icon: Mail,  placeholder: 'contacto@club.com',  type: 'email' },
                { key: 'phone'    as const, label: 'Teléfono',  icon: Phone, placeholder: '+52 55 1234 5678',   type: 'tel' },
                { key: 'whatsapp' as const, label: 'WhatsApp',  icon: Phone, placeholder: '+52 55 1234 5678',   type: 'tel' },
                { key: 'address'  as const, label: 'Dirección', icon: MapPin,placeholder: 'Calle, Colonia, Ciudad', type: 'text' },
              ]).map(({ key, label, icon: Icon, placeholder, type }) => (
                <div key={key}>
                  <label className={labelCls}>
                    <Icon className="inline w-2.5 h-2.5 mr-1 -mt-0.5" />{label}
                  </label>
                  <input className={inputCls} type={type} placeholder={placeholder}
                    value={settings.contact_override[key] ?? ''}
                    onChange={e => setSettings(s => ({ ...s, contact_override: { ...s.contact_override, [key]: e.target.value } }))} />
                </div>
              ))}
              <div className="pt-1 border-t border-white/[0.05]">
                <SaveButton onClick={handleSaveSettings} loading={saving} label="Guardar Contacto" />
              </div>
            </div>
          </SectionCard>
        </TabsContent>

        {/* ── Galería ───────────────────────────────────────────────────────── */}
        <TabsContent value="galeria" className="mt-4">
          <SectionCard>
            <SectionHeader icon={ImageIcon} iconColor="text-amber-400" iconBg="bg-amber-500/10 border-amber-500/20"
              title="Galería de Imágenes" desc={`${settings.gallery.length} imagen${settings.gallery.length !== 1 ? 'es' : ''}`}
              action={
                <>
                  <input ref={galleryRef} type="file" accept="image/*" className="hidden"
                    onChange={e => e.target.files?.[0] && handleGalleryUpload(e.target.files[0])} />
                  <button onClick={() => galleryRef.current?.click()} disabled={saving}
                    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[11px] font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_10px_rgba(172,230,0,0.12)] disabled:opacity-40 transition-all">
                    <Plus className="w-3.5 h-3.5" /> Agregar foto
                  </button>
                </>
              }>
            </SectionHeader>
            {settings.gallery.length === 0
              ? <EmptyState icon={ImageIcon} text="Sin imágenes. Sube tu primera foto." />
              : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {settings.gallery.map(img => (
                    <div key={img.id} className="group flex flex-col gap-1.5">
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]">
                        <img src={img.url} alt={img.caption} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => handleDeleteGallery(img.id)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex gap-1.5">
                        <input placeholder="Descripción…"
                          value={galleryCaption[img.id] ?? img.caption}
                          onChange={e => setGalleryCaption(p => ({ ...p, [img.id]: e.target.value }))}
                          className={cn(inputCls, 'text-[11px] px-2.5 py-1.5 h-7')} />
                        <button onClick={() => handleUpdateCaption(img.id)}
                          className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-[#ace600] hover:border-[#ace600]/20 transition-all shrink-0">
                          <Save className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </SectionCard>
        </TabsContent>

        {/* ── Patrocinadores ────────────────────────────────────────────────── */}
        <TabsContent value="patrocinadores" className="mt-4">
          <SectionCard>
            <SectionHeader icon={Handshake} iconColor="text-emerald-400" iconBg="bg-emerald-500/10 border-emerald-500/20"
              title="Patrocinadores" desc="Los logos se muestran en la parte superior del micrositio"
              action={
                <button onClick={() => setSponsorDialog(true)}
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[11px] font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_10px_rgba(172,230,0,0.12)] transition-all">
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              }>
            </SectionHeader>
            {settings.sponsors.length === 0
              ? <EmptyState icon={Handshake} text="Sin patrocinadores. Agrega el primero." />
              : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {settings.sponsors.map(sp => (
                    <div key={sp.id}
                      className="group relative bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:border-white/[0.12] transition-all">
                      {sp.logo_url
                        ? <img src={sp.logo_url} alt={sp.name} className="h-10 object-contain" />
                        : <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                            <Handshake className="w-5 h-5 text-white/15" />
                          </div>
                      }
                      <p className="text-xs font-bold text-white/70">{sp.name}</p>
                      {sp.website && <p className="text-[10px] text-white/25 truncate w-full">{sp.website}</p>}
                      <button type="button" onClick={() => handleDeleteSponsor(sp.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/[0.08] border border-red-500/15 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-all">
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </SectionCard>
        </TabsContent>

        {/* ── Blog ──────────────────────────────────────────────────────────── */}
        <TabsContent value="blog" className="mt-4">
          <SectionCard>
            <SectionHeader icon={BookOpen} iconColor="text-sky-400" iconBg="bg-sky-500/10 border-sky-500/20"
              title="Publicaciones del Blog"
              desc={`${blogPosts.length} publicación${blogPosts.length !== 1 ? 'es' : ''}`}
              action={
                <button onClick={() => setBlogDialog({ open: true, post: { is_published: false, tags: [] } })}
                  className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl text-[11px] font-bold bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_10px_rgba(172,230,0,0.12)] transition-all">
                  <Plus className="w-3.5 h-3.5" /> Nueva publicación
                </button>
              }>
            </SectionHeader>
            {blogPosts.length === 0
              ? <EmptyState icon={BookOpen} text="Sin publicaciones. Crea la primera." />
              : (
                <div className="space-y-2.5">
                  {blogPosts.map(post => (
                    <div key={post.id}
                      className="group flex items-start gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:border-white/[0.12] transition-all">
                      {post.cover_image && (
                        <img src={post.cover_image} alt="" className="w-14 h-12 object-cover rounded-lg shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-xs font-bold text-white/75 group-hover:text-white transition-colors">{post.title}</p>
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider',
                            post.is_published
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-white/[0.04] border-white/[0.08] text-white/20',
                          )}>
                            <span className={cn('w-1 h-1 rounded-full', post.is_published ? 'bg-emerald-400 animate-pulse' : 'bg-white/20')} />
                            {post.is_published ? 'Publicado' : 'Borrador'}
                          </span>
                        </div>
                        {post.excerpt && <p className="text-[11px] text-white/30 line-clamp-1">{post.excerpt}</p>}
                        {post.tags.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {post.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 rounded-full border border-white/[0.07] bg-white/[0.03] text-[9px] font-bold text-white/25 uppercase tracking-wider">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setBlogDialog({ open: true, post })}
                          className="w-7 h-7 rounded-lg border border-[#ace600]/20 bg-[#ace600]/[0.06] hover:bg-[#ace600]/[0.12] text-[#ace600] flex items-center justify-center transition-all">
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleDeleteBlogPost(post.id)}
                          className="w-7 h-7 rounded-lg border border-red-500/20 bg-red-500/[0.06] hover:bg-red-500/[0.12] text-red-400 flex items-center justify-center transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* ── Add Sponsor Dialog ────────────────────────────────────────────── */}
      <Dialog open={sponsorDialog} onOpenChange={setSponsorDialog}>
        <DialogContent className="bg-[#0d1117] border-white/[0.09] rounded-2xl p-0 overflow-hidden max-w-sm">
          <div className="h-0.5 bg-gradient-to-r from-emerald-400/40 via-emerald-400/20 to-transparent" />
          <div className="p-6">
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Handshake className="w-4 h-4 text-emerald-400" />
                </div>
                <DialogTitle className="text-base font-bold text-white">Agregar Patrocinador</DialogTitle>
              </div>
            </DialogHeader>
            <div className="space-y-3">
              <Field label="Nombre del patrocinador *">
                <input className={inputCls} placeholder="Nombre"
                  value={sponsorForm.name} onChange={e => setSponsorForm(s => ({ ...s, name: e.target.value }))} />
              </Field>
              <Field label="Sitio Web">
                <input className={inputCls} placeholder="https://…"
                  value={sponsorForm.website} onChange={e => setSponsorForm(s => ({ ...s, website: e.target.value }))} />
              </Field>
              <div>
                <label className={labelCls}>Logo (opcional)</label>
                <label className="flex items-center gap-2 h-9 px-3.5 rounded-xl border border-dashed border-[#ace600]/20 text-[11px] font-bold text-[#ace600] cursor-pointer hover:bg-[#ace600]/[0.04] transition-all w-fit">
                  <Upload className="w-3.5 h-3.5" /> Subir logo
                  <input ref={sponsorLogoRef} type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-5 pt-4 border-t border-white/[0.06]">
              <button onClick={() => setSponsorDialog(false)} disabled={saving}
                className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white text-xs font-semibold disabled:opacity-40 transition-all">
                Cancelar
              </button>
              <button onClick={handleAddSponsor} disabled={saving || !sponsorForm.name}
                className="flex-1 h-9 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)] disabled:opacity-40 transition-all">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Agregar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Blog Post Dialog ──────────────────────────────────────────────── */}
      <Dialog open={blogDialog.open} onOpenChange={v => !v && setBlogDialog({ open: false, post: null })}>
        <DialogContent className="bg-[#0d1117] border-white/[0.09] rounded-2xl p-0 overflow-hidden max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="h-0.5 bg-gradient-to-r from-sky-400/40 via-sky-400/20 to-transparent" />
          <div className="p-6">
            <DialogHeader className="mb-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  {blogDialog.post?.id ? <Edit3 className="w-4 h-4 text-sky-400" /> : <Plus className="w-4 h-4 text-sky-400" />}
                </div>
                <DialogTitle className="text-base font-bold text-white">
                  {blogDialog.post?.id ? 'Editar publicación' : 'Nueva publicación'}
                </DialogTitle>
              </div>
            </DialogHeader>
            {blogDialog.post && (
              <div className="space-y-3">
                <Field label="Título *">
                  <input className={inputCls} placeholder="Título de la publicación"
                    value={blogDialog.post.title ?? ''}
                    onChange={e => setBlogDialog(d => ({ ...d, post: { ...d.post!, title: e.target.value } }))} />
                </Field>
                <Field label="Contenido *">
                  <textarea rows={7} placeholder="Escribe el contenido aquí…"
                    value={blogDialog.post.content ?? ''}
                    onChange={e => setBlogDialog(d => ({ ...d, post: { ...d.post!, content: e.target.value } }))}
                    className={cn(inputCls, 'resize-y')} />
                </Field>
                <Field label="Resumen (extracto)">
                  <textarea rows={2} placeholder="Breve descripción (se genera automáticamente si se deja vacío)"
                    value={blogDialog.post.excerpt ?? ''}
                    onChange={e => setBlogDialog(d => ({ ...d, post: { ...d.post!, excerpt: e.target.value } }))}
                    className={cn(inputCls, 'resize-y')} />
                </Field>
                <Field label="Etiquetas (separadas por coma)">
                  <input className={inputCls} placeholder="torneo, club, noticias"
                    value={(blogDialog.post.tags ?? []).join(', ')}
                    onChange={e => setBlogDialog(d => ({
                      ...d, post: { ...d.post!, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) },
                    }))} />
                </Field>
                <div>
                  <label className={labelCls}>Imagen de portada</label>
                  <label className="flex items-center gap-2 h-9 px-3.5 rounded-xl border border-dashed border-[#ace600]/20 text-[11px] font-bold text-[#ace600] cursor-pointer hover:bg-[#ace600]/[0.04] transition-all w-fit">
                    <Upload className="w-3.5 h-3.5" /> Subir imagen
                    <input ref={blogCoverRef} type="file" accept="image/*" className="hidden" />
                  </label>
                  {blogDialog.post.cover_image && (
                    <img src={blogDialog.post.cover_image} alt="" className="mt-2 h-24 object-cover rounded-xl border border-white/[0.08]" />
                  )}
                </div>
                <Toggle
                  checked={!!blogDialog.post.is_published}
                  onChange={v => setBlogDialog(d => ({ ...d, post: { ...d.post!, is_published: v } }))}
                  label={blogDialog.post.is_published ? 'Publicado' : 'Borrador'} />
              </div>
            )}
            <div className="flex gap-2 mt-5 pt-4 border-t border-white/[0.06]">
              <button onClick={() => setBlogDialog({ open: false, post: null })} disabled={saving}
                className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.07] text-white/40 hover:text-white text-xs font-semibold disabled:opacity-40 transition-all">
                Cancelar
              </button>
              <button onClick={handleSaveBlogPost}
                disabled={saving || !blogDialog.post?.title || !blogDialog.post?.content}
                className="flex-1 h-9 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 bg-[#ace600] hover:bg-[#c0f000] text-black shadow-[0_0_12px_rgba(172,230,0,0.15)] disabled:opacity-40 transition-all">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}