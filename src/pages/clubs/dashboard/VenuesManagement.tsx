'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import {
  fetchVenuesByClub,
  fetchVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  clearSelectedVenue,
} from '@/store/slices/venuesSlice';
import { fetchClubProfile } from '@/store/slices/clubDashboardSlice';
import type { Venue } from '@/store/slices/venuesSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MEXICAN_STATES } from '@/constants/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, Plus, Trash2, Edit2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ACCENT = '#ace600';

export default function VenuesManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const { venues, loading, error } = useSelector((state: RootState) => state.venues);
  const { profile, profileLoading } = useSelector((state: RootState) => state.clubDashboard);

  // Get clubId from club profile
  const clubId = profile?.id;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterActive, setFilterActive] = useState<string>('all');
  const itemsPerPage = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    address: '',
    phone: '',
    whatsapp: '',
    court_type: 'outdoor',
    surface_type: 'concrete',
    base_price_per_hour: 0,
    number_of_courts: 1,
    description: '',
    facilities: [] as string[],
  });

  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);

  // First, fetch club profile to get clubId
  useEffect(() => {
    dispatch(fetchClubProfile());
  }, [dispatch]);

  // Then, fetch venues once clubId is available
  useEffect(() => {
    if (!clubId) return;

    dispatch(
      fetchVenuesByClub({
        clubId,
        page: currentPage,
        limit: itemsPerPage,
        isActive: filterActive === 'true' ? true : filterActive === 'false' ? false : undefined,
      }),
    );
  }, [dispatch, clubId, currentPage, filterActive]);

  const handleOpenModal = (venue?: Venue) => {
    if (venue) {
      setFormData({
        name: venue.name,
        state: venue.state,
        address: venue.address,
        phone: venue.phone || '',
        whatsapp: venue.whatsapp || '',
        court_type: venue.court_type,
        surface_type: venue.surface_type,
        base_price_per_hour: venue.base_price_per_hour,
        number_of_courts: venue.number_of_courts,
        description: venue.description || '',
        facilities: venue.facilities || [],
      });
      setEditingVenueId(venue.id);
      setIsEditMode(true);
    } else {
      setFormData({
        name: '',
        state: '',
        address: '',
        phone: '',
        whatsapp: '',
        court_type: 'outdoor',
        surface_type: 'concrete',
        base_price_per_hour: 0,
        number_of_courts: 1,
        description: '',
        facilities: [],
      });
      setEditingVenueId(null);
      setIsEditMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVenueId(null);
    setIsEditMode(false);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error('Please enter venue name');
        return;
      }

      if (isEditMode && editingVenueId) {
        await dispatch(
          updateVenue({
            id: editingVenueId,
            data: {
              ...formData,
              club_id: clubId,
            },
          }),
        ).unwrap();
        toast.success('Venue updated successfully');
      } else {
        await dispatch(
          createVenue({
            ...formData,
            club_id: clubId,
          }),
        ).unwrap();
        toast.success('Venue created successfully');
      }
      handleCloseModal();
    } catch (error: any) {
      toast.error(error || 'Failed to save venue');
    }
  };

  const handleDelete = async (venueId: string) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;

    try {
      await dispatch(deleteVenue(venueId)).unwrap();
      toast.success('Venue deleted successfully');
    } catch (error: any) {
      toast.error(error || 'Failed to delete venue');
    }
  };

  const filteredVenues = venues.filter((venue) =>
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const paginatedVenues = filteredVenues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);

  // Guard: Wait for club profile to load
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-[#080c14] text-[#f0f4ff] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: ACCENT }} />
          </div>
        </div>
      </div>
    );
  }

  if (!clubId) {
    return (
      <div className="min-h-screen bg-[#080c14] text-[#f0f4ff] p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-[#4a5a72] mb-4">
              Unable to load venues. Please ensure you are logged in as a club administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-[#f0f4ff] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Venues Management</h1>
            <p className="text-[#4a5a72]">Manage your club venues and courts</p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#ace600] hover:bg-[#95b300] text-black"
          >
            <Plus className="w-4 h-4" />
            Add Venue
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <Input
            placeholder="Search venues..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 bg-[#111827] border-white/10 text-white placeholder:text-white/30"
          />
          <Select value={filterActive} onValueChange={setFilterActive}>
            <SelectTrigger className="w-40 bg-[#111827] border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#111827] border-white/10">
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <div className="font-medium text-red-400">Error</div>
              <div className="text-sm text-red-300">{error}</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && venues.length === 0 ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: ACCENT }} />
          </div>
        ) : paginatedVenues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#4a5a72] mb-4">No venues found</p>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-[#ace600] hover:bg-[#95b300] text-black"
            >
              Create Your First Venue
            </Button>
          </div>
        ) : (
          <>
            {/* Venues Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedVenues.map((venue) => (
                <div
                  key={venue.id}
                  className="bg-[#111827] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{venue.name}</h3>
                      <p className="text-xs text-[#4a5a72]">{venue.address}</p>
                    </div>
                    <Badge
                      className={`shrink-0 ml-2 ${
                        venue.is_active
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {venue.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4 py-3 border-y border-white/10">
                    <div className="text-xs">
                      <span className="text-[#4a5a72]">State:</span>
                      <span className="ml-2 text-white">{venue.state}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-[#4a5a72]">Courts:</span>
                      <span className="ml-2 text-white">{venue.number_of_courts}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-[#4a5a72]">Type:</span>
                      <span className="ml-2 text-white capitalize">{venue.court_type}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-[#4a5a72]">Price/Hour:</span>
                      <span className="ml-2 text-white">${venue.base_price_per_hour}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleOpenModal(venue)}
                      className="flex-1 bg-[#ace600]/10 hover:bg-[#ace600]/20 text-[#ace600] border border-[#ace600]/30"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(venue.id)}
                      className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="text-sm text-[#4a5a72]">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="border-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal for Create/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0d1421] border-white/10 max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {isEditMode ? 'Edit Venue' : 'Create New Venue'}
            </DialogTitle>
            <DialogDescription className="text-[#4a5a72]">
              {isEditMode
                ? 'Update venue details. Courts will be automatically created/updated.'
                : 'Add a new venue to your club. Courts will be automatically created based on the count.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-[#4a5a72] uppercase tracking-widest mb-2 block">
                Venue Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Downtown Courts"
                className="bg-[#111827] border-white/10 text-white placeholder:text-white/30"
              />
            </div>

            {/* State */}
            <div>
              <label className="text-xs font-semibold text-[#4a5a72] uppercase tracking-widest mb-2 block">
                State *
              </label>
              <Select
                value={formData.state}
                onValueChange={(v) => setFormData({ ...formData, state: v })}
              >
                <SelectTrigger className="bg-[#111827] border-white/10 text-white">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-white/10">
                  {MEXICAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-semibold text-[#4a5a72] uppercase tracking-widest mb-2 block">
                Address *
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
                className="bg-[#111827] border-white/10 text-white placeholder:text-white/30"
              />
            </div>

            {/* Phone & WhatsApp */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#4a5a72] uppercase tracking-widest mb-2 block">
                  Phone
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                  className="bg-[#111827] border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4a5a72] uppercase tracking-widest mb-2 block">
                  WhatsApp
                </label>
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="WhatsApp number"
                  className="bg-[#111827] border-white/10 text-white placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Court Type & Surface Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#4a5a72] uppercase tracking-widest mb-2 block">
                  Court Type *
                </label>
                <Select
                  value={formData.court_type}
                  onValueChange={(v) => setFormData({ ...formData, court_type: v })}
                >
                  <SelectTrigger className="bg-[#111827] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="covered">Covered</SelectItem>
                    <SelectItem value="indoor">Indoor</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4a5a72] uppercase tracking-widest mb-2 block">
                  Surface Type *
                </label>
                <Select
                  value={formData.surface_type}
                  onValueChange={(v) => setFormData({ ...formData, surface_type: v })}
                >
                  <SelectTrigger className="bg-[#111827] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="wood">Wood</SelectItem>
                    <SelectItem value="concrete">Concrete</SelectItem>
                    <SelectItem value="acrylic">Acrylic</SelectItem>
                    <SelectItem value="tartan">Tartan</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Price per Hour & Number of Courts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#4a5a72] uppercase tracking-widest mb-2 block">
                  Base Price/Hour ($) *
                </label>
                <Input
                  type="number"
                  value={formData.base_price_per_hour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      base_price_per_hour: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                  className="bg-[#111827] border-white/10 text-white placeholder:text-white/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#4a5a72] uppercase tracking-widest mb-2 block">
                  Number of Courts * (Auto-creates courts)
                </label>
                <Input
                  type="number"
                  value={formData.number_of_courts}
                  onChange={(e) =>
                    setFormData({ ...formData, number_of_courts: parseInt(e.target.value) || 1 })
                  }
                  placeholder="1"
                  min="1"
                  className="bg-[#111827] border-white/10 text-white placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-[#4a5a72] uppercase tracking-widest mb-2 block">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Venue description"
                rows={3}
                className="w-full bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-white placeholder:text-white/30"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <Button variant="outline" onClick={handleCloseModal} className="border-white/10">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#ace600] hover:bg-[#95b300] text-black"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditMode ? (
                'Update Venue'
              ) : (
                'Create Venue'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
