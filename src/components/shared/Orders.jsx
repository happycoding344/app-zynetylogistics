import React, { useState, useEffect } from 'react';
import { Package, Search, ChevronRight, CheckCircle2, Clock, Truck, Bike, Globe, PackageCheck, AlertCircle, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'https://zynetylogistics.com/wp-json/zynety/v1';

const STATUS_CONFIG = {
  pending:         { label: 'Pending',         color: 'bg-amber-100 text-amber-700',  icon: Clock },
  confirmed:       { label: 'Confirmed',        color: 'bg-blue-100 text-blue-700',    icon: CheckCircle2 },
  driver_assigned: { label: 'Driver Assigned',  color: 'bg-indigo-100 text-indigo-700',icon: Navigation },
  picked_up:       { label: 'Picked Up',        color: 'bg-purple-100 text-purple-700',icon: PackageCheck },
  in_transit:      { label: 'In Transit',       color: 'bg-orange-100 text-orange-700',icon: Truck },
  delivered:       { label: 'Delivered',        color: 'bg-green-100 text-green-700',  icon: CheckCircle2 },
  cancelled:       { label: 'Cancelled',        color: 'bg-red-100 text-red-700',      icon: AlertCircle },
};

const SERVICE_ICONS = { bike: Bike, truck: Truck, packers: PackageCheck, intercity: Globe };
const SERVICE_LABELS = { bike: 'Two Wheeler', truck: 'Truck', packers: 'Packers & Movers', intercity: 'Intercity' };

function BookingCard({ booking }) {
  const navigate = useNavigate();
  const sc = STATUS_CONFIG[booking.status] || STATUS_CONFIG.confirmed;
  const StatusIcon = sc.icon;
  const ServiceIcon = SERVICE_ICONS[booking.service_type] || Bike;

  const dateStr = new Date(booking.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
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
          <p className="text-sm font-semibold text-slate-700 line-clamp-1">{booking.pickup_address || booking.pickup_pincode}</p>
        </div>
        <div className="relative">
          <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow" />
          <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest mb-0.5">Drop</p>
          <p className="text-sm font-semibold text-slate-700 line-clamp-1">{booking.drop_address || booking.drop_pincode}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{SERVICE_LABELS[booking.service_type] || 'Delivery'}</span>
          {booking.distance_km && (
            <>
              <span className="text-slate-200">•</span>
              <span className="text-[9px] font-black text-slate-400 uppercase">{booking.distance_km} km</span>
            </>
          )}
        </div>
        <span className="font-extrabold text-slate-800 text-base">₹{booking.total_price}</span>
      </div>
    </button>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const savedUser = localStorage.getItem('zynety_user');
        const user = savedUser ? JSON.parse(savedUser) : null;
        const userId = user?.user_id || user?.id || 0;
        const userEmail = user?.email || '';

        if (!userId && !userEmail) {
          setError('Please log in to view your order history.');
          setLoading(false);
          return;
        }

        // Send both user_id and user_email so the API always finds bookings
        // even if user_id was from mock fallback
        const params = new URLSearchParams();
        if (userId) params.set('user_id', userId);
        if (userEmail) params.set('user_email', userEmail);

        const res = await fetch(`${API_BASE}/bookings?${params.toString()}`, {
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const data = await res.json();

        if (data.status === 'success') {
          setBookings(data.bookings || []);
        } else {
          throw new Error(data.message || 'Failed to fetch orders');
        }
      } catch (e) {
        console.error('Orders fetch error:', e);
        setError('Unable to load orders. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#fcfdfe] relative pb-16 max-w-4xl mx-auto w-full">
      <header className="h-16 flex border-b border-gray-100 bg-white items-center px-6 sticky top-0 z-20 shadow-sm justify-between shrink-0">
        <h1 className="text-xl font-outfit font-extrabold text-slate-800 tracking-tight">Order History</h1>
        <button
          onClick={() => navigate('/book-select')}
          className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
        >
          + New Booking
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse">
                <div className="flex gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-2 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2">
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

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-12 px-4 bg-red-50 border border-red-100 rounded-3xl">
            <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-700 mb-1">Could not load orders</h3>
            <p className="text-sm text-red-500 font-medium">{error}</p>
          </div>
        )}

        {/* Bookings list */}
        {!loading && !error && bookings.length > 0 && (
          <>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 pb-1">{bookings.length} booking{bookings.length > 1 ? 's' : ''} found</p>
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
              Your logistics history will appear here once you place a delivery request.
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
