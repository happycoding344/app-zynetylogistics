import React, { useState, useEffect, useCallback } from 'react';
import {
  Package, ChevronRight, CheckCircle2, Clock, Truck, Bike,
  Globe, PackageCheck, AlertCircle, Navigation, RefreshCcw, Wifi, WifiOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CUSTOM_API  = 'https://zynetylogistics.com/wp-json/zynety/v1';
const WP_REST_API = 'https://zynetylogistics.com/wp-json/wp/v2/zynety_booking';

const STATUS_CONFIG = {
  pending:         { label: 'Pending',        color: 'bg-amber-100 text-amber-700',   icon: Clock },
  confirmed:       { label: 'Confirmed',       color: 'bg-blue-100 text-blue-700',     icon: CheckCircle2 },
  driver_assigned: { label: 'Driver Assigned', color: 'bg-indigo-100 text-indigo-700', icon: Navigation },
  picked_up:       { label: 'Picked Up',       color: 'bg-purple-100 text-purple-700', icon: PackageCheck },
  in_transit:      { label: 'In Transit',      color: 'bg-orange-100 text-orange-700', icon: Truck },
  delivered:       { label: 'Delivered',       color: 'bg-green-100 text-green-700',   icon: CheckCircle2 },
  cancelled:       { label: 'Cancelled',       color: 'bg-red-100 text-red-700',       icon: AlertCircle },
};

const SERVICE_ICONS  = { bike: Bike, truck: Truck, packers: PackageCheck, intercity: Globe };
const SERVICE_LABELS = { bike: 'Two Wheeler', truck: 'Truck', packers: 'Packers & Movers', intercity: 'Intercity' };

// Normalise a booking from any source into a common shape
function normalise(raw, fromWP = false) {
  if (fromWP) {
    const m = raw.meta || {};
    return {
      id:             raw.id,
      ref:            raw.title?.rendered || raw.title || `#${raw.id}`,
      date:           raw.date,
      pickup_address: m.pickup_address || '',
      pickup_pincode: m.pickup_pincode || '',
      drop_address:   m.drop_address   || '',
      drop_pincode:   m.drop_pincode   || '',
      service_type:   m.service_type   || 'bike',
      total_price:    m.total_price    || 0,
      distance_km:    m.distance_km    || '',
      status:         m.status         || 'confirmed',
      payment_id:     m.payment_id     || '',
      driver_name:    m.driver_name    || '',
    };
  }
  return raw; // custom API already returns the right shape
}

// ── Strategy 1: Custom Zynety endpoint ───────────────────────────────────────
async function fetchViaCustomApi(userId, userEmail) {
  const params = new URLSearchParams();
  if (userId)    params.set('user_id',    userId);
  if (userEmail) params.set('user_email', userEmail);

  const res = await fetch(`${CUSTOM_API}/bookings?${params}`, {
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`custom_api_${res.status}`);
  const data = await res.json();
  if (data.status !== 'success') throw new Error('custom_api_bad_response');
  return (data.bookings || []).map(b => normalise(b, false));
}

// ── Strategy 2: WordPress built-in REST API (/wp/v2/zynety_booking) ──────────
async function fetchViaWpRestApi(userId, userEmail) {
  // Try by author (WordPress user ID)
  if (userId && userId > 1) {
    const res = await fetch(
      `${WP_REST_API}?author=${userId}&per_page=100&_fields=id,title,date,meta&orderby=date&order=desc`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map(b => normalise(b, true));
      }
    }
  }

  // Try search by email via meta
  if (userEmail) {
    const res = await fetch(
      `${WP_REST_API}?per_page=100&_fields=id,title,date,meta&orderby=date&order=desc`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (res.ok) {
      const all = await res.json();
      if (Array.isArray(all)) {
        const mine = all.filter(b => b.meta?.user_email === userEmail);
        return mine.map(b => normalise(b, true));
      }
    }
  }

  throw new Error('wp_rest_no_results');
}

// ── Strategy 3: LocalStorage cache ───────────────────────────────────────────
function loadCached(userEmail) {
  try {
    const key  = `zynety_orders_${userEmail}`;
    const raw  = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveCache(userEmail, bookings) {
  try {
    const key = `zynety_orders_${userEmail}`;
    localStorage.setItem(key, JSON.stringify(bookings));
  } catch {}
}

// ─────────────────────────────────────────────────────────────────────────────

function BookingCard({ booking }) {
  const navigate  = useNavigate();
  const sc        = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
  const StatusIcon  = sc.icon;
  const ServiceIcon = SERVICE_ICONS[booking.service_type] || Bike;

  const dateStr = new Date(booking.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <button
      onClick={() => navigate(`/track?booking_id=${booking.id}`)}
      className="w-full bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ServiceIcon size={20} />
          </div>
          <div>
            <p className="font-extrabold text-slate-800 text-sm font-outfit leading-tight">{booking.ref}</p>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{dateStr}</p>
          </div>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 ${sc.color}`}>
          <StatusIcon size={10} /> {sc.label}
        </span>
      </div>

      <div className="relative pl-5 border-l-2 border-slate-100 ml-2 space-y-3">
        <div className="relative">
          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
          <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-0.5">Pickup</p>
          <p className="text-sm font-semibold text-slate-700 line-clamp-1">{booking.pickup_address || booking.pickup_pincode || '—'}</p>
        </div>
        <div className="relative">
          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow" />
          <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-0.5">Drop</p>
          <p className="text-sm font-semibold text-slate-700 line-clamp-1">{booking.drop_address || booking.drop_pincode || '—'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{SERVICE_LABELS[booking.service_type] || 'Delivery'}</span>
          {booking.distance_km && (
            <><span className="text-slate-200">•</span>
            <span className="text-[9px] font-black text-slate-400 uppercase">{booking.distance_km} km</span></>
          )}
        </div>
        <span className="font-extrabold text-slate-800 text-base">₹{booking.total_price}</span>
      </div>
    </button>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [source,      setSource]      = useState('');   // which strategy worked
  const [fromCache,   setFromCache]   = useState(false);

  const getUser = () => {
    try {
      const raw = localStorage.getItem('zynety_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    setFromCache(false);

    const user      = getUser();
    const userId    = user?.user_id || user?.id || 0;
    const userEmail = user?.email || '';

    if (!userId && !userEmail) {
      setError('Please log in to view your order history.');
      setLoading(false);
      return;
    }

    // ── Strategy 1: Custom Zynety API ────────────────────────────────────────
    try {
      const results = await fetchViaCustomApi(userId, userEmail);
      setBookings(results);
      setSource('Zynety API');
      if (results.length > 0 && userEmail) saveCache(userEmail, results);
      setLoading(false);
      return;
    } catch (e1) {
      console.warn('Strategy 1 failed:', e1.message);
    }

    // ── Strategy 2: WP Built-in REST API ─────────────────────────────────────
    try {
      const results = await fetchViaWpRestApi(userId, userEmail);
      setBookings(results);
      setSource('WP REST API');
      if (results.length > 0 && userEmail) saveCache(userEmail, results);
      setLoading(false);
      return;
    } catch (e2) {
      console.warn('Strategy 2 failed:', e2.message);
    }

    // ── Strategy 3: LocalStorage Cache ───────────────────────────────────────
    const cached = loadCached(userEmail);
    if (cached.length > 0) {
      setBookings(cached);
      setSource('Offline Cache');
      setFromCache(true);
      setLoading(false);
      return;
    }

    // ── All failed ────────────────────────────────────────────────────────────
    setError('Unable to connect to server. Please check your connection.');
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe] relative pb-16 max-w-4xl mx-auto w-full">
      <header className="h-16 flex border-b border-gray-100 bg-white items-center px-6 sticky top-0 z-20 shadow-sm justify-between shrink-0">
        <h1 className="text-xl font-outfit font-extrabold text-slate-800 tracking-tight">Order History</h1>
        <div className="flex items-center gap-2">
          {fromCache && (
            <span className="flex items-center gap-1 text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50 border border-amber-100 px-2 py-1 rounded-full">
              <WifiOff size={9} /> Cached
            </span>
          )}
          {source && !fromCache && (
            <span className="flex items-center gap-1 text-[9px] font-black text-green-500 uppercase tracking-widest bg-green-50 border border-green-100 px-2 py-1 rounded-full">
              <Wifi size={9} /> Live
            </span>
          )}
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-40"
          >
            <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => navigate('/book-select')}
            className="text-xs font-bold text-white bg-blue-600 border border-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-2 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2 pl-5">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/6" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="text-center py-10 px-6 bg-red-50 border border-red-100 rounded-3xl">
            <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-700 mb-1">Could not load orders</h3>
            <p className="text-sm text-red-500 font-medium mb-5">{error}</p>
            <button
              onClick={fetchOrders}
              className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2.5 px-5 rounded-xl text-sm flex items-center gap-2 mx-auto transition-colors"
            >
              <RefreshCcw size={14} /> Try Again
            </button>
          </div>
        )}

        {/* Cached data warning */}
        {!loading && fromCache && bookings.length > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
            <WifiOff size={16} className="text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-amber-600">Showing cached data — tap Refresh when connected to get latest updates.</p>
          </div>
        )}

        {/* Bookings list */}
        {!loading && !error && bookings.length > 0 && (
          <>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 pb-1">
              {bookings.length} booking{bookings.length > 1 ? 's' : ''}
            </p>
            {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
          </>
        )}

        {/* Empty state */}
        {!loading && !error && bookings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center border-2 border-dashed border-slate-200 rounded-3xl mt-4">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full mx-auto flex items-center justify-center mb-4">
              <Package size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-2">No orders yet</h3>
            <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed mb-6">
              Your delivery history will appear here after you place your first booking.
            </p>
            <button
              onClick={() => navigate('/book-select')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
            >
              Book Your First Delivery
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
