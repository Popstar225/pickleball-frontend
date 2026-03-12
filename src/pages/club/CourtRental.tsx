import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../store';
import { 
  fetchCourtBookings, 
  fetchCourtStatus, 
  fetchTimeSlots 
} from '../../../store/slices/clubDashboardSlice';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign, 
  Wrench, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Plus,
  RefreshCw
} from 'lucide-react';

interface CourtBooking {
  status: 'available' | 'booked' | 'maintenance' | 'reserved';
  price: number;
  player?: string;
  bookingId?: string;
  startTime: string;
  endTime: string;
}

interface Court {
  id: number;
  name: string;
  status: string;
  currentTime: string;
  nextBooking: string;
}

interface CourtRentalProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedCourt: string;
  setSelectedCourt: (court: string) => void;
  timeSlots: string[];
  courtBookings: Record<string, Record<string, CourtBooking>>;
}

const CourtRental: React.FC<CourtRentalProps> = ({
  selectedDate,
  setSelectedDate,
  selectedCourt,
  setSelectedCourt,
  timeSlots: initialTimeSlots,
  courtBookings: initialCourtBookings
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { courtStatus, loading, error } = useSelector((state: RootState) => state.clubDashboard);
  
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [selectedCourtForBooking, setSelectedCourtForBooking] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [localCourtBookings, setLocalCourtBookings] = useState<Record<string, Record<string, CourtBooking>>>(initialCourtBookings || {});
  const [localTimeSlots, setLocalTimeSlots] = useState<string[]>(initialTimeSlots || []);
  const [localCourts, setLocalCourts] = useState<Court[]>([]);
  
  const [bookingData, setBookingData] = useState({
    playerName: '',
    playerEmail: '',
    playerPhone: '',
    duration: '1',
    specialRequests: ''
  });

  // Fetch data when component mounts or date changes
  useEffect(() => {
    if (user?.club_id) {
      refreshData();
    }
  }, [user?.club_id, selectedDate]);

  // Update local state when props change
  useEffect(() => {
    setLocalCourtBookings(initialCourtBookings || {});
    setLocalTimeSlots(initialTimeSlots || []);
  }, [initialCourtBookings, initialTimeSlots]);

  // Update local courts when Redux state changes
  useEffect(() => {
    if (courtStatus && courtStatus.length > 0) {
      setLocalCourts(courtStatus);
    }
  }, [courtStatus]);

  const refreshData = async () => {
    if (!user?.club_id) return;
    
    setIsLoading(true);
    try {
      const [bookingsResult, courtStatusResult, timeSlotsResult] = await Promise.all([
        dispatch(fetchCourtBookings({ clubId: user.club_id, date: selectedDate })).unwrap(),
        dispatch(fetchCourtStatus(user.club_id)).unwrap(),
        dispatch(fetchTimeSlots(user.club_id)).unwrap()
      ]);

      if (bookingsResult) {
        setLocalCourtBookings(bookingsResult);
      }
      if (timeSlotsResult) {
        setLocalTimeSlots(timeSlotsResult);
      }
      if (courtStatusResult) {
        setLocalCourts(courtStatusResult);
      }

      toast.success('Court data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing court data:', error);
      toast.error('Failed to refresh court data');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate calendar dates for the current month
  const calendarDates = useMemo(() => {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || dates.length < 42) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }, [selectedDate]);

  const handleCourtBooking = (court: string, time: string) => {
    setSelectedCourtForBooking(court);
    setSelectedTimeSlot(time);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingData.playerName || !bookingData.playerEmail) {
      toast.error('Please fill in player name and email');
      return;
    }

    if (!user?.club_id) {
      toast.error('User not authenticated');
      return;
    }

    setIsLoading(true);
    try {
      // Create booking data
      const startTime = new Date(`${selectedDate}T${selectedTimeSlot}`);
      const endTime = new Date(startTime.getTime() + parseInt(bookingData.duration) * 60 * 60 * 1000);
      
      const bookingPayload = {
        court_id: selectedCourtForBooking,
        user_id: user.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration: parseInt(bookingData.duration),
        special_requests: bookingData.specialRequests,
        total_amount: 50, // Default price since CourtStatus doesn't have hourly_rate
      };

      // Make API call to create booking
      const response = await fetch(`/api/v1/court-reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bookingPayload)
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Court ${selectedCourtForBooking} booked successfully for ${bookingData.playerName}`);
        
        // Refresh data to show new booking
        await refreshData();
        
        // Reset form
        setBookingData({
          playerName: '',
          playerEmail: '',
          playerPhone: '',
          duration: '1',
          specialRequests: ''
        });
        setShowBookingModal(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const getBookingStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 cursor-pointer';
      case 'booked': return 'bg-red-100 text-red-800 border-red-200';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'booked': return <XCircle className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'reserved': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date: Date) => {
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const getCourtAvailability = (courtId: number, timeSlot: string) => {
    const courtBookings = localCourtBookings[selectedDate] || {};
    const courtName = localCourts.find(c => c.id === courtId)?.name;
    
    if (!courtName || !courtBookings[courtName]) {
      // Check if court is in maintenance
      const court = localCourts.find(c => c.id === courtId);
      if (court?.status === 'Maintenance') {
        return {
          status: 'maintenance',
          price: 0,
          player: '',
          bookingId: ''
        };
      }
      
      // Available
      return {
        status: 'available',
        price: 50, // Default price
        player: '',
        bookingId: ''
      };
    }
    
    const timeSlotBooking = courtBookings[courtName][timeSlot];
    if (timeSlotBooking && timeSlotBooking.status === 'booked') {
      return {
        status: timeSlotBooking.status,
        price: timeSlotBooking.price,
        player: timeSlotBooking.player || '',
        bookingId: timeSlotBooking.bookingId || ''
      };
    }
    
    // Available
    return {
      status: 'available',
      price: 50, // Default price
      player: '',
      bookingId: ''
    };
  };

  const getAvailableSlotsCount = () => {
    let count = 0;
    localTimeSlots.forEach(timeSlot => {
      localCourts.forEach(court => {
        if (selectedCourt === 'all' || selectedCourt === court.id.toString()) {
          const availability = getCourtAvailability(court.id, timeSlot);
          if (availability.status === 'available') count++;
        }
      });
    });
    return count;
  };

  const getBookedSlotsCount = () => {
    let count = 0;
    localTimeSlots.forEach(timeSlot => {
      localCourts.forEach(court => {
        if (selectedCourt === 'all' || selectedCourt === court.id.toString()) {
          const availability = getCourtAvailability(court.id, timeSlot);
          if (availability.status === 'booked') count++;
        }
      });
    });
    return count;
  };

  const getMaintenanceCount = () => {
    return localCourts.filter(court => 
      (selectedCourt === 'all' || selectedCourt === court.id.toString()) && 
      court.status === 'Maintenance'
    ).length;
  };

  const getRevenueToday = () => {
    const bookings = localCourtBookings[selectedDate] || {};
    return Object.values(bookings)
      .filter(booking => booking.status === 'booked')
      .reduce((total, booking) => total + booking.price, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Court Rental & Booking</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="court" className="block text-sm font-medium text-gray-700 mb-1">Filter Court</label>
            <select 
              id="court"
              value={selectedCourt} 
              onChange={(e) => setSelectedCourt(e.target.value)}
              className="block px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="all">All Courts</option>
              {localCourts.map(court => (
                <option key={court.id} value={court.id}>{court.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Court Availability Calendar</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>Maintenance</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
              <span>Reserved</span>
            </div>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              const date = new Date(selectedDate);
              date.setMonth(date.getMonth() - 1);
              setSelectedDate(date.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h4 className="text-lg font-medium text-gray-900">
            {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h4>
          <button
            onClick={() => {
              const date = new Date(selectedDate);
              date.setMonth(date.getMonth() + 1);
              setSelectedDate(date.toISOString().split('T')[0]);
            }}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50">
              {day}
            </div>
          ))}
          
          {calendarDates.map((date, index) => {
            const dateString = date.toISOString().split('T')[0];
            const isCurrentMonth = date.getMonth() === new Date(selectedDate).getMonth();
            const isCurrentDate = isToday(date);
            const isSelected = isSelectedDate(date);
            
            return (
              <div
                key={index}
                className={`p-2 min-h-[80px] border border-gray-200 cursor-pointer transition-colors ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-gray-50'
                } ${isCurrentDate ? 'ring-2 ring-blue-500' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                onClick={() => {
                  if (isCurrentMonth) {
                    setSelectedDate(dateString);
                  }
                }}
              >
                <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                {isCurrentMonth && (
                  <div className="text-xs space-y-1">
                    {localCourts.slice(0, 2).map(court => {
                      const bookings = localCourtBookings[dateString] || {};
                      const courtBookings = bookings[court.id.toString()];
                      if (courtBookings) {
                        return (
                          <div key={court.id} className="text-xs truncate">
                            {court.name}: {courtBookings.status}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time Slots Grid */}
        <div className="border-t pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Time Slots for {new Date(selectedDate).toLocaleDateString()}</h4>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 gap-4">
              {localTimeSlots.map(time => (
                <div key={time} className="grid grid-cols-6 gap-4 items-center p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">{time}</div>
                  {localCourts.map(court => {
                    if (selectedCourt !== 'all' && selectedCourt !== court.id.toString()) return null;
                    
                    const availability = getCourtAvailability(court.id, time);
                    if (!availability) return (
                      <div key={court.id} className="text-center text-gray-400">-</div>
                    );

                    return (
                      <div key={court.id} className="text-center">
                        <div
                          className={`p-2 rounded border transition-all duration-200 ${getBookingStatusColor(availability.status)}`}
                          onClick={() => {
                            if (availability.status === 'available') {
                              handleCourtBooking(court.id.toString(), time);
                            }
                          }}
                        >
                          <div className="flex items-center justify-center space-x-1 mb-1">
                            {getStatusIcon(availability.status)}
                            <span className="text-xs font-medium">
                              {availability.status === 'available' ? 'Available' : 
                               availability.status === 'booked' ? 'Booked' :
                               availability.status === 'maintenance' ? 'Maintenance' : 
                               availability.status === 'reserved' ? 'Reserved' : 'Completed'}
                            </span>
                          </div>
                          <div className="text-sm font-bold">${availability.price}</div>
                          {availability.status === 'booked' && (
                            <div className="text-xs text-gray-600 truncate">{availability.player}</div>
                          )}
                          {availability.status === 'available' && (
                            <div className="text-xs text-green-600 font-medium">Click to Book</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Slots</p>
              <p className="text-2xl font-semibold text-gray-900">{getAvailableSlotsCount()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Booked Slots</p>
              <p className="text-2xl font-semibold text-gray-900">{getBookedSlotsCount()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Wrench className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Maintenance</p>
              <p className="text-2xl font-semibold text-gray-900">{getMaintenanceCount()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenue Today</p>
              <p className="text-2xl font-semibold text-gray-900">${getRevenueToday()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Book Court {localCourts.find(c => c.id === parseInt(selectedCourtForBooking))?.name} at {selectedTimeSlot}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Player Name *</label>
                  <input
                    type="text"
                    value={bookingData.playerName}
                    onChange={(e) => setBookingData({...bookingData, playerName: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter player name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={bookingData.playerEmail}
                    onChange={(e) => setBookingData({...bookingData, playerEmail: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={bookingData.playerPhone}
                    onChange={(e) => setBookingData({...bookingData, playerPhone: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                  <select
                    value={bookingData.duration}
                    onChange={(e) => setBookingData({...bookingData, duration: e.target.value})}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                    <option value="4">4 hours</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                  <textarea
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                    rows={3}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any special requests or notes"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleConfirmBooking}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourtRental; 