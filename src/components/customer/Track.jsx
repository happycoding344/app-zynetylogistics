import React, { useState, useEffect } from 'react';
import { MapPin, ChevronRight, Navigation, CheckCircle2, Clock, Truck, Bike, Globe, PackageCheck, AlertCircle, RefreshCcw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const API_BASE = 'https://zynetylogistics.com/wp-json/zynety/v1';

const STATUS_STEPS = [
  { key: 'confirmed',       label: 'Booking Confirmed' },
  { key: 'driver_assigned', label: 'Driver Assigned' },
  { key: 'picked_up',       label: 'Goods Picked Up' },
  { key: 'in_transit',      label: 'In Transit' },
  { key: 'delivered',       label: 'Delivered' },
];

const STATUS_ORDER = STATUS_STEPS.map(s => s.key);

export default function Track() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryBookingId = searchParams.get('booking_id');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Resolve booking ID: URL param > localStorage
  const bookingId = queryBookingId
    || localStorage.getItem('zynety_last_booking_id')
    || null;

  const fetchBooking = async () => {
    if (!bookingId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.status === 'success') {
        setBooking(data.booking);
      } else {
        throw new Error('Booking not found');
      }
    } catch (e) {
      setError('Could not load tracking info. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
    // Poll every 30 seconds for status updates
    const interval = setInterval(fetchBooking, 30000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const currentStatusIndex = booking ? STATUS_ORDER.indexOf(booking.status) : -1;

  // ── Empty State (no active booking) ──────────────────────
  if (!bookingId) {
    return (
      <div className="flex flex-col h-full bg-[#f1f5f9]">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2rem] m-4 shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 border-2 border-dashed border-slate-200">
            <MapPin size={32} />
          </div>
          <h2 className="text-xl font-outfit font-extrabold text-slate-800 tracking-tight mb-2">No Active Trips</h2>
          <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs mx-auto">
            You don't have any ongoing deliveries right now. Once you book a fleet, you can track it live here.
          </p>
          <button
            onClick={() => navigate('/book-select')}
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            Book a Delivery <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ── Loading ────────────────────────────────────────────────
  if (loading && !booking) {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center gap-4">
        <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="font-bold text-slate-500 text-sm">Loading tracking info…</p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────
  if (error && !booking) {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-8 text-center">
        <AlertCircle size={40} className="text-red-400 mb-4" />
        <p className="font-bold text-slate-700 text-base mb-2">Tracking Unavailable</p>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <button onClick={fetchBooking} className="flex items-center gap-2 bg-blue-50 text-blue-600 font-bold py-2.5 px-5 rounded-xl text-sm hover:bg-blue-100 transition-colors">
          <RefreshCcw size={14} /> Try Again
        </button>
      </div>
    );
  }

  // ── Active Booking Tracking View ───────────────────────────
  if (booking) {
    const isDelivered = booking.status === 'delivered';
    return (
      <div className="flex flex-col h-full bg-slate-50 pb-4">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 px-5 py-4 sticky top-0 z-10 shadow-sm shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-extrabold text-lg text-slate-800 font-outfit">Live Tracking</h1>
              <p className="text-xs font-bold text-slate-400 mt-0.5">{booking.ref}</p>
            </div>
            <button onClick={fetchBooking} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors">
              <RefreshCcw size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Route Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <div className="relative pl-6 border-l-2 border-slate-100 ml-2 space-y-4">
              <div className="relative">
                <div className="absolute -left-[25px] top-1 w-4 h-4 bg-white border-4 border-blue-500 rounded-full shadow-sm" />
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Pickup · {booking.pickup_pincode}</p>
                <p className="font-semibold text-slate-700 text-sm leading-snug">{booking.pickup_address}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[25px] top-1 w-4 h-4 bg-white border-4 border-purple-500 rounded-full shadow-sm" />
                <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1">Drop · {booking.drop_pincode}</p>
                <p className="font-semibold text-slate-700 text-sm leading-snug">{booking.drop_address}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              {booking.distance_km && (
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{booking.distance_km} km</span>
              )}
              <span className="text-[9px] font-black text-slate-200">•</span>
              <span className="font-extrabold text-slate-800">₹{booking.total_price}</span>
            </div>
          </div>

          {/* Driver Info if assigned */}
          {booking.driver_name && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0">
                {booking.driver_name.charAt(0)}
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Your Driver</p>
                <p className="font-extrabold text-slate-800">{booking.driver_name}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-extrabold text-slate-800 mb-5 font-outfit">Trip Progress</h3>
            <div className="relative pl-7 border-l-2 border-slate-100 ml-3 space-y-5">
              {STATUS_STEPS.map((s, i) => {
                const isDone = currentStatusIndex >= i;
                const isCurrent = currentStatusIndex === i;
                return (
                  <div key={s.key} className="relative">
                    {isDone ? (
                      <div className="absolute -left-[35px] top-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm shadow-blue-600/20">
                        <CheckCircle2 size={10} className="text-white" strokeWidth={3} />
                      </div>
                    ) : isCurrent ? (
                      <div className="absolute -left-[35px] top-0 w-6 h-6 bg-white border-4 border-blue-600 rounded-full shadow-sm shadow-blue-500/30" />
                    ) : (
                      <div className="absolute -left-[29px] top-1 w-3 h-3 bg-slate-200 rounded-full border-2 border-white" />
                    )}
                    <p className={`font-bold text-sm transition-opacity ${isDone || isCurrent ? 'text-slate-800 opacity-100' : 'text-slate-400 opacity-50'} ${isCurrent ? 'text-blue-600' : ''}`}>
                      {s.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivered CTA */}
          {isDelivered && (
            <div className="bg-green-50 border border-green-100 rounded-3xl p-6 text-center">
              <CheckCircle2 size={36} className="text-green-500 mx-auto mb-2" strokeWidth={2} />
              <h3 className="font-extrabold text-green-800 text-lg">Delivered Successfully!</h3>
              <p className="text-green-600 text-sm mt-1 font-medium mb-4">Your delivery has been completed.</p>
              <button
                onClick={() => { localStorage.removeItem('zynety_last_booking_id'); navigate('/orders'); }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all"
              >
                View Order History
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
