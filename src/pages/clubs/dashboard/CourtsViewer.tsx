'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { AppDispatch, RootState } from '@/store';
import type { Venue, Court } from '@/store/slices/venuesSlice';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowLeft, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

const ACCENT = '#ace600';

interface CourtListProps {
  venue: Venue;
  onBack: () => void;
}

export default function CourtsViewer({ venue, onBack }: CourtListProps) {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  if (!venue.courts || venue.courts.length === 0) {
    return (
      <div className="min-h-screen bg-[#080c14] text-[#f0f4ff] p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={onBack}
              variant="ghost"
              className="mb-4 text-[#ace600] hover:bg-[#ace600]/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('courts_viewer.back_to_venues')}
            </Button>
            <h1 className="text-3xl font-bold mb-2">{venue.name} - {t('club_dashboard.nav.venues')}</h1>
            <p className="text-[#4a5a72]">{t('courts_viewer.manage_courts')}</p>
          </div>

          {/* Empty State */}
          <div className="bg-[#111827] border border-white/10 rounded-xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{
                  background: 'rgba(172,230,0,0.1)',
                  border: '1px solid rgba(172,230,0,0.2)',
                  color: ACCENT,
                }}
              >
                <Info className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[#4a5a72] mb-4">{t('courts_viewer.no_courts_title')}</p>
            <Button onClick={onBack} className="bg-[#ace600] hover:bg-[#95b300] text-black">
              {t('courts_viewer.create_venue_btn')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-[#f0f4ff] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-4 text-[#ace600] hover:bg-[#ace600]/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('courts_viewer.back_to_venues')}
          </Button>
          <h1 className="text-3xl font-bold mb-2">{venue.name} - {t('club_dashboard.nav.venues')}</h1>
          <p className="text-[#4a5a72]">{t('courts_viewer.manage_courts')} ({venue.courts.length})</p>
        </div>

        {/* Venue Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#111827] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-[#4a5a72] uppercase tracking-widest mb-2">{t('courts_viewer.location')}</p>
            <p className="text-sm text-white font-medium">{venue.address}</p>
            <p className="text-xs text-[#4a5a72] mt-1">{venue.state}</p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-[#4a5a72] uppercase tracking-widest mb-2">{t('courts_viewer.court_type')}</p>
            <p className="text-sm text-white font-medium capitalize">{venue.court_type}</p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-[#4a5a72] uppercase tracking-widest mb-2">{t('courts_viewer.surface')}</p>
            <p className="text-sm text-white font-medium capitalize">{venue.surface_type}</p>
          </div>
          <div className="bg-[#111827] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-[#4a5a72] uppercase tracking-widest mb-2">{t('courts_viewer.price_per_hour')}</p>
            <p className="text-sm text-white font-medium">${venue.base_price_per_hour}</p>
          </div>
        </div>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venue.courts.map((court: Court) => (
            <div
              key={court.id}
              className="bg-[#111827] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{court.name}</h3>
                  <p className="text-xs text-[#4a5a72]">{t('courts_viewer.court_number', { number: court.court_number })}</p>
                </div>
                <Badge
                  className={
                    court.is_active
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-200'
                  }
                >
                  {court.is_active ? t('courts_viewer.status_active') : t('courts_viewer.status_inactive')}
                </Badge>
              </div>

              <div className="space-y-2 py-3 border-y border-white/10">
                <div className="flex justify-between text-xs">
                  <span className="text-[#4a5a72]">{t('courts_viewer.details_type')}</span>
                  <span className="text-white capitalize">{court.court_type}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#4a5a72]">{t('courts_viewer.details_surface')}</span>
                  <span className="text-white capitalize">{court.surface_type}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#4a5a72]">{t('courts_viewer.details_rate')}</span>
                  <span className="text-white">${court.hourly_rate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#4a5a72]">{t('courts_viewer.details_status')}</span>
                  <span className={court.is_available ? 'text-green-400' : 'text-red-400'}>
                    {court.is_available ? t('courts_viewer.status_available') : t('courts_viewer.status_unavailable')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
