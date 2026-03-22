import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import {
  Search, MapPin, LayoutGrid, Layers, ChevronLeft,
  ChevronRight, Loader2, X, RefreshCw, Eye,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Court {
  id: string;
  name: string;
  court_type: string;
  surface: string;
  hourly_rate: string | null;
  is_available: boolean;
  is_active: boolean;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  state: string;
  city: string;
  phone: string;
  number_of_courts: number;
  is_active: boolean;
  base_price_per_hour: string | null;
  courts: Court[];
  club: {
    id: string;
    name: string;
    logo: string | null;
    state: string;
    city: string;
    address: string;
  } | null;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ─── Atoms ─────────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl px-4 py-3.5">
      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-2">{label}</p>
      <p className={cn('text-2xl font-black leading-none', accent ?? 'text-white')}>{value}</p>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────────
export default function VenuesManagement() {
  const navigate = useNavigate();

  const [venues, setVenues]         = useState<Venue[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 20, pages: 0 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [expanded, setExpanded]     = useState<string | null>(null);

  const load = useCallback(async (page = 1, q = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (q) params.set('search', q);
      const res: any = await api.get(`/venues?${params}`);
      if (res?.success) {
        setVenues(res.data?.venues ?? []);
        setPagination(res.data?.pagination ?? { total: 0, page: 1, limit: 20, pages: 0 });
      }
    } catch (e) {
      console.error('Error loading venues', e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(1, ''); }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => load(1, search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const activeCourtsTotal = venues.reduce((s, v) => s + (v.courts?.filter(c => c.is_active).length ?? 0), 0);
  const activeVenues      = venues.filter(v => v.is_active).length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[22px] font-black text-white tracking-tight">Gestión de Venues</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest bg-[#ace600]/10 border-[#ace600]/20 text-[#ace600]">
              <Layers className="w-2.5 h-2.5" /> {pagination.total}
            </span>
          </div>
          <p className="text-xs text-white/25">Todos los venues y sus canchas</p>
        </div>
        <button
          onClick={() => load(pagination.page, search)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white text-xs font-bold disabled:opacity-40 transition-all">
          <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin')} /> Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <StatCard label="Total venues"   value={pagination.total}  accent="text-[#ace600]" />
        <StatCard label="Venues activos" value={activeVenues}       accent="text-emerald-400" />
        <StatCard label="Canchas activas" value={activeCourtsTotal} accent="text-sky-400" />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 pointer-events-none" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar venue por nombre…"
          className="pl-9 pr-8 h-9 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus-visible:border-[#ace600]/30 focus-visible:ring-0 rounded-xl"
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-[#0d1117] border border-white/[0.07] rounded-2xl overflow-hidden">

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-5 h-5 text-[#ace600] animate-spin" />
            <p className="text-xs text-white/20">Cargando venues…</p>
          </div>
        )}

        {!loading && venues.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Layers className="w-8 h-8 text-white/10" />
            <p className="text-sm font-bold text-white/25">No se encontraron venues</p>
          </div>
        )}

        {!loading && venues.length > 0 && (
          <div className="divide-y divide-white/[0.04]">
            {venues.map(venue => {
              const courts      = venue.courts ?? [];
              const isExpanded  = expanded === venue.id;
              const activeCourt = courts.filter(c => c.is_active).length;

              return (
                <div key={venue.id}>
                  {/* Venue row */}
                  <div
                    className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                    onClick={() => setExpanded(isExpanded ? null : venue.id)}>

                    {/* Icon */}
                    <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4 text-white/25" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors truncate">
                          {venue.name}
                        </p>
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest',
                          venue.is_active
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-white/[0.04] border-white/[0.08] text-white/25',
                        )}>
                          {venue.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {venue.club && (
                          <span className="text-[11px] text-white/30 font-medium">{venue.club.name}</span>
                        )}
                        {(venue.address || venue.city || venue.state) && (
                          <span className="flex items-center gap-1 text-[11px] text-white/20">
                            <MapPin className="w-2.5 h-2.5" />
                            {[venue.city, venue.state].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Court count + view button */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/30">
                        <LayoutGrid className="w-3 h-3" /> {activeCourt} cancha{activeCourt !== 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/admin/dashboard/courts?venueId=${venue.id}`); }}
                        className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-[#ace600]/10 hover:border-[#ace600]/20 hover:text-[#ace600] text-white/30 text-[11px] font-bold transition-all opacity-0 group-hover:opacity-100">
                        <Eye className="w-3 h-3" /> Ver Canchas
                      </button>
                    </div>
                  </div>

                  {/* Expanded courts */}
                  {isExpanded && courts.length > 0 && (
                    <div className="bg-black/20 border-t border-white/[0.04] px-5 py-3 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-3">
                        Canchas ({courts.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {courts.map(court => (
                          <div
                            key={court.id}
                            onClick={() => navigate(`/admin/dashboard/courts/${court.id}`)}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.10] cursor-pointer transition-all group/court">
                            <div className={cn(
                              'w-2 h-2 rounded-full shrink-0',
                              court.is_available ? 'bg-emerald-400' : 'bg-white/20',
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-white/70 group-hover/court:text-white truncate transition-colors">
                                {court.name}
                              </p>
                              <p className="text-[10px] text-white/25 capitalize">
                                {court.court_type ?? '—'} · {court.surface ?? '—'}
                              </p>
                            </div>
                            {court.hourly_rate && (
                              <p className="text-[11px] font-bold text-white/40 shrink-0">
                                ${Number(court.hourly_rate).toFixed(0)}/hr
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {isExpanded && courts.length === 0 && (
                    <div className="bg-black/20 border-t border-white/[0.04] px-5 py-4 text-center">
                      <p className="text-xs text-white/20">Sin canchas registradas</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.05]">
            <p className="text-xs text-white/20 font-semibold">{pagination.total} venues</p>
            <div className="flex items-center gap-1">
              <button onClick={() => load(pagination.page - 1)} disabled={pagination.page === 1}
                className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white flex items-center justify-center disabled:opacity-25 transition-all">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => load(p)}
                  className={cn(
                    'w-7 h-7 rounded-lg text-xs font-black transition-all',
                    p === pagination.page
                      ? 'bg-[#ace600] text-black'
                      : 'border border-white/[0.08] bg-white/[0.04] text-white/30 hover:text-white hover:bg-white/[0.08]',
                  )}>
                  {p}
                </button>
              ))}
              <button onClick={() => load(pagination.page + 1)} disabled={pagination.page === pagination.pages}
                className="w-7 h-7 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white/30 hover:text-white flex items-center justify-center disabled:opacity-25 transition-all">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
