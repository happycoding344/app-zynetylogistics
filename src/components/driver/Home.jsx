import React, { useState, useEffect } from 'react';
import { Power, MapPin, Navigation, CheckCircle2, ChevronRight, Phone, AlertCircle } from 'lucide-react';

const API_BASE = 'https://zynetylogistics.com/wp-json/zynety/v1';
const SERVICE_LABELS = { bike: 'Two Wheeler', truck: 'Truck', packers: 'Packers & Movers', intercity: 'Intercity' };

export default function DriverHome({ user }) {
  const [isOnline, setIsOnline] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(null);

  const fetchRequests = async () => {
    if (!isOnline) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/driver-requests`);
      if (!res.ok) throw new Error(`Server: ${res.status}`);
      const data = await res.json();
      if (data.status === 'success') setRequests(data.requests || []);
    } catch (e) {
      setError('Could not fetch delivery requests. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOnline) {
      fetchRequests();
      const t = setInterval(fetchRequests, 20000); // poll every 20s
      return () => clearInterval(t);
    }
  }, [isOnline]);

  const acceptRequest = async (req) => {
    setAccepting(req.id);
    try {
      const driverName = user?.display_name || user?.email?.split('@')[0] || 'Driver';
      const res = await fetch(`${API_BASE}/bookings/${req.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'driver_assigned',
          driver_id: user?.user_id || 0,
          driver_name: driverName,
        }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        // Remove accepted request from list
        setRequests(prev => prev.filter(r => r.id !== req.id));
      }
    } catch (e) {
      alert('Failed to accept. Please try again.');
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className="flex flex-col h-full relative pb-16">
      {/* Header Card */}
      <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl shadow-slate-900/20 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/20 rounded-bl-full filter blur-3xl" />
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div>
            <h2 className="text-2xl font-outfit font-extrabold tracking-tight">Driver Dashboard</h2>
            <p className="text-slate-400 font-medium text-sm mt-1">{user?.email || 'Partner'}</p>
          </div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isOnline ? 'bg-green-500 text-white shadow-green-500/30' : 'bg-slate-800 text-slate-400'}`}
          >
            <Power size={24} strokeWidth={3} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Status</p>
            <p className="text-lg font-black text-white flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
              {isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-md p-4 rounded-2xl border border-slate-700/50">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-1">Requests</p>
            <p className="text-lg font-black text-white">{isOnline ? requests.length : '---'}</p>
          </div>
        </div>
      </div>

      {/* Requests Section */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-extrabold text-slate-800 font-outfit text-lg tracking-tight">Available Requests</h3>
        {isOnline && (
          <button onClick={fetchRequests} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
            Refresh
          </button>
        )}
      </div>

      {/* Offline */}
      {!isOnline && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4">
            <Power size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">You are Offline</h3>
          <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">
            Tap the power button above to go online and start receiving new delivery requests.
          </p>
        </div>
      )}

      {/* Loading */}
      {isOnline && loading && requests.length === 0 && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 animate-pulse">
              <div className="h-4 bg-slate-100 rounded w-1/2 mb-3" />
              <div className="h-3 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {isOnline && error && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-5 text-center">
          <AlertCircle size={28} className="text-red-400 mx-auto mb-2" />
          <p className="text-red-600 text-sm font-bold">{error}</p>
        </div>
      )}

      {/* Empty */}
      {isOnline && !loading && !error && requests.length === 0 && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center flex flex-col items-center animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-4 animate-pulse">
            <Navigation size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Listening for requests...</h3>
          <p className="text-sm font-medium text-slate-500 max-w-xs leading-relaxed">
            Stay online to receive new delivery assignments. Refreshing automatically every 20 seconds.
          </p>
        </div>
      )}

      {/* Request Cards */}
      {isOnline && requests.length > 0 && (
        <div className="space-y-4 overflow-y-auto">
          {requests.map(req => (
            <div key={req.id} className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-extrabold text-slate-800 font-outfit">{req.ref}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                    {SERVICE_LABELS[req.service_type] || 'Delivery'}
                    {req.distance_km ? ` · ${req.distance_km} km` : ''}
                  </p>
                </div>
                <span className="font-black text-lg text-blue-600">₹{req.total_price}</span>
              </div>

              <div className="relative pl-5 border-l-2 border-slate-100 ml-2 space-y-3 mb-5">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Pickup · {req.pickup_pincode}</p>
                  <p className="text-sm font-semibold text-slate-700 line-clamp-1">{req.pickup_address}</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-purple-500 border-2 border-white shadow" />
                  <p className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Drop · {req.drop_pincode}</p>
                  <p className="text-sm font-semibold text-slate-700 line-clamp-1">{req.drop_address}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={`tel:${req.sender_phone}`}
                  className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm hover:bg-slate-100 transition-colors"
                >
                  <Phone size={14} /> Call
                </a>
                <button
                  onClick={() => acceptRequest(req)}
                  disabled={accepting === req.id}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-green-600/20"
                >
                  {accepting === req.id ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Accepting…</>
                  ) : (
                    <><CheckCircle2 size={16} /> Accept Delivery</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
