import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, addDays, subDays, startOfToday, isBefore, set } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
  Loader2,
  X,
  Zap,
  Search,
  Star,
  Lightbulb,
  Wifi,
  Package,
  Users,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Building2,
  Trophy,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/components/payment/StripeProvider';
import PaymentService from '@/services/paymentService';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { AppDispatch, RootState } from '@/store';
import {
  getCourtAvailability,
  createCourtReservation,
  fetchCourtReservations,
  cancelCourtReservation,
} from '@/store/slices/courtReservationsSlice';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Court {
  id: string;
  name: string;
  hourly_rate: number | string;
  court_type: string;
  surface?: string;
  description?: string;
  capacity?: number;
  has_lighting?: boolean;
  has_net?: boolean;
  has_equipment?: boolean;
  is_available?: boolean;
  average_rating?: number | string;
  review_count?: number;
  total_bookings?: number;
  photos?: string[] | null;
  club?: { id: string; name: string; city?: string; state?: string };
  venue?: { id: string; name: string; address?: string };
}

type SlotStatus = 'available' | 'booked' | 'past';
type BookingStep = 'review' | 'payment' | 'processing' | 'confirmed';

// ─── Constants ────────────────────────────────────────────────────────────────

const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM–9 PM

function fmtHour(h: number) {
  const suffix = h < 12 ? 'AM' : 'PM';
  const display = h === 12 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${suffix}`;
}

const SURFACE_LABELS: Record<string, string> = {
  acrylic: 'Acrílico',
  clay: 'Arcilla',
  grass: 'Pasto',
  hardcourt: 'Cancha Dura',
  wood: 'Wood',
  concrete: 'Concreto',
  synthetic: 'Sintético',
};

const TYPE_LABELS: Record<string, string> = {
  outdoor: 'Exterior',
  indoor: 'Interior',
  covered: 'Cubierto',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AmenityChip({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${
      active
        ? 'bg-[#ace600]/10 border-[#ace600]/30 text-[#ace600]'
        : 'bg-white/[0.03] border-white/10 text-gray-300'
    }`}>
      {icon}
      {label}
    </span>
  );
}

function RatingStars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <Star
          key={s}
          className={`w-3 h-3 ${s <= Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-700'}`}
        />
      ))}
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CourtReservationPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { courtAvailability, reservations, loading } = useSelector(
    (s: RootState) => s.courtReservations,
  );

  // ── Courts state ──
  const [courts, setCourts] = useState<Court[]>([]);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState('');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSurface, setFilterSurface] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ── Date / slot state ──
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  // Range selection: selStart = first clicked, selEnd = second clicked
  const [selStart, setSelStart] = useState<number | null>(null);
  const [selEnd, setSelEnd] = useState<number | null>(null);
  // Hover preview while start is set but end is not
  const [hoverHour, setHoverHour] = useState<number | null>(null);

  // ── Booking modal state ──
  const [step, setStep] = useState<BookingStep | null>(null);
  const [createdReservation, setCreatedReservation] = useState<any>(null);

  // ── Payment intent (Stripe) ──
  const [paymentIntent, setPaymentIntent] = useState<{ paymentId: string; clientSecret: string } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const selectedCourt = courts.find((c) => c.id === selectedCourtId) ?? null;
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Normalise range so rangeStart <= rangeEnd
  const rangeStart = selStart !== null && selEnd !== null ? Math.min(selStart, selEnd) : selStart;
  const rangeEnd   = selStart !== null && selEnd !== null ? Math.max(selStart, selEnd) : selStart;
  const duration   = rangeStart !== null && rangeEnd !== null ? rangeEnd - rangeStart + 1 : 0;
  const price      = selectedCourt ? Number(selectedCourt.hourly_rate) : 0;
  const totalPrice = price * (duration || 1);

  // ── Derived: filtered courts ──
  const filteredCourts = useMemo(() => {
    return courts.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.venue?.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.club?.name?.toLowerCase().includes(search.toLowerCase());
      const matchType = !filterType || c.court_type === filterType;
      const matchSurface = !filterSurface || c.surface === filterSurface;
      return matchSearch && matchType && matchSurface;
    });
  }, [courts, search, filterType, filterSurface]);

  const courtTypes = useMemo(
    () => [...new Set(courts.map((c) => c.court_type).filter(Boolean))],
    [courts],
  );
  const surfaceTypes = useMemo(
    () => [...new Set(courts.map((c) => c.surface).filter(Boolean))],
    [courts],
  );

  // ── Load courts ──
  useEffect(() => {
    setLoadingCourts(true);
    api
      .get('/courts?limit=100')
      .then((res: any) => {
        const raw =
          res?.data?.data?.data ??
          res?.data?.data ??
          res?.data?.courts ??
          res?.data ??
          [];
        setCourts(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setCourts([]))
      .finally(() => setLoadingCourts(false));
  }, []);

  // ── Auto-select first court ──
  useEffect(() => {
    if (courts.length && !selectedCourtId) {
      setSelectedCourtId(courts[0].id);
    }
  }, [courts]);

  // ── Load availability when court/date changes ──
  useEffect(() => {
    if (!selectedCourtId) return;
    dispatch(getCourtAvailability({ courtId: selectedCourtId, params: { date: dateStr } }));
    setSelStart(null);
    setSelEnd(null);
  }, [selectedCourtId, dateStr, dispatch]);

  // ── Load reservations ──
  useEffect(() => {
    dispatch(fetchCourtReservations({ limit: 20 }));
  }, [dispatch]);

  // ── Slot status ──
  function slotStatus(hour: number): SlotStatus {
    const slotTime = set(selectedDate, { hours: hour, minutes: 0, seconds: 0 });
    if (isBefore(slotTime, new Date())) return 'past';
    if (courtAvailability.length > 0) {
      const slotStart = `${dateStr}T${String(hour).padStart(2, '0')}:00:00`;
      const slotEnd = `${dateStr}T${String(hour + 1).padStart(2, '0')}:00:00`;
      for (const slot of courtAvailability as any[]) {
        const aStart = (slot.start_time ?? '').substring(0, 19);
        const aEnd = (slot.end_time ?? '').substring(0, 19);
        if (aStart <= slotStart && aEnd >= slotEnd) {
          return slot.available === false ? 'booked' : 'available';
        }
      }
    }
    return 'available';
  }

  // Check all hours in [a, b] are available
  function rangeAllAvailable(a: number, b: number) {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    for (let h = lo; h <= hi; h++) {
      if (slotStatus(h) !== 'available') return false;
    }
    return true;
  }

  function handleSlotClick(hour: number) {
    if (slotStatus(hour) !== 'available') return;

    // No start yet → set start
    if (selStart === null) {
      setSelStart(hour);
      setSelEnd(null);
      return;
    }

    // Start is set but no end → clicking same slot deselects; otherwise set end if range valid
    if (selEnd === null) {
      if (hour === selStart) {
        setSelStart(null);
        return;
      }
      if (rangeAllAvailable(selStart, hour)) {
        setSelEnd(hour);
      } else {
        toast.error('Some slots in this range are already booked');
        // Reset and start fresh from clicked hour
        setSelStart(hour);
        setSelEnd(null);
      }
      return;
    }

    // Range already set → start fresh
    setSelStart(hour);
    setSelEnd(null);
  }

  function clearSelection() {
    setSelStart(null);
    setSelEnd(null);
    setHoverHour(null);
  }

  function handleBookNow() {
    if (rangeStart === null || !selectedCourtId) {
      toast.error('Please select a time slot first');
      return;
    }
    setStep('review');
  }

  async function initPayment() {
    if (!selectedCourt || rangeStart === null) return;
    setPaymentLoading(true);
    try {
      const hrs = duration || 1;
      const startIso = `${dateStr}T${String(rangeStart).padStart(2, '0')}:00:00.000Z`;
      const endIso   = `${dateStr}T${String((rangeEnd ?? rangeStart) + 1).padStart(2, '0')}:00:00.000Z`;
      const res = await PaymentService.createCourtRentalPayment({
        amount: Math.round(totalPrice * 100),
        court_id: selectedCourt.id,
        club_id: selectedCourt.club?.id,
        start_time: startIso,
        end_time: endIso,
        duration_hours: hrs,
        description: `Cancha ${selectedCourt.name} — ${format(selectedDate, 'EEE dd/MM')} ${fmtHour(rangeStart)}–${fmtHour((rangeEnd ?? rangeStart) + 1)}`,
      });
      setPaymentIntent({ paymentId: res.data.payment_id, clientSecret: res.data.client_secret });
      setStep('payment');
    } catch (err: any) {
      toast.error(err?.message ?? 'No se pudo iniciar el pago');
    } finally {
      setPaymentLoading(false);
    }
  }

  async function handlePaymentSuccess() {
    setStep('processing');
    try {
      const hrs = duration || 1;
      const startIso = `${dateStr}T${String(rangeStart).padStart(2, '0')}:00:00.000Z`;
      const endIso   = `${dateStr}T${String((rangeEnd ?? rangeStart!) + 1).padStart(2, '0')}:00:00.000Z`;
      const result = await dispatch(
        createCourtReservation({
          courtId: selectedCourtId,
          bookingData: { start_time: startIso, end_time: endIso, duration_hours: hrs } as any,
        }),
      ).unwrap();
      setCreatedReservation(result);
      setStep('confirmed');
      dispatch(fetchCourtReservations({ limit: 20 }));
      dispatch(getCourtAvailability({ courtId: selectedCourtId, params: { date: dateStr } }));
      clearSelection();
    } catch (err: any) {
      toast.error(err?.message ?? 'Reserva fallida. Intenta de nuevo.');
      setStep('payment');
    }
  }

  function closeModal() {
    setStep(null);
    setCreatedReservation(null);
    setPaymentIntent(null);
    setPaymentLoading(false);
  }

  const upcoming = (Array.isArray(reservations) ? reservations : [])
    .filter((r) => r.status !== 'cancelled' && r.status !== 'completed' && new Date(r.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 8);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* ── Top header bar ── */}
      <div className="border-b border-white/[0.06] px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Court Reservations</h1>
            <p className="text-xs text-gray-300 mt-0.5">Browse courts, check availability and book your slot</p>
          </div>
          <Badge className="bg-[#ace600]/10 text-[#ace600] border border-[#ace600]/25 text-xs">
            {courts.length} canchas
          </Badge>
        </div>
      </div>

      {/* ── Main 3-panel grid ── */}
      <div className="flex h-[calc(100vh-120px)] overflow-hidden">

        {/* ════════════════════════════════════════
            PANEL 1 — Court Browser (left)
        ════════════════════════════════════════ */}
        <div className="w-72 shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden">
          {/* Search + filter header */}
          <div className="p-3 border-b border-white/[0.06] space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Busca canchas, lugares…"
                className="w-full bg-[#161b22] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-gray-300 focus:outline-none focus:border-[#ace600]/40 transition-colors"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-gray-300 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              Filtros
              {(filterType || filterSurface) && (
                <span className="ml-1 w-4 h-4 rounded-full bg-[#ace600] text-black text-[10px] font-bold flex items-center justify-center">
                  {(filterType ? 1 : 0) + (filterSurface ? 1 : 0)}
                </span>
              )}
              <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="space-y-2 pt-1">
                {/* Type filter */}
                <div>
                  <p className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">Tipo de Cancha</p>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => setFilterType('')}
                      className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                        !filterType
                          ? 'bg-[#ace600]/15 border-[#ace600]/40 text-[#ace600]'
                          : 'border-white/10 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      Todos
                    </button>
                    {courtTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setFilterType(filterType === t ? '' : t!)}
                        className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors capitalize ${
                          filterType === t
                            ? 'bg-[#ace600]/15 border-[#ace600]/40 text-[#ace600]'
                            : 'border-white/10 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Surface filter */}
                {surfaceTypes.length > 0 && (
                  <div>
                    <p className="text-[10px] text-gray-300 uppercase tracking-wider mb-1">Superficie</p>
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => setFilterSurface('')}
                        className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                          !filterSurface
                            ? 'bg-[#ace600]/15 border-[#ace600]/40 text-[#ace600]'
                            : 'border-white/10 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        Todos
                      </button>
                      {surfaceTypes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setFilterSurface(filterSurface === s ? '' : s!)}
                          className={`text-[11px] px-2 py-0.5 rounded-full border transition-colors ${
                            filterSurface === s
                              ? 'bg-[#ace600]/15 border-[#ace600]/40 text-[#ace600]'
                              : 'border-white/10 text-gray-300 hover:border-white/20'
                          }`}
                        >
                          {SURFACE_LABELS[s!] ?? s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {(filterType || filterSurface) && (
                  <button
                    onClick={() => { setFilterType(''); setFilterSurface(''); }}
                    className="text-[11px] text-red-400/70 hover:text-red-400 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Court list */}
          <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1.5">
            {loadingCourts ? (
              <div className="flex items-center justify-center py-12 gap-2 text-sm text-gray-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                Cargando canchas…
              </div>
            ) : filteredCourts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
                <Search className="w-6 h-6 text-gray-700" />
                <p className="text-sm text-gray-300">No courts match your search</p>
                <button onClick={() => { setSearch(''); setFilterType(''); setFilterSurface(''); }} className="text-xs text-[#ace600] hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredCourts.map((court) => {
                const isSelected = court.id === selectedCourtId;
                const rating = Number(court.average_rating ?? 0);
                return (
                  <button
                    key={court.id}
                    onClick={() => { setSelectedCourtId(court.id); clearSelection(); }}
                    className={`w-full text-left rounded-xl border p-3 transition-all duration-150 group ${
                      isSelected
                        ? 'bg-[#ace600]/10 border-[#ace600]/40 shadow-sm shadow-[#ace600]/5'
                        : 'bg-[#161b22] border-white/[0.07] hover:border-white/20 hover:bg-[#1c2330]'
                    }`}
                  >
                    {/* Court name + price */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className={`text-sm font-semibold leading-tight ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                        {court.name}
                      </span>
                      <span className={`text-xs font-bold shrink-0 ${isSelected ? 'text-[#ace600]' : 'text-gray-200'}`}>
                        ${Number(court.hourly_rate).toFixed(0)}/h
                      </span>
                    </div>

                    {/* Badges row */}
                    <div className="flex items-center gap-1 flex-wrap mb-2">
                      {court.court_type && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${
                          isSelected ? 'bg-[#ace600]/20 text-[#ace600]' : 'bg-white/5 text-gray-300'
                        }`}>
                          {TYPE_LABELS[court.court_type] ?? court.court_type}
                        </span>
                      )}
                      {court.surface && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-300">
                          {SURFACE_LABELS[court.surface] ?? court.surface}
                        </span>
                      )}
                      {court.is_available === false && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400">
                          Unavailable
                        </span>
                      )}
                    </div>

                    {/* Club / venue */}
                    {(court.club?.name || court.venue?.name) && (
                      <div className="flex items-center gap-1 mb-1.5">
                        <Building2 className="w-3 h-3 text-gray-300 shrink-0" />
                        <span className="text-[11px] text-gray-300 truncate">
                          {court.venue?.name ?? court.club?.name}
                        </span>
                      </div>
                    )}

                    {/* Amenities + rating */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {court.has_lighting && (
                          <Lightbulb className={`w-3 h-3 ${isSelected ? 'text-[#ace600]' : 'text-gray-300'}`} title="Lighting" />
                        )}
                        {court.has_net && (
                          <Wifi className={`w-3 h-3 ${isSelected ? 'text-[#ace600]' : 'text-gray-300'}`} title="Net included" />
                        )}
                        {court.has_equipment && (
                          <Package className={`w-3 h-3 ${isSelected ? 'text-[#ace600]' : 'text-gray-300'}`} title="Equipment" />
                        )}
                        {court.capacity && (
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-300">
                            <Users className="w-3 h-3" />
                            {court.capacity}
                          </span>
                        )}
                      </div>
                      {rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-300">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════
            PANEL 2 — Court Detail + Time Grid (center)
        ════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedCourt ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#161b22] border border-white/10 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-gray-700" />
              </div>
              <div>
                <p className="text-gray-200 font-medium">Select a court</p>
                <p className="text-gray-300 text-sm mt-1">Choose a court from the left panel to view availability</p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Court detail card ── */}
              <div className="border-b border-white/[0.06] bg-[#0d1117] px-5 py-4">
                <div className="flex items-start gap-4">
                  {/* Court icon / placeholder */}
                  <div className="w-14 h-14 rounded-xl bg-[#161b22] border border-white/10 flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6 text-[#ace600]/60" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + type */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold">{selectedCourt.name}</h2>
                      {selectedCourt.court_type && (
                        <Badge className="bg-[#ace600]/10 text-[#ace600] border border-[#ace600]/25 text-[10px] px-2 py-0.5">
                          {TYPE_LABELS[selectedCourt.court_type] ?? selectedCourt.court_type}
                        </Badge>
                      )}
                      {selectedCourt.surface && (
                        <Badge className="bg-white/5 text-gray-200 border border-white/10 text-[10px] px-2 py-0.5">
                          {SURFACE_LABELS[selectedCourt.surface] ?? selectedCourt.surface}
                        </Badge>
                      )}
                    </div>

                    {/* Location */}
                    {(selectedCourt.venue?.address || selectedCourt.club?.city) && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3 h-3 text-gray-300 shrink-0" />
                        <span className="text-xs text-gray-200 truncate">
                          {selectedCourt.venue?.address
                            ? `${selectedCourt.venue.address}${selectedCourt.club?.city ? `, ${selectedCourt.club.city}` : ''}`
                            : `${selectedCourt.club?.city ?? ''}${selectedCourt.club?.state ? `, ${selectedCourt.club.state}` : ''}`}
                        </span>
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="flex items-center flex-wrap gap-4 mt-2">
                      {/* Rating */}
                      {Number(selectedCourt.average_rating ?? 0) > 0 && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-200">
                          <RatingStars value={Number(selectedCourt.average_rating)} />
                          <span>{Number(selectedCourt.average_rating).toFixed(1)}</span>
                          {selectedCourt.review_count ? (
                            <span className="text-gray-300">({selectedCourt.review_count} reviews)</span>
                          ) : null}
                        </span>
                      )}
                      {/* Total bookings */}
                      {(selectedCourt.total_bookings ?? 0) > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gray-300">
                          <TrendingUp className="w-3 h-3" />
                          {selectedCourt.total_bookings} bookings
                        </span>
                      )}
                      {/* Capacity */}
                      {selectedCourt.capacity && (
                        <span className="flex items-center gap-1 text-xs text-gray-300">
                          <Users className="w-3 h-3" />
                          {selectedCourt.capacity} players
                        </span>
                      )}
                      {/* Price */}
                      <span className="flex items-center gap-1 text-xs">
                        <span className="text-gray-300">Rate:</span>
                        <span className="font-semibold text-[#ace600]">${Number(selectedCourt.hourly_rate).toFixed(2)}/hr</span>
                      </span>
                    </div>
                  </div>

                  {/* Amenity chips */}
                  <div className="hidden md:flex flex-col gap-1.5 items-end shrink-0">
                    <AmenityChip icon={<Lightbulb className="w-3 h-3" />} label="Lighting" active={selectedCourt.has_lighting} />
                    <AmenityChip icon={<Wifi className="w-3 h-3" />} label="Net" active={selectedCourt.has_net} />
                    <AmenityChip icon={<Package className="w-3 h-3" />} label="Equipment" active={selectedCourt.has_equipment} />
                  </div>
                </div>

                {/* Club + Venue info */}
                {(selectedCourt.club || selectedCourt.venue) && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-wrap gap-3">
                    {selectedCourt.club && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <Building2 className="w-3 h-3 text-gray-300" />
                        <span>Club: <span className="text-gray-300">{selectedCourt.club.name}</span></span>
                      </div>
                    )}
                    {selectedCourt.venue && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <MapPin className="w-3 h-3 text-gray-300" />
                        <span>Venue: <span className="text-gray-300">{selectedCourt.venue.name}</span></span>
                      </div>
                    )}
                    {selectedCourt.description && (
                      <p className="w-full text-xs text-gray-300 italic leading-relaxed">{selectedCourt.description}</p>
                    )}
                  </div>
                )}
              </div>

              {/* ── Date navigator ── */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-[#0d1117]">
                <button
                  onClick={() => setSelectedDate((d) => subDays(d, 1))}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 hover:text-white hover:border-white/20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-semibold min-w-[180px] text-center">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </span>
                <button
                  onClick={() => setSelectedDate((d) => addDays(d, 1))}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 hover:text-white hover:border-white/20 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setSelectedDate(startOfToday()); clearSelection(); }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-200 hover:text-white hover:border-white/20 transition-all"
                >
                  Today
                </button>

                {/* Legend */}
                <div className="ml-auto hidden sm:flex items-center gap-3 text-[11px] text-gray-300">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#ace600]/20 border border-[#ace600]/40" /> Available</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#ace600] border border-[#ace600]" /> Selected</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-white/5 border border-white/10" /> Booked</span>
                </div>
              </div>

              {/* ── Time slot grid ── */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-16 gap-2 text-sm text-gray-300">
                    <Loader2 className="w-5 h-5 animate-spin text-[#ace600]" />
                    Loading availability…
                  </div>
                ) : (
                  <div className="px-3 py-3">
                    {/* Instruction hint */}
                    <p className="text-[11px] text-gray-300 mb-3 px-1">
                      {selStart === null
                        ? 'Click a slot to set start time'
                        : selEnd === null
                        ? `Start: ${fmtHour(selStart)} — click another slot to set end`
                        : `Selected: ${fmtHour(rangeStart!)} – ${fmtHour(rangeEnd! + 1)} (${duration}h) — click any slot to change`}
                    </p>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {HOURS.map((hour) => {
                        const status = slotStatus(hour);
                        const clickable = status === 'available';

                        // Range membership
                        const inConfirmedRange =
                          rangeStart !== null && rangeEnd !== null &&
                          hour >= rangeStart && hour <= rangeEnd;
                        const isRangeStart = hour === rangeStart && rangeEnd !== null;
                        const isRangeEnd   = hour === rangeEnd   && rangeEnd !== null;
                        const isPendingStart = hour === selStart && selEnd === null;

                        // Hover preview: show tentative range if start set
                        const previewLo = selStart !== null && selEnd === null && hoverHour !== null
                          ? Math.min(selStart, hoverHour) : null;
                        const previewHi = selStart !== null && selEnd === null && hoverHour !== null
                          ? Math.max(selStart, hoverHour) : null;
                        const inPreview =
                          previewLo !== null && previewHi !== null &&
                          hour >= previewLo && hour <= previewHi &&
                          rangeAllAvailable(previewLo, previewHi);

                        return (
                          <button
                            key={hour}
                            disabled={!clickable}
                            onClick={() => handleSlotClick(hour)}
                            onMouseEnter={() => clickable && setHoverHour(hour)}
                            onMouseLeave={() => setHoverHour(null)}
                            className={`
                              relative flex flex-col items-center justify-center gap-0.5
                              border py-3 px-2 text-center
                              transition-all duration-100 select-none
                              ${isRangeStart ? 'rounded-l-xl rounded-r-none' :
                                isRangeEnd   ? 'rounded-r-xl rounded-l-none' :
                                inConfirmedRange ? 'rounded-none' :
                                'rounded-xl'}
                              ${inConfirmedRange
                                ? 'bg-[#ace600] text-black border-[#ace600] shadow-sm'
                                : inPreview
                                ? 'bg-[#ace600]/20 border-[#ace600]/50 text-[#ace600] scale-[1.01]'
                                : isPendingStart
                                ? 'bg-[#ace600] text-black border-[#ace600] shadow-md shadow-[#ace600]/30 scale-[1.03]'
                                : status === 'available'
                                ? 'bg-[#ace600]/8 border-[#ace600]/25 text-[#ace600] hover:bg-[#ace600]/15 hover:border-[#ace600]/50 hover:scale-[1.02] cursor-pointer'
                                : status === 'booked'
                                ? 'bg-white/[0.03] border-white/[0.08] text-gray-700 cursor-not-allowed'
                                : 'bg-white/[0.02] border-white/[0.05] text-gray-800 cursor-not-allowed'
                              }
                            `}
                          >
                            <span className={`text-xs font-bold ${inConfirmedRange || isPendingStart ? 'text-black' : ''}`}>
                              {fmtHour(hour)}
                            </span>
                            <span className={`text-[10px] ${
                              inConfirmedRange || isPendingStart ? 'text-black/60' :
                              inPreview ? 'text-[#ace600]/80' :
                              status === 'available' ? 'text-[#ace600]/50' :
                              'text-gray-700'
                            }`}>
                              {isRangeStart ? 'Start' :
                               isRangeEnd   ? 'End' :
                               inConfirmedRange ? '●' :
                               isPendingStart ? 'Start' :
                               status === 'booked' ? 'Booked' :
                               status === 'past'   ? 'Past' : '1 hr'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ════════════════════════════════════════
            PANEL 3 — Booking Sidebar (right)
        ════════════════════════════════════════ */}
        <div className="w-64 shrink-0 border-l border-white/[0.06] flex flex-col overflow-hidden">
          {/* Booking summary */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-[#161b22] rounded-xl border border-white/[0.07] p-4">
              <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#ace600]" />
                Booking Summary
              </h3>

              {rangeStart !== null && selectedCourt ? (
                <div className="space-y-3">
                  <div className="p-3 bg-[#0d1117] rounded-lg space-y-2.5">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#ace600] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold leading-tight">{selectedCourt.name}</p>
                        {selectedCourt.venue?.name && (
                          <p className="text-[11px] text-gray-300 mt-0.5">{selectedCourt.venue.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#ace600] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold leading-tight">{format(selectedDate, 'EEE, MMM d')}</p>
                        <p className="text-[11px] text-gray-300 mt-0.5">
                          {fmtHour(rangeStart)}
                          {rangeEnd !== null && rangeEnd !== rangeStart
                            ? ` – ${fmtHour(rangeEnd + 1)}`
                            : ` – ${fmtHour(rangeStart + 1)}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selEnd === null && (
                    <p className="text-[11px] text-yellow-400/80 bg-yellow-500/5 border border-yellow-500/15 rounded-lg px-2.5 py-2">
                      Now click an end slot to extend your booking
                    </p>
                  )}

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-gray-300">
                      <span>Duration</span>
                      <span>{duration || 1} hour{(duration || 1) !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between text-gray-300">
                      <span>Rate</span>
                      <span>${price.toFixed(2)}/hr</span>
                    </div>
                    <div className="flex justify-between font-bold text-sm pt-2 border-t border-white/10">
                      <span>Total</span>
                      <span className="text-[#ace600]">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleBookNow}
                    disabled={selEnd === null && duration === 0}
                    className="w-full bg-[#ace600] text-black hover:bg-[#c4f500] font-bold h-10 text-sm disabled:opacity-50"
                  >
                    Book {duration || 1}h → ${totalPrice.toFixed(2)}
                  </Button>
                  <button
                    onClick={clearSelection}
                    className="w-full text-[11px] text-gray-700 hover:text-gray-200 transition-colors py-0.5"
                  >
                    Clear selection
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 gap-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center">
                    <Clock className="w-4 h-4 text-gray-700" />
                  </div>
                  <p className="text-xs text-gray-300">No slot selected</p>
                  <p className="text-[11px] text-gray-700">Click a green slot on the calendar</p>
                </div>
              )}
            </div>

            {/* Selected court quick stats */}
            {selectedCourt && (
              <div className="bg-[#161b22] rounded-xl border border-white/[0.07] p-4">
                <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">
                  Court Info
                </h3>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Type', value: TYPE_LABELS[selectedCourt.court_type] ?? selectedCourt.court_type },
                    selectedCourt.surface && { label: 'Surface', value: SURFACE_LABELS[selectedCourt.surface] ?? selectedCourt.surface },
                    selectedCourt.capacity && { label: 'Capacity', value: `${selectedCourt.capacity} players` },
                    { label: 'Lighting', value: selectedCourt.has_lighting ? 'Yes' : 'No' },
                    { label: 'Net', value: selectedCourt.has_net ? 'Included' : 'Not included' },
                  ].filter(Boolean).map((item: any) => (
                    <div key={item.label} className="flex justify-between">
                      <span className="text-gray-300">{item.label}</span>
                      <span className="text-gray-300">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="bg-[#161b22] rounded-xl border border-white/[0.07] p-4">
              <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">
                How it works
              </h3>
              <ol className="space-y-2">
                {[
                  ['Browse', 'Pick a court from the list'],
                  ['Date', 'Navigate to your date'],
                  ['Slot', 'Tap a green time slot'],
                  ['Pay', 'Complete payment to confirm'],
                ].map(([step, desc], i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#ace600]/15 text-[#ace600] text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[11px] font-medium text-gray-200">{step}</p>
                      <p className="text-[11px] text-gray-300">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* ── Upcoming Reservations ── */}
      <div className="border-t border-white/[0.06] bg-[#0d1117] px-4 md:px-6 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#ace600]" />
            Upcoming Reservations
          </h2>
          {upcoming.length > 0 && (
            <span className="text-xs text-gray-300">{upcoming.length} upcoming</span>
          )}
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-[#161b22] rounded-xl border border-white/[0.07] flex items-center justify-center py-8 gap-3">
            <Calendar className="w-5 h-5 text-gray-700" />
            <p className="text-gray-300 text-sm">No upcoming reservations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {upcoming.map((r) => {
              const courtName =
                courts.find((c) => c.id === r.court_id)?.name ?? r.court_id ?? 'Court';
              const courtData = courts.find((c) => c.id === r.court_id);
              return (
                <div
                  key={r.id}
                  className="bg-[#161b22] rounded-xl border border-white/[0.07] p-3.5 hover:border-white/15 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <Badge
                      className={`text-[10px] border px-1.5 py-0.5 ${
                        r.status === 'confirmed'
                          ? 'bg-[#ace600]/10 text-[#ace600] border-[#ace600]/25'
                          : r.status === 'pending'
                          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/25'
                          : 'bg-white/5 text-gray-300 border-white/10'
                      }`}
                    >
                      {r.status}
                    </Badge>
                    <button
                      onClick={async () => {
                        try {
                          await dispatch(cancelCourtReservation(r.id)).unwrap();
                          toast.success('Reservation cancelled');
                          dispatch(fetchCourtReservations({ limit: 20 }));
                        } catch {
                          toast.error('Failed to cancel');
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-400 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold truncate">{courtName}</p>
                    {courtData?.venue?.name && (
                      <p className="text-[11px] text-gray-300 truncate">{courtData.venue.name}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                      <Calendar className="w-3 h-3 shrink-0" />
                      {format(new Date(r.start_time), 'EEE, MMM d')}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                      <Clock className="w-3 h-3 shrink-0" />
                      {format(new Date(r.start_time), 'h:mm a')} – {format(new Date(r.end_time), 'h:mm a')}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-white/[0.05] flex justify-between items-center">
                    <span className="text-[11px] text-gray-700">Total</span>
                    <span className="text-xs font-bold text-[#ace600]">
                      ${Number(r.total_amount ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Booking Modal ── */}
      <Dialog open={step !== null} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="bg-[#161b22] border-white/10 text-white sm:max-w-md">

          {/* Step 1: Review */}
          {step === 'review' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">Confirm Booking</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="bg-[#0d1117] rounded-xl p-4 space-y-3 text-sm">
                  {[
                    ['Court', selectedCourt?.name ?? '—'],
                    ['Venue', selectedCourt?.venue?.name ?? selectedCourt?.club?.name ?? '—'],
                    ['Date', format(selectedDate, 'EEEE, MMM d, yyyy')],
                    ['Time', `${fmtHour(rangeStart!)} – ${fmtHour(rangeEnd! + 1)}`],
                    ['Duration', `${duration} hour${duration !== 1 ? 's' : ''}`],
                  ].filter(([, v]) => v !== '—' || true).map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-300">{label}</span>
                      <span className="font-medium text-gray-200">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-base pt-3 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-[#ace600]">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={closeModal} className="flex-1 border-white/15 text-gray-300 hover:bg-white/5 hover:text-white">
                    Cancel
                  </Button>
                  <Button onClick={initPayment} disabled={paymentLoading} className="flex-1 bg-[#ace600] text-black hover:bg-[#c4f500] font-bold">
                    {paymentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pagar →'}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && paymentIntent && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#ace600]" />
                  Pago seguro
                </DialogTitle>
              </DialogHeader>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: paymentIntent.clientSecret,
                  appearance: {
                    theme: 'night',
                    variables: {
                      colorPrimary: '#ace600',
                      colorBackground: '#161b22',
                      colorText: '#ffffff',
                      colorTextSecondary: '#9ca3af',
                      colorDanger: '#f87171',
                      borderRadius: '10px',
                      fontFamily: 'system-ui, sans-serif',
                    },
                    rules: {
                      '.Input': { border: '1px solid rgba(255,255,255,0.12)', backgroundColor: '#0d1117' },
                      '.Label': { color: '#9ca3af', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' },
                    },
                  },
                }}
              >
                <CourtPaymentForm
                  paymentId={paymentIntent.paymentId}
                  amount={totalPrice}
                  duration={duration || 1}
                  price={price}
                  onSuccess={handlePaymentSuccess}
                  onBack={() => setStep('review')}
                />
              </Elements>
            </>
          )}

          {/* Step 3: Processing */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-20 h-20 rounded-2xl bg-[#ace600]/10 border border-[#ace600]/25 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#ace600]" />
              </div>
              <div>
                <p className="font-bold text-lg">Processing Payment…</p>
                <p className="text-sm text-gray-300 mt-1">Please don't close this window</p>
              </div>
            </div>
          )}

          {/* Step 4: Confirmed */}
          {step === 'confirmed' && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">Booking Confirmed!</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2 text-center">
                <div className="flex flex-col items-center gap-3 py-2">
                  <div className="w-20 h-20 rounded-2xl bg-[#ace600]/15 border-2 border-[#ace600] flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-[#ace600]" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Court booked successfully!</p>
                    {createdReservation?.id && (
                      <p className="text-xs text-gray-300 mt-0.5">
                        Ref #{String(createdReservation.id).slice(0, 8).toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="bg-[#0d1117] rounded-xl p-4 space-y-2 text-sm text-left">
                  {[
                    ['Court', selectedCourt?.name ?? '—'],
                    ['Date', format(selectedDate, 'EEEE, MMM d, yyyy')],
                    ['Time', `${fmtHour(rangeStart!)} – ${fmtHour(rangeEnd! + 1)}`],
                    ['Duration', `${duration}h`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-300">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold border-t border-white/10 pt-2">
                    <span>Paid</span>
                    <span className="text-[#ace600]">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <Button onClick={closeModal} className="w-full bg-[#ace600] text-black hover:bg-[#c4f500] font-bold h-11">
                  Done
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// local alias to avoid conflict with lucide Calendar import
function CalendarIcon(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return <Calendar {...(props as any)} />;
}

// ─── Stripe inner payment form ────────────────────────────────────────────────

function CourtPaymentForm({
  paymentId,
  amount,
  duration,
  price,
  onSuccess,
  onBack,
}: {
  paymentId: string;
  amount: number;
  duration: number;
  price: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsPaying(true);
    setPayError(null);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });
      if (error) {
        setPayError(error.message || 'El pago falló');
        return;
      }
      if (paymentIntent?.status === 'succeeded') {
        await PaymentService.confirmPayment(paymentId, { payment_intent_id: paymentIntent.id });
        onSuccess();
      }
    } catch (err: any) {
      setPayError(err?.message || 'Error al confirmar el pago');
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-4 mt-2">
      <div className="flex items-center justify-between bg-[#ace600]/8 border border-[#ace600]/20 rounded-xl p-3.5">
        <div>
          <span className="text-sm text-gray-200">Total a pagar</span>
          <p className="text-[11px] text-gray-300">{duration}h × ${price.toFixed(2)}/hr</p>
        </div>
        <span className="font-bold text-[#ace600] text-2xl">${amount.toFixed(2)}</span>
      </div>

      <PaymentElement />

      {payError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          <p className="text-sm text-red-400">{payError}</p>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
        <Shield className="w-3 h-3" /> Pago seguro con cifrado SSL
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isPaying}
          className="flex-1 border-white/15 text-gray-300 hover:bg-white/5 hover:text-white"
        >
          ← Volver
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isPaying}
          className="flex-1 bg-[#ace600] text-black hover:bg-[#c4f500] font-bold"
        >
          {isPaying
            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Procesando…</>
            : `Pagar $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
}
