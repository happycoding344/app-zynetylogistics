import React, { useState, useEffect, useCallback } from 'react';
import {
  MapPin, ChevronRight, Navigation, CheckCircle2, Clock,
  Truck, Bike, Globe, PackageCheck, AlertCircle, RefreshCcw, Package
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CUSTOM_API  = 'https://zynetylogistics.com/wp-json/zynety/v1';
const WP_REST_API = 'https://zynetylogistics.com/wp-json/wp/v2/zynety_booking';

const STATUS_STEPS = [
  { key: 'confirmed',       label: 'Booking Confirmed',  icon: CheckCircle2 },
  { key: 'driver_assigned', label: 'Driver Assigned',    icon: Navigation },
  { key: 'picked_up',       label: 'Goods Picked Up',    icon: PackageCheck },
  { key: 'in_transit',      label: 'In Transit',         icon: Truck },
  { key: 'delivered',       label: 'Delivered',          icon: CheckCircle2 },
];
const STATUS_ORDER = STATUS_STEPS.map(s => s.key);
const ACTIVE_STATUSES = ['confirmed', 'driver_assigned', 'picked_up', 'in_transit'];

const SERVICE_ICONS  = { bike: Bike, truck: Truck, packers: PackageCheck, intercity: Globe };
const SERVICE_LABELS = { bike: 'Two Wheeler', truck: 'Truck', packers: 'Packers & Movers', intercity: 'Intercity' };

function normaliseWP(raw) {
  const m = raw.meta || {};
  return {
    id:             raw.id,
    ref:            raw.title?.rendered || `#${raw.id}`,
    date:           raw.date,
    pickup_address: m.pickup_address || '',
    pickup_pincode: m.pickup_pincode || '',
    drop_address:   m.drop_address   || '',
    drop_pincode:   m.drop_pincode   || '',
    service_type:   m.service_type   || 'bike',
    total_price:    m.total_price    || 0,
    distance_km:    m.distance_km    || '',
    status:         m.status         || 'confirmed',
    driver_name:    m.driver_name    || '',
  };
}

async function fetchAllUserBookings(userId, userEmail) {
  // Try custom API first
  try {
    const params = new URLSearchParams();
    if (userId)    params.set('user_id',    userId);
    if (userEmail) params.set('user_email', userEmail);
    const res = await fetch(`${CUSTOM_API}/bookings?${params}`, { signal: AbortSignal.timeout(7000) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.bookings)) return data.bookings;
    }
  } catch {}

  // Fall back to WP REST API
  try {
    const res = await fetch(
      `${WP_REST_API}?per_page=50&_fields=id,title,date,meta&orderby=date&order=desc`,
      { signal: AbortSignal.timeout(7000) }
    );
    if (res.ok) {
      const all = await res.json();
      if (Array.isArray(all)) {
        const mine = all.filter(b => {
          const m = b.meta || {};
          return m.user_email === userEmail || String(b.author) === String(userId);
        });
        return mine.map(normaliseWP);
      }
    }
  } catch {}

  // Fall back to localStorage cache
  try {
    const cached = localStorage.getItem(`zynety_orders_${userEmail}`);
    return cached ? JSON.parse(cached) : [];
  } catch { return []; }
}

async function fetchSingleBooking(bookingId) {
  // Try custom API
  try {
    const res = await fetch(`${CUSTOM_API}/bookings/${bookingId}`, { signal: AbortSignal.timeout(7000) });
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && data.booking) return data.booking;
    }
  } catch {}

  // Try WP REST API
  try {
    const res = await fetch(
      `${WP_REST_API}/${bookingId}?_fields=id,title,date,meta`,
      { signal: AbortSignal.timeout(7000) }
    );
    if (res.ok) {
      const data = await res.json();
      return normaliseWP(data);
    }
  } catch {}

  throw new Error('Booking not found via any method');
}

// ─────────────────────────────────────────────────────────────────────────────

function TrackingView({ booking, onRefresh, onSelectDifferent }) {
  const navigate = useNavigate();
  const currentIdx  = STATUS_ORDER.indexOf(booking.status);
  const isDelivered = booking.status === 'delivered';
  const ServiceIcon = SERVICE_ICONS[booking.service_type] || Bike;

  return (
    <div className="flex flex-col h-full bg-slate-50 pb-4">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-5 py-4 sticky top-0 z-10 shadow-sm shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <ServiceIcon size={16} className="text-blue-600" />
            </div>
            <div>
              <h1 className="font-extrabold text-base text-slate-800 font-outfit leading-tight">Live Tracking</h1>
              <p className="text-[10px] font-bold text-slate-400">{booking.ref}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {onSelectDifferent && (
              <button onClick={onSelectDifferent} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                Switch
              </button>
            )}
            <button onClick={onRefresh} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors">
              <RefreshCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Status Banner */}
        {!isDelivered && (
          <div className="bg-blue-600 text-white rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg shadow-blue-600/20">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              {React.createElement(STATUS_STEPS[currentIdx]?.icon || Clock, { size: 20, className: 'text-white' })}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-200">Current Status</p>
              <p className="font-extrabold text-white">{STATUS_STEPS[currentIdx]?.label || 'In Progress'}</p>
            </div>
          </div>
        )}

        {/* Route Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="relative pl-6 border-l-2 border-slate-100 ml-2 space-y-4">
            <div className="relative">
              <div className="absolute -left-[25px] top-1 w-4 h-4 bg-white border-4 border-blue-500 rounded-full shadow-sm" />
              <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Pickup · {booking.pickup_pincode}</p>
              <p className="font-semibold text-slate-700 text-sm leading-snug">{booking.pickup_address || booking.pickup_pincode || '—'}</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[25px] top-1 w-4 h-4 bg-white border-4 border-purple-500 rounded-full shadow-sm" />
              <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-1">Drop · {booking.drop_pincode}</p>
              <p className="font-semibold text-slate-700 text-sm leading-snug">{booking.drop_address || booking.drop_pincode || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{SERVICE_LABELS[booking.service_type] || 'Delivery'}</span>
            {booking.distance_km && (
              <><span className="text-slate-200">•</span>
              <span className="text-[9px] font-black text-slate-400 uppercase">{booking.distance_km} km</span></>
            )}
            <span className="text-slate-200">•</span>
            <span className="font-extrabold text-slate-800">₹{booking.total_price}</span>
          </div>
        </div>

        {/* Driver */}
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
          <div className="relative pl-8 border-l-2 border-slate-100 ml-3 space-y-5">
            {STATUS_STEPS.map((s, i) => {
              const done    = currentIdx >= i;
              const current = currentIdx === i;
              const StepIcon = s.icon;
              return (
                <div key={s.key} className="relative">
                  {done ? (
                    <div className={`absolute -left-[38px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-sm ${current && !isDelivered ? 'bg-blue-500 shadow-blue-500/30 animate-pulse' : 'bg-emerald-500 shadow-emerald-500/20'}`}>
                      <StepIcon size={10} className="text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="absolute -left-[32px] top-1 w-3.5 h-3.5 bg-slate-100 rounded-full border-2 border-white" />
                  )}
                  <p className={`font-bold text-sm ${done ? (current && !isDelivered ? 'text-blue-600' : 'text-slate-800') : 'text-slate-300'}`}>
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
              View All Orders
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Mini card to pick from a list of recent bookings
function BookingPickerCard({ booking, onClick }) {
  const ServiceIcon = SERVICE_ICONS[booking.service_type] || Bike;
  const isActive = ACTIVE_STATUSES.includes(booking.status);
  return (
    <button
      onClick={() => onClick(booking.id)}
      className={`w-full flex items-center gap-4 bg-white border rounded-2xl p-4 text-left hover:shadow-md transition-all ${isActive ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100'}`}
    >
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        <ServiceIcon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-extrabold text-slate-800 text-sm font-outfit leading-tight truncate">{booking.ref}</p>
        <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
          {booking.pickup_pincode} → {booking.drop_pincode}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {isActive && <span className="text-[8px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>}
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">₹{booking.total_price}</span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Track() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryBookingId = searchParams.get('booking_id');

  const [booking,     setBooking]     = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showPicker,  setShowPicker]  = useState(false);

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem('zynety_user') || 'null'); }
    catch { return null; }
  };

  // Resolve which booking to show: URL → localStorage → latest active
  const resolveAndLoad = useCallback(async () => {
    setLoading(true);
    setError('');

    const user      = getUser();
    const userId    = user?.user_id || user?.id || 0;
    const userEmail = user?.email || '';

    // Priority 1: explicit booking_id (from URL or stored)
    const storedId  = localStorage.getItem('zynety_last_booking_id');
    const targetId  = queryBookingId || storedId;

    if (targetId) {
      try {
        const b = await fetchSingleBooking(targetId);
        setBooking(b);
        setLoading(false);
        return;
      } catch {
        // Single fetch failed — fall through to list approach
      }
    }

    // Priority 2: fetch all user bookings and pick latest active
    if (userId || userEmail) {
      try {
        const all = await fetchAllUserBookings(userId, userEmail);
        setAllBookings(all);

        // Prefer the most recent ACTIVE booking
        const active = all.find(b => ACTIVE_STATUSES.includes(b.status));
        if (active) {
          setBooking(active);
          localStorage.setItem('zynety_last_booking_id', String(active.id));
          setLoading(false);
          return;
        }

        // No active booking — show most recent delivered one or picker
        if (all.length > 0) {
          setShowPicker(true);
        }
      } catch {}
    }

    setLoading(false);
  }, [queryBookingId]);

  useEffect(() => {
    resolveAndLoad();
    const t = setInterval(resolveAndLoad, 30000);
    return () => clearInterval(t);
  }, [resolveAndLoad]);

  const selectBooking = async (id) => {
    setShowPicker(false);
    setLoading(true);
    try {
      const b = await fetchSingleBooking(id);
      setBooking(b);
      localStorage.setItem('zynety_last_booking_id', String(id));
      setSearchParams({ booking_id: id });
    } catch {
      setError('Could not load this booking.');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center gap-4">
        <div className="w-14 h-14 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="font-bold text-slate-500 text-sm">Loading tracking info…</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col h-full bg-slate-50 items-center justify-center p-8 text-center">
        <AlertCircle size={40} className="text-red-400 mb-4" />
        <p className="font-bold text-slate-700 text-base mb-2">Tracking Unavailable</p>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <button onClick={resolveAndLoad} className="flex items-center gap-2 bg-blue-50 text-blue-600 font-bold py-2.5 px-5 rounded-xl text-sm hover:bg-blue-100 transition-colors">
          <RefreshCcw size={14} /> Try Again
        </button>
      </div>
    );
  }

  // ── Booking Picker (no active, but has past bookings) ───────────────────────
  if (!booking && showPicker && allBookings.length > 0) {
    return (
      <div className="flex flex-col h-full bg-slate-50">
        <header className="bg-white border-b border-slate-100 px-5 py-4 sticky top-0 z-10 shadow-sm shrink-0">
          <h1 className="font-extrabold text-lg text-slate-800 font-outfit">Live Tracking</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Select a booking to track</p>
        </header>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1">
            Your Bookings ({allBookings.length})
          </p>
          {allBookings.map(b => (
            <BookingPickerCard key={b.id} booking={b} onClick={selectBooking} />
          ))}
        </div>
      </div>
    );
  }

  // ── Empty State (no bookings at all) ────────────────────────────────────────
  if (!booking) {
    return (
      <div className="flex flex-col h-full bg-[#f1f5f9]">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2rem] m-4 shadow-sm border border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6 border-2 border-dashed border-slate-200">
            <Package size={32} />
          </div>
          <h2 className="text-xl font-outfit font-extrabold text-slate-800 tracking-tight mb-2">No Active Trips</h2>
          <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs mx-auto">
            You don't have any ongoing deliveries. Book a delivery and it will appear here automatically.
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

  // ── Active Tracking View ────────────────────────────────────────────────────
  return (
    <TrackingView
      booking={booking}
      onRefresh={resolveAndLoad}
      onSelectDifferent={allBookings.length > 1 ? () => { setBooking(null); setShowPicker(true); } : null}
    />
  );
}
